import { CURRENT_SCHEMA_VERSION, APP_DATA_DEFAULT, normalizePersistedPayload } from './contracts.js';
import { createStableDeviceId, getCurrentSyncSessionId, normalizeSyncState } from './syncContract.js';

const STORAGE_KEY = 'motion_clone_phase1_app_data';
const DEVICE_ID_KEY = `${STORAGE_KEY}:device_id`;
const DEFAULT_APP_VERSION = '1.0.0';
const DEFAULT_SYNC_STATUS = 'local';

function nowIso() {
  return new Date().toISOString();
}

function hasStorage() {
  return Boolean(typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function');
}

function readStoredValue(key) {
  if (!hasStorage()) {
    return null;
  }
  return localStorage.getItem(key);
}

function writeStoredValue(key, value) {
  if (!hasStorage()) {
    return;
  }
  localStorage.setItem(key, value);
}

function removeStoredValue(key) {
  if (!hasStorage()) {
    return;
  }
  localStorage.removeItem(key);
}

function ensureSafeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function detectPlatform() {
  if (typeof navigator !== 'undefined' && navigator?.platform) {
    return ensureSafeText(navigator.platform, 'unknown');
  }

  if (typeof process !== 'undefined' && process?.env?.NODE_PLATFORM) {
    return ensureSafeText(process.env.NODE_PLATFORM, 'unknown');
  }

  if (typeof process !== 'undefined' && process?.platform) {
    return ensureSafeText(process.platform, 'unknown');
  }

  return 'unknown';
}

function getOrCreateDeviceId(preferred = '') {
  const existing = ensureSafeText(readStoredValue(DEVICE_ID_KEY), '');
  if (existing) {
    return existing;
  }

  const seeded = ensureSafeText(preferred, '');
  if (seeded) {
    writeStoredValue(DEVICE_ID_KEY, seeded);
    return seeded;
  }

  const next = createStableDeviceId();
  writeStoredValue(DEVICE_ID_KEY, next);
  return next;
}

function normalizeStorageMetadata(payload, now, { incomingSchemaVersion, syncStatus, deviceId, source }) {
  return {
    app: 'rabbit',
    appVersion: ensureSafeText(payload.version, DEFAULT_APP_VERSION),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    observedSchemaVersion: Number.isInteger(incomingSchemaVersion) ? incomingSchemaVersion : CURRENT_SCHEMA_VERSION,
    platform: detectPlatform(),
    deviceId,
    syncState: ensureSafeText(syncStatus, DEFAULT_SYNC_STATUS),
    source: ensureSafeText(source || payload.source, 'desktop'),
    revision: ensureSafeText(payload.revision, `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
    lastLoadedAt: now,
    lastSavedAt: ensureSafeText(payload.lastSavedAt, null),
    migration: payload.migration || null
  };
}

function attachSyncState(payload, raw = {}, options = {}) {
  const deviceId = getOrCreateDeviceId(raw?.deviceId || raw?.metadata?.deviceId || options.deviceId);
  const sync = normalizeSyncState(raw, {
    deviceId,
    sessionId: getCurrentSyncSessionId()
  });

  return {
    ...payload,
    outbox: sync.outbox,
    lastSyncAt: sync.lastSyncAt,
    syncCursor: sync.syncCursor,
    deviceId: sync.deviceId,
    syncStatus: sync.syncStatus
  };
}

function fallbackPayload() {
  const now = nowIso();
  const normalized = attachSyncState(normalizePersistedPayload(APP_DATA_DEFAULT), {}, {});
  normalized.lastLoadedAt = now;
  normalized.metadata = normalizeStorageMetadata(normalized, now, {
    incomingSchemaVersion: normalized.schemaVersion,
    syncStatus: normalized.syncStatus,
    deviceId: normalized.deviceId,
    source: 'desktop'
  });
  return normalized;
}

function withUpgradeGuard(raw) {
  const incomingSchemaVersion = Number(raw?.schemaVersion);
  const isIncomingFuture = Number.isInteger(incomingSchemaVersion) && incomingSchemaVersion > CURRENT_SCHEMA_VERSION;

  const normalizedInput = isIncomingFuture
    ? {
        ...raw,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      }
    : raw;

  const normalized = attachSyncState(normalizePersistedPayload(normalizedInput), raw, {});
  if (isIncomingFuture) {
    normalized.migration.steps.push(`downgraded payload schema v${incomingSchemaVersion} -> v${CURRENT_SCHEMA_VERSION} (compatibility read)`);
    normalized.migration.fromVersion = incomingSchemaVersion;
    normalized.migration.toVersion = CURRENT_SCHEMA_VERSION;
    normalized.migration.hasMigration = true;
  }

  const now = nowIso();
  normalized.lastLoadedAt = now;
  normalized.metadata = {
    ...normalizeStorageMetadata(normalized, now, {
      incomingSchemaVersion,
      syncStatus: normalized.syncStatus,
      deviceId: normalized.deviceId,
      source: raw?.metadata?.source || 'desktop'
    }),
    version: `restore:${normalized.revision}`
  };

  return normalized;
}

export function loadStoredData() {
  const raw = readStoredValue(STORAGE_KEY);
  if (!raw) {
    return fallbackPayload();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallbackPayload();
    }

    const normalized = withUpgradeGuard(parsed);
    if (!Array.isArray(normalized.projects) || !Array.isArray(normalized.tasks)) {
      return fallbackPayload();
    }

    return normalized;
  } catch {
    return fallbackPayload();
  }
}

export function saveStoredData(data = {}) {
  if (!hasStorage()) {
    return attachSyncState(normalizePersistedPayload(data), data, {
      deviceId: data?.deviceId
    });
  }

  const normalized = attachSyncState(normalizePersistedPayload(data), data, {
    deviceId: data?.deviceId
  });
  const now = nowIso();
  normalized.schemaVersion = CURRENT_SCHEMA_VERSION;
  normalized.updatedAt = now;
  normalized.lastSavedAt = now;
  normalized.revision = `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  normalized.lastLoadedAt = now;
  normalized.metadata = {
    ...normalizeStorageMetadata(normalized, now, {
      incomingSchemaVersion: normalized.schemaVersion,
      syncStatus: normalized.syncStatus,
      deviceId: normalized.deviceId,
      source: data?.metadata?.source || 'desktop'
    }),
    source: ensureSafeText(data?.metadata?.source, 'desktop')
  };
  writeStoredValue(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function resetStoredData() {
  removeStoredValue(STORAGE_KEY);
  removeStoredValue(DEVICE_ID_KEY);
}
