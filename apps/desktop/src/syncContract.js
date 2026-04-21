const ALLOWED_SYNC_STATUSES = new Set(['local', 'pending', 'syncing', 'synced', 'failed']);
const ALLOWED_TASK_ACTIONS = new Set(['create', 'update', 'complete', 'delete']);
const ALLOWED_RECURRENCE_PATTERNS = new Set(['none', 'daily', 'weekly']);
const DEFAULT_TASK_DURATION_MINUTES = 30;
const MIN_TASK_DURATION_MINUTES = 5;
const MAX_TASK_DURATION_MINUTES = 720;
const CURRENT_SYNC_SESSION_ID = createSyncSessionId();

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

function normalizeDeviceId(value, fallback = 'unknown') {
  const candidate = sanitizeText(value);
  if (!candidate || candidate === 'unknown') {
    return sanitizeText(fallback, 'unknown');
  }
  return candidate;
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
    status: sanitizeText(task.status, 'todo'),
    dueAt: normalizeDate(task.dueAt),
    startAt: normalizeDate(task.startAt),
    durationMinutes: clampDuration(task.durationMinutes),
    recurrence: normalizeRecurrence(task.recurrence),
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
  const action = normalizeAction(payload.action || payload.type);
  const task = normalizeTaskSnapshot(payload?.payload?.task || payload.task);
  const previousTask = normalizeTaskSnapshot(payload?.payload?.previousTask || payload.previousTask);
  const entityId = sanitizeText(payload.entityId || task?.id);

  if (!action || !entityId) {
    return null;
  }

  const revision = sanitizeText(payload.revision, createMutationRevision());
  const occurredAt = normalizeDate(payload.occurredAt, nowIso());
  const deviceId = normalizeDeviceId(payload.deviceId, options.deviceId);
  const sessionId = sanitizeText(payload.sessionId, sanitizeText(options.sessionId, CURRENT_SYNC_SESSION_ID));

  return {
    id: sanitizeText(payload.id, createSyncEventId({ action, entityId, revision })),
    entityType: 'task',
    entityId,
    action,
    revision,
    occurredAt,
    deviceId,
    sessionId,
    payload: {
      task,
      previousTask,
      statusTransition: buildStatusTransition(previousTask, task)
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
      const revisionKey = `${event.entityType}:${event.entityId}:${event.action}:${event.revision}`;
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
