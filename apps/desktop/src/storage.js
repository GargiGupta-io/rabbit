import { buildSeedData } from './state.js';

const STORAGE_KEY = 'motion_clone_phase1_app_data';

const FALLBACK = {
  version: '1.0.0',
  updatedAt: new Date().toISOString(),
  projects: [
    { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false },
    { id: 'work', name: 'Work', color: '#10b981', archived: false },
    { id: 'personal', name: 'Personal', color: '#f59e0b', archived: false }
  ],
  tasks: []
};

export function loadStoredData() {
  const raw = localStorage?.getItem?.(STORAGE_KEY);
  if (!raw) return buildSeedData(FALLBACK);

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return buildSeedData(FALLBACK);
    return buildSeedData(parsed);
  } catch {
    return buildSeedData(FALLBACK);
  }
}

export function saveStoredData(data = {}) {
  const normalized = buildSeedData(data);
  normalized.updatedAt = new Date().toISOString();
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
