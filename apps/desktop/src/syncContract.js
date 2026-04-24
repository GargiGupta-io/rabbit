const ALLOWED_SYNC_STATUSES = new Set(['local', 'pending', 'syncing', 'synced', 'failed']);
const ALLOWED_TASK_ACTIONS = new Set(['create', 'update', 'complete', 'delete']);
const ALLOWED_RECURRENCE_PATTERNS = new Set(['none', 'daily', 'weekly']);
const DEFAULT_TASK_DURATION_MINUTES = 30;
const MIN_TASK_DURATION_MINUTES = 5;
const MAX_TASK_DURATION_MINUTES = 720;
const DEFAULT_SYNC_EVENT_VERSION = 1;
const SYNC_STREAMS = Object.freeze(['tasks']);
const CURRENT_SYNC_SESSION_ID = createSyncSessionId();

const SYNC_EVENT_TYPE_BY_ACTION = Object.freeze({
  create: 'task.created',
  update: 'task.updated',
  complete: 'task.updated',
  delete: 'task.deleted'
});

const PUSH_EVENT_TYPE_BY_ACTION = Object.freeze({
  create: 'push.task.create',
  update: 'push.task.update',
  complete: 'push.task.update',
  delete: 'push.task.delete'
});

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function normalizeDate(value, fallback = null) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return fallback;
  }

  return parsed.toISOString();
}

function clampDuration(value = DEFAULT_TASK_DURATION_MINUTES) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TASK_DURATION_MINUTES;
  }

  return Math.min(
    MAX_TASK_DURATION_MINUTES,
    Math.max(MIN_TASK_DURATION_MINUTES, Math.floor(parsed / MIN_TASK_DURATION_MINUTES) * MIN_TASK_DURATION_MINUTES)
  );
}

function normalizeRecurrence(input = {}) {
  if (!isPlainObject(input)) {
    return { pattern: 'none', interval: 1, endAt: null };
  }

  const pattern = sanitizeText(input.pattern, 'none');
  const interval = Math.max(1, Number(input.interval) || 1);
  return {
    pattern: ALLOWED_RECURRENCE_PATTERNS.has(pattern) ? pattern : 'none',
    interval,
    endAt: normalizeDate(input.endAt)
  };
}

function normalizeStringArray(value = []) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => sanitizeText(entry))
    .filter(Boolean);
}

function normalizeNullableNumber(value) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeIdPart(value, fallback = 'unknown') {
  const normalized = sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || fallback;
}

function normalizeAction(value) {
  const candidate = sanitizeText(value).toLowerCase();
  return ALLOWED_TASK_ACTIONS.has(candidate) ? candidate : null;
}

function inferActionFromType(value) {
  const candidate = sanitizeText(value).toLowerCase();
  if (!candidate) {
    return null;
  }

  if (ALLOWED_TASK_ACTIONS.has(candidate)) {
    return candidate;
  }

  if (candidate === 'task.created' || candidate === 'push.task.create') {
    return 'create';
  }

  if (candidate === 'task.updated' || candidate === 'push.task.update') {
    return 'update';
  }

  if (candidate === 'task.deleted' || candidate === 'push.task.delete') {
    return 'delete';
  }

  return null;
}

function getSyncEventTypeForAction(action) {
  return SYNC_EVENT_TYPE_BY_ACTION[action] || null;
}

function getPushEventTypeForAction(action) {
  return PUSH_EVENT_TYPE_BY_ACTION[action] || null;
}

function normalizeDeviceId(value, fallback = 'unknown') {
  const candidate = sanitizeText(value);
  if (!candidate || candidate === 'unknown') {
    return sanitizeText(fallback, 'unknown');
  }
  return candidate;
}

