import { createMotionKey } from './apiClient.js';
import { normalizeOutbox, toPushSyncEvent } from './syncContract.js';

const POWER_SYNC_TABLE_BY_ENTITY = Object.freeze({
  task: 'tasks'
});

const POWER_SYNC_OPERATION_BY_ACTION = Object.freeze({
  create: 'PUT',
  update: 'PATCH',
  complete: 'PATCH',
  delete: 'DELETE'
});

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)])
    );
  }

  return value;
}

function normalizeNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}

function normalizeOperationType(value) {
  const candidate = sanitizeText(value).toUpperCase();
  if (candidate === 'PUT' || candidate === 'PATCH' || candidate === 'DELETE') {
    return candidate;
  }
  return null;
}

function getPowerSyncTableName(entityType = 'task') {
  return POWER_SYNC_TABLE_BY_ENTITY[sanitizeText(entityType, 'task')] || 'tasks';
}

function getPowerSyncOperationName(action = 'update') {
  return POWER_SYNC_OPERATION_BY_ACTION[sanitizeText(action, 'update')] || 'PATCH';
}

function parseOperationMetadata(metadata) {
  if (isPlainObject(metadata)) {
    return cloneValue(metadata);
  }

  const serialized = sanitizeText(metadata);
  if (!serialized) {
    return {};
  }

  try {
    const parsed = JSON.parse(serialized);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function serializeOperationMetadata(metadata = {}) {
  return JSON.stringify(isPlainObject(metadata) ? metadata : {});
}

function normalizePowerSyncCrudOperation(raw = {}) {
  const payload = isPlainObject(raw) ? raw : {};
  const metadataObject = parseOperationMetadata(payload.metadata);

  return {
    op_id: normalizeNumber(payload.op_id, 0),
    op: normalizeOperationType(payload.op) || 'PATCH',
    type: sanitizeText(payload.type, 'tasks'),
    id: sanitizeText(payload.id),
    tx_id: normalizeNumber(payload.tx_id),
    data: isPlainObject(payload.data) ? cloneValue(payload.data) : undefined,
    old: isPlainObject(payload.old) ? cloneValue(payload.old) : undefined,
    metadata: serializeOperationMetadata(metadataObject),
    metadataObject
  };
}

function normalizeResponseEntry(entry = {}) {
  const payload = isPlainObject(entry) ? entry : {};
  const success = payload.success !== false;
  return {
    id: sanitizeText(payload.id) || null,
    success,
    data: cloneValue(payload.data),
    metadata: isPlainObject(payload.metadata) ? cloneValue(payload.metadata) : {},
    error: success ? null : (payload.error ?? 'Sync push failed.')
  };
}

function remapTaskModel(task = {}, taskIdMap = {}) {
  if (!isPlainObject(task)) {
    return task;
  }

  const currentId = sanitizeText(task.id);
  const nextId = taskIdMap[currentId] || currentId || task.id;

  return {
    ...cloneValue(task),
    id: nextId,
    blockingTaskIds: Array.isArray(task.blockingTaskIds)
      ? task.blockingTaskIds.map((id) => taskIdMap[sanitizeText(id)] || id)
      : [],
    blockedByTaskIds: Array.isArray(task.blockedByTaskIds)
      ? task.blockedByTaskIds.map((id) => taskIdMap[sanitizeText(id)] || id)
      : []
  };
}

function normalizePowerSyncErrorEntry(entry = {}, operationMap = new Map()) {
  const payload = isPlainObject(entry) ? entry : {};
  const operationId = normalizeNumber(payload.operation, 0);
  const operation = operationMap.get(operationId) || null;
  const metadata = operation?.metadataObject || {};

  return {
    operationId,
    error: sanitizeText(payload.error, 'PowerSync upload failed.'),
    eventId: sanitizeText(metadata.eventId) || null,
    entityId: sanitizeText(metadata.entityId) || sanitizeText(operation?.id) || null,
    table: sanitizeText(operation?.type) || null,
    op: sanitizeText(operation?.op) || null
  };
}

function normalizeIdMapping(entry = {}) {
  const payload = isPlainObject(entry) ? entry : {};
  const tempId = sanitizeText(payload.tempId);
  const realId = sanitizeText(payload.realId);
  const table = sanitizeText(payload.table, 'tasks');

  if (!tempId || !realId) {
    return null;
  }

  return {
    tempId,
    realId,
    table
  };
}

export const queryKeys = {
  root: createMotionKey('sync-events'),
  push: () => createMotionKey(queryKeys.root, 'push'),
  powersyncUpload: () => createMotionKey('powersync', 'upload')
};

export function createPushEventBatchRequest(outbox = []) {
  const events = normalizeOutbox(outbox)
    .map((event) => toPushSyncEvent(event))
    .filter(Boolean);

  return {
    key: queryKeys.push(),
    events,
    eventTypes: [...new Set(events.map((event) => event.type))],
    eventCount: events.length
  };
}

export function createPowerSyncUploadRequest(outbox = [], options = {}) {
  const events = normalizeOutbox(outbox);
  const txId = normalizeNumber(options.txId, events.length ? Date.parse(events[0].occurredAt) || Date.now() : Date.now());
  const operations = events.map((event, index) => {
    const operationName = getPowerSyncOperationName(event.action);
    const table = getPowerSyncTableName(event.entityType);
    const currentTask = event?.data?.models?.tasks?.[event.entityId] || event?.payload?.task || null;
    const previousTask = event?.payload?.previousTask || event?.payload?.task || null;

    return normalizePowerSyncCrudOperation({
      op_id: index + 1,
      op: operationName,
      type: table,
      id: event.entityId,
      tx_id: txId,
      data: operationName === 'DELETE' ? undefined : currentTask,
      old: operationName === 'DELETE' ? previousTask || { id: event.entityId } : undefined,
      metadata: serializeOperationMetadata({
        eventId: event.id,
        entityType: event.entityType,
        entityId: event.entityId,
        action: event.action,
        syncType: event.type,
        pushType: event.pushType,
        revision: event.revision,
        occurredAt: event.occurredAt,
        deviceId: event.deviceId,
        sessionId: event.sessionId
      })
    });
  });

  return {
    key: queryKeys.powersyncUpload(),
    txId,
    operations,
    body: {
      operations: operations.map(({ metadataObject, ...operation }) => operation)
    },
    eventCount: events.length,
    operationCount: operations.length,
    operationTypes: [...new Set(operations.map((operation) => operation.op))],
    tables: [...new Set(operations.map((operation) => operation.type))]
  };
}

export function normalizePushEventBatchResponse(raw = {}) {
  const entries = Array.isArray(raw?.events) ? raw.events : [];
  const events = entries.map((entry) => normalizeResponseEntry(entry));
  const acknowledgedIds = events
    .filter((entry) => entry.success && entry.id)
    .map((entry) => entry.id);
  const failedIds = events
    .filter((entry) => !entry.success && entry.id)
    .map((entry) => entry.id);

  return {
    events,
    acknowledgedIds,
    failedIds,
    successCount: acknowledgedIds.length,
    failureCount: events.length - acknowledgedIds.length,
    hasFailures: events.some((entry) => !entry.success),
    allSucceeded: events.length > 0 && events.every((entry) => entry.success)
  };
}

export function normalizePowerSyncUploadResponse(raw = {}, request = {}) {
  const payload = isPlainObject(raw) ? raw : {};
  const operations = Array.isArray(request?.operations)
    ? request.operations.map((operation) => normalizePowerSyncCrudOperation(operation))
    : [];
  const operationMap = new Map(operations.map((operation) => [operation.op_id, operation]));
  const errors = Array.isArray(payload.errors)
    ? payload.errors.map((entry) => normalizePowerSyncErrorEntry(entry, operationMap))
    : [];
  const failedOperationIds = new Set(
    errors
      .map((entry) => normalizeNumber(entry.operationId))
      .filter((value) => Number.isFinite(value) && value > 0)
  );
  const treatAllAsFailed = payload.success === false && failedOperationIds.size === 0 && operations.length > 0;
  const acknowledgedOperations = treatAllAsFailed
    ? []
    : operations.filter((operation) => !failedOperationIds.has(operation.op_id));
  const idMappings = (Array.isArray(payload.idMappings) ? payload.idMappings : [])
    .map((entry) => normalizeIdMapping(entry))
    .filter(Boolean);
  const taskIdMap = Object.fromEntries(
    idMappings
      .filter((entry) => entry.table === 'tasks')
      .map((entry) => [entry.tempId, entry.realId])
  );

  return {
    success: payload.success !== false,
    operations,
    errors,
    idMappings,
    taskIdMap,
    acknowledgedOperationIds: acknowledgedOperations.map((operation) => operation.op_id),
    failedOperationIds: Array.from(failedOperationIds),
    acknowledgedIds: acknowledgedOperations
      .map((operation) => sanitizeText(operation.metadataObject?.eventId))
      .filter(Boolean),
    failedIds: errors
      .map((entry) => sanitizeText(entry.eventId))
      .filter(Boolean),
    successCount: acknowledgedOperations.length,
    failureCount: treatAllAsFailed ? operations.length : failedOperationIds.size,
    hasFailures: treatAllAsFailed || failedOperationIds.size > 0,
    allSucceeded: operations.length > 0 && !treatAllAsFailed && failedOperationIds.size === 0
  };
}

export function applyPowerSyncTaskIdMappings(tasks = [], taskIdMap = {}) {
  if (!Array.isArray(tasks)) {
    return [];
  }

  if (!Object.keys(taskIdMap).length) {
    return tasks.slice();
  }

  return tasks.map((task) => remapTaskModel(task, taskIdMap));
}

export function applyPowerSyncOutboxMappings(outbox = [], taskIdMap = {}) {
  if (!Object.keys(taskIdMap).length) {
    return normalizeOutbox(outbox);
  }

  const remapped = normalizeOutbox(outbox).map((event) => {
    const currentEntityId = sanitizeText(event.entityId);
    const nextEntityId = taskIdMap[currentEntityId] || currentEntityId || event.entityId;
    const nextModels = isPlainObject(event?.data?.models?.tasks)
      ? Object.fromEntries(
          Object.entries(event.data.models.tasks).map(([taskId, task]) => {
            const nextKey = taskIdMap[sanitizeText(taskId)] || taskId;
            return [nextKey, remapTaskModel(task, taskIdMap)];
          })
        )
      : null;
    const nextPartials = isPlainObject(event?.data?.partials?.tasks)
      ? Object.fromEntries(
          Object.entries(event.data.partials.tasks).map(([taskId, task]) => {
            const nextKey = taskIdMap[sanitizeText(taskId)] || taskId;
            return [
              nextKey,
              {
                ...cloneValue(task),
                id: taskIdMap[sanitizeText(task?.id)] || sanitizeText(task?.id) || nextKey
              }
            ];
          })
        )
      : null;

    return {
      ...cloneValue(event),
      entityId: nextEntityId,
      metadata: {
        ...cloneValue(event.metadata),
        entityId: nextEntityId
      },
      data: {
        ...cloneValue(event.data),
        ...(nextModels ? { models: { tasks: nextModels } } : {}),
        ...(nextPartials ? { partials: { tasks: nextPartials } } : {})
      },
      payload: {
        ...cloneValue(event.payload),
        ...(event?.payload?.task ? { task: remapTaskModel(event.payload.task, taskIdMap) } : {}),
        ...(event?.payload?.previousTask ? { previousTask: remapTaskModel(event.payload.previousTask, taskIdMap) } : {})
      }
    };
  });

  return normalizeOutbox(remapped);
}

export function filterAcknowledgedOutbox(outbox = [], rawResponse = {}, request = {}) {
  const response = Array.isArray(rawResponse?.acknowledgedIds) && typeof rawResponse?.successCount === 'number'
    ? rawResponse
    : Array.isArray(rawResponse?.events)
      ? normalizePushEventBatchResponse(rawResponse)
      : normalizePowerSyncUploadResponse(rawResponse, request);
  const acknowledged = new Set(response.acknowledgedIds);

  return normalizeOutbox(outbox).filter((event) => !acknowledged.has(event.id));
}
