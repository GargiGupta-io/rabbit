import { CURRENT_SCHEMA_VERSION, APP_DATA_DEFAULT, normalizePersistedPayload } from './contracts.js';

const STORAGE_KEY = 'motion_clone_phase1_app_data';
const DEVICE_ID_KEY = `${STORAGE_KEY}:device_id`;
const DEFAULT_APP_VERSION = '1.0.0';
const DEFAULT_SYNC_STATE = 'local';

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

function sanitizeSyncState(value) {
  if (value === 'synced' || value === 'pending' || value === 'failed') {
    return value;
  }
  return DEFAULT_SYNC_STATE;
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

function createStableDeviceId() {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
}

function getOrCreateDeviceId() {
  const existing = ensureSafeText(readStoredValue(DEVICE_ID_KEY), '');
  if (existing) {
    return existing;
  }

  const next = createStableDeviceId();
  writeStoredValue(DEVICE_ID_KEY, next);
  return next;
}

function normalizeStorageMetadata(payload, now, { incomingSchemaVersion, syncState }) {
  return {
    app: 'rabbit',
    appVersion: ensureSafeText(payload.version, DEFAULT_APP_VERSION),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    observedSchemaVersion: Number.isInteger(incomingSchemaVersion) ? incomingSchemaVersion : CURRENT_SCHEMA_VERSION,
    platform: detectPlatform(),
    deviceId: getOrCreateDeviceId(),
    syncState: sanitizeSyncState(syncState),
    source: ensureSafeText(payload.source || 'desktop'),
    revision: ensureSafeText(payload.revision, `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
    lastLoadedAt: now,
    lastSavedAt: ensureSafeText(payload.lastSavedAt, null),
    migration: payload.migration || null
  };
}

function fallbackPayload() {
  const now = nowIso();
  const fallback = normalizePersistedPayload(APP_DATA_DEFAULT);
  fallback.lastLoadedAt = now;
  fallback.metadata = normalizeStorageMetadata(fallback, now, { syncState: DEFAULT_SYNC_STATE });
  return fallback;
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

  const normalized = normalizePersistedPayload(normalizedInput);
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
      syncState: raw?.metadata?.syncState || DEFAULT_SYNC_STATE,
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
    return;
  }

  const normalized = normalizePersistedPayload(data);
  const now = nowIso();
  normalized.schemaVersion = CURRENT_SCHEMA_VERSION;
  normalized.updatedAt = now;
  normalized.lastSavedAt = now;
  normalized.revision = `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  normalized.lastLoadedAt = now;
  normalized.metadata = {
    ...normalizeStorageMetadata(normalized, now, {
      incomingSchemaVersion: normalized.schemaVersion,
      syncState: data?.metadata?.syncState || DEFAULT_SYNC_STATE
    }),
    source: ensureSafeText(data?.metadata?.source, 'desktop')
  };
  writeStoredValue(STORAGE_KEY, JSON.stringify(normalized));
}

export function resetStoredData() {
  removeStoredValue(STORAGE_KEY);
  removeStoredValue(DEVICE_ID_KEY);
}