function normalizeSyncVersion(value, fallback = DEFAULT_SYNC_EVENT_VERSION) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function normalizeTaskSnapshot(task = {}) {
  if (!isPlainObject(task)) {
    return null;
  }

  const id = sanitizeText(task.id);
  if (!id) {
    return null;
  }

  return {
    id,
    title: sanitizeText(task.title),
    description: sanitizeText(task.description),
    projectId: sanitizeText(task.projectId, 'inbox'),
    projectName: sanitizeText(task.projectName),
    projectDefinitionId: sanitizeText(task.projectDefinitionId) || null,
    workspaceId: sanitizeText(task.workspaceId, 'ws_private_my_tasks'),
    assigneeUserId: sanitizeText(task.assigneeUserId) || null,
    status: sanitizeText(task.status, 'todo'),
    statusId: sanitizeText(task.statusId) || null,
    priorityLevel: sanitizeText(task.priorityLevel) || null,
    deadlineType: sanitizeText(task.deadlineType) || null,
    dueAt: normalizeDate(task.dueAt),
    startAt: normalizeDate(task.startAt),
    startOn: sanitizeText(task.startOn) || null,
    scheduledStart: normalizeDate(task.scheduledStart),
    scheduledEnd: normalizeDate(task.scheduledEnd),
    durationMinutes: clampDuration(task.durationMinutes),
    minimumDuration: normalizeNullableNumber(task.minimumDuration),
    scheduleId: sanitizeText(task.scheduleId) || null,
    scheduleOverridden: Boolean(task.scheduleOverridden),
    scheduledStatus: sanitizeText(task.scheduledStatus) || null,
    isAutoScheduled: Boolean(task.isAutoScheduled),
    isFixedTimeTask: Boolean(task.isFixedTimeTask),
    isBusy: Boolean(task.isBusy),
    needsReschedule: Boolean(task.needsReschedule),
    recurrence: normalizeRecurrence(task.recurrence),
    stageDefinitionId: sanitizeText(task.stageDefinitionId) || null,
    taskDefinitionId: sanitizeText(task.taskDefinitionId) || null,
    blockingTaskIds: normalizeStringArray(task.blockingTaskIds),
    blockedByTaskIds: normalizeStringArray(task.blockedByTaskIds),
    labelIds: normalizeStringArray(task.labelIds),
    completedTime: normalizeDate(task.completedTime),
    archivedTime: normalizeDate(task.archivedTime),
    createdAt: normalizeDate(task.createdAt),
    updatedAt: normalizeDate(task.updatedAt)
  };
}

function buildStatusTransition(previousTask, task) {
  return {
    from: previousTask?.status || null,
    to: task?.status || null
  };
}

function createDeletedPartial(task, entityId, occurredAt) {
  return {
    tasks: {
      [entityId]: {
        id: entityId,
        deletedTime: normalizeDate(
          task?.archivedTime || task?.updatedAt || occurredAt,
          occurredAt
        )
      }
    }
  };
}

function buildSyncEventData(action, entityId, task, occurredAt, rawData = null) {
  if (isPlainObject(rawData)) {
    return rawData;
  }

  if (action === 'delete') {
    return {
      partials: createDeletedPartial(task, entityId, occurredAt)
    };
  }

  return {
    models: {
      tasks: {
        [entityId]: task
      }
    }
  };
}

function buildSyncMetadata(raw = {}, context = {}) {
  const incoming = isPlainObject(raw) ? raw : {};
  return {
    ...(isPlainObject(incoming.metadata) ? incoming.metadata : {}),
    entityType: 'task',
    entityId: context.entityId,
    action: context.action,
    revision: context.revision,
    occurredAt: context.occurredAt,
    deviceId: context.deviceId,
    sessionId: context.sessionId,
    streams: SYNC_STREAMS.slice(),
    syncType: context.syncType,
    pushType: context.pushType
  };
}

export function createStableDeviceId() {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
}

export function createSyncSessionId() {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
}

export function getCurrentSyncSessionId() {
  return CURRENT_SYNC_SESSION_ID;
}

