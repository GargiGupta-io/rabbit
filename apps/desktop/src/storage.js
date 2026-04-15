import { CURRENT_SCHEMA_VERSION, APP_DATA_DEFAULT, normalizePersistedPayload } from './contracts.js';

const STORAGE_KEY = 'motion_clone_phase1_app_data';

function fallbackPayload() {
  return {
    ...APP_DATA_DEFAULT,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastLoadedAt: new Date().toISOString()
  };
}

export function loadStoredData() {
  const raw = localStorage?.getItem?.(STORAGE_KEY);
  if (!raw) {
    return fallbackPayload();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallbackPayload();
    }
    return normalizePersistedPayload(parsed);
  } catch {
    return fallbackPayload();
  }
}

export function saveStoredData(data = {}) {
  const normalized = normalizePersistedPayload(data);
  normalized.schemaVersion = CURRENT_SCHEMA_VERSION;
  normalized.updatedAt = new Date().toISOString();
  normalized.lastSavedAt = normalized.updatedAt;
  normalized.revision = `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  if (!localStorage) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export function resetStoredData() {
  if (!localStorage) {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
