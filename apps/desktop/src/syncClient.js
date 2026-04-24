import { createMotionKey } from './apiClient.js';
import { normalizeOutbox, toPushSyncEvent } from './syncContract.js';

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

export const queryKeys = {
  root: createMotionKey('sync-events'),
  push: () => createMotionKey(queryKeys.root, 'push')
};

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

export function filterAcknowledgedOutbox(outbox = [], rawResponse = {}) {
  const response = normalizePushEventBatchResponse(rawResponse);
  const acknowledged = new Set(response.acknowledgedIds);

  return normalizeOutbox(outbox).filter((event) => !acknowledged.has(event.id));
}