export function createMutationRevision(prefix = 'mut') {
  return `${sanitizeIdPart(prefix, 'mut')}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
}

export function createSyncEventId({ action, entityId, revision } = {}) {
  return `sync_${sanitizeIdPart(action)}_${sanitizeIdPart(entityId)}_${sanitizeIdPart(revision)}`;
}

export function normalizeSyncStatus(value, { outbox = [] } = {}) {
  const candidate = sanitizeText(value).toLowerCase();

  if (Array.isArray(outbox) && outbox.length > 0) {
    if (candidate === 'failed' || candidate === 'syncing') {
      return candidate;
    }
    return 'pending';
  }

  return ALLOWED_SYNC_STATUSES.has(candidate) ? candidate : 'local';
}

export function normalizeSyncEvent(raw = {}, options = {}) {
  const payload = isPlainObject(raw) ? raw : {};
  const action = normalizeAction(payload.action) || inferActionFromType(payload.type) || inferActionFromType(payload.pushType);
  const task = normalizeTaskSnapshot(payload?.payload?.task || payload.task || payload?.data?.models?.tasks?.[payload.entityId]);
  const previousTask = normalizeTaskSnapshot(payload?.payload?.previousTask || payload.previousTask);
  const entityId = sanitizeText(
    payload.entityId ||
      payload?.metadata?.entityId ||
      task?.id
  );

  if (!action || !entityId) {
    return null;
  }

  const revision = sanitizeText(payload.revision || payload?.metadata?.revision, createMutationRevision());
  const occurredAt = normalizeDate(payload.occurredAt || payload?.metadata?.occurredAt, nowIso());
  const deviceId = normalizeDeviceId(payload.deviceId || payload?.metadata?.deviceId, options.deviceId);
  const sessionId = sanitizeText(
    payload.sessionId || payload?.metadata?.sessionId,
    sanitizeText(options.sessionId, CURRENT_SYNC_SESSION_ID)
  );
  const syncType = sanitizeText(
    payload.type && !String(payload.type).startsWith('push.') ? payload.type : payload.eventType,
    getSyncEventTypeForAction(action)
  );
  const pushType = sanitizeText(
    payload.pushType || (typeof payload.type === 'string' && payload.type.startsWith('push.') ? payload.type : ''),
    getPushEventTypeForAction(action)
  );
  const version = normalizeSyncVersion(payload.$version || payload.version);
  const data = buildSyncEventData(action, entityId, task, occurredAt, payload.data);
  const metadata = buildSyncMetadata(payload, {
    entityId,
    action,
    revision,
    occurredAt,
    deviceId,
    sessionId,
    syncType,
    pushType
  });

  return {
    id: sanitizeText(payload.id, createSyncEventId({ action, entityId, revision })),
    $version: version,
    type: syncType,
    pushType,
    streams: SYNC_STREAMS.slice(),
    entityType: 'task',
    entityId,
    action,
    revision,
    occurredAt,
    deviceId,
    sessionId,
    data,
    metadata,
    payload: {
      task,
      previousTask,
      statusTransition: buildStatusTransition(previousTask, task)
    }
  };
}

export function toPushSyncEvent(event = {}) {
  const normalized = normalizeSyncEvent(event, {
    deviceId: event.deviceId,
    sessionId: event.sessionId
  });

  if (!normalized) {
    return null;
  }

  return {
    id: normalized.id,
    $version: normalized.$version,
    type: normalized.pushType,
    data: normalized.data,
    metadata: {
      ...normalized.metadata,
      syncType: normalized.type
    }
  };
}

export function normalizeOutbox(outbox = [], options = {}) {
  if (!Array.isArray(outbox)) {
    return [];
  }

  const seenIds = new Set();
  const seenRevisionKeys = new Set();

  return outbox
    .map((entry) => normalizeSyncEvent(entry, options))
    .filter(Boolean)
    .filter((event) => {
      const revisionKey = `${event.entityType}:${event.entityId}:${event.pushType}:${event.revision}`;
      if (seenIds.has(event.id) || seenRevisionKeys.has(revisionKey)) {
        return false;
      }
      seenIds.add(event.id);
      seenRevisionKeys.add(revisionKey);
      return true;
    })
    .sort((left, right) => new Date(left.occurredAt).valueOf() - new Date(right.occurredAt).valueOf());
}

export function appendOutboxEvent(outbox = [], event, options = {}) {
  const next = Array.isArray(outbox) ? outbox.slice() : [];
  next.push(event);
  return normalizeOutbox(next, options);
}

export function normalizeSyncState(raw = {}, options = {}) {
  const payload = isPlainObject(raw) ? raw : {};
  const deviceId = normalizeDeviceId(payload.deviceId, options.deviceId);
  const outbox = normalizeOutbox(payload.outbox, {
    deviceId,
    sessionId: options.sessionId
  });

  return {
    outbox,
    lastSyncAt: normalizeDate(payload.lastSyncAt),
    syncCursor: sanitizeText(payload.syncCursor) || null,
    deviceId,
    syncStatus: normalizeSyncStatus(payload.syncStatus || payload.syncState || payload?.metadata?.syncState, {
      outbox
    })
  };
}

export function createTaskSyncEvent({
  action,
  task,
  previousTask = null,
  deviceId,
  sessionId = CURRENT_SYNC_SESSION_ID,
  occurredAt,
  revision
} = {}) {
  const normalizedTask = normalizeTaskSnapshot(task);
  if (!normalizedTask) {
    return null;
  }

  return normalizeSyncEvent(
    {
      action,
      entityType: 'task',
      entityId: normalizedTask.id,
      revision,
      occurredAt,
      deviceId,
      sessionId,
      payload: {
        task: normalizedTask,
        previousTask: normalizeTaskSnapshot(previousTask)
      }
    },
    { deviceId, sessionId }
  );
}
