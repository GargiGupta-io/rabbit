const CURRENT_SCHEMA_VERSION = 2;
const EARLIEST_SCHEMA_VERSION = 1;
const DEFAULT_APP_VERSION = '1.0.0';

const DEFAULT_PROJECTS = [
  { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false },
  { id: 'work', name: 'Work', color: '#10b981', archived: false },
  { id: 'personal', name: 'Personal', color: '#f59e0b', archived: false }
];

const ALLOWED_TASK_STATUSES = new Set(['todo', 'done', 'deleted']);
const ALLOWED_RECURRENCE_PATTERNS = new Set(['none', 'daily', 'weekly']);
const DEFAULT_TASK_DURATION_MINUTES = 30;
const MIN_TASK_DURATION_MINUTES = 5;
const MAX_TASK_DURATION_MINUTES = 720;

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value.trim();
}

function sanitizeColor(value, fallback = '#3b82f6') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const candidate = value.trim();
  if (!candidate.startsWith('#') || candidate.length !== 7) {
    return fallback;
  }
  return candidate;
}

function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function toPositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!isFiniteNumber(parsed) || Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.floor(parsed));
}

function clampDuration(value = DEFAULT_TASK_DURATION_MINUTES) {
  const parsed = Number(value);
  if (!isFiniteNumber(parsed) || parsed <= 0) {
    return DEFAULT_TASK_DURATION_MINUTES;
  }
  return Math.min(
    MAX_TASK_DURATION_MINUTES,
    Math.max(MIN_TASK_DURATION_MINUTES, Math.floor(parsed / MIN_TASK_DURATION_MINUTES) * MIN_TASK_DURATION_MINUTES)
  );
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed.toISOString();
}

function normalizeProject(input = {}) {
  if (!isPlainObject(input)) {
    return null;
  }

  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  const color = sanitizeColor(input.color);
  const archived = Boolean(input.archived);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    color,
    archived
  };
}

function normalizeRecurrence(input = {}) {
  if (!isPlainObject(input)) {
    return { pattern: 'none', interval: 1, endAt: null };
  }
  const pattern = sanitizeText(input.pattern);
  const interval = toPositiveInteger(input.interval, 1);
  const endAt = normalizeDate(input.endAt);
  return {
    pattern: ALLOWED_RECURRENCE_PATTERNS.has(pattern) ? pattern : 'none',
    interval,
    endAt
  };
}

function normalizeTask(input = {}, index = 0, projectIds = new Set()) {
  if (!isPlainObject(input)) {
    return null;
  }

  const title = sanitizeText(input.title);
  if (!title) {
    return null;
  }

  const status = ALLOWED_TASK_STATUSES.has(sanitizeText(input.status)) ? sanitizeText(input.status) : 'todo';
  const projectId = sanitizeText(input.projectId) || 'inbox';
  const resolvedProjectId = projectIds.has(projectId) ? projectId : 'inbox';

  return {
    id: sanitizeText(input.id) || createTaskId(),
    title,
    description: sanitizeText(input.description),
    projectId: resolvedProjectId,
    projectName: sanitizeText(input.projectName),
    status,
    dueAt: normalizeDate(input.dueAt),
    startAt: normalizeDate(input.startAt),
    durationMinutes: clampDuration(Number(input.durationMinutes)),
    recurrence: normalizeRecurrence(input.recurrence),
    createdAt: normalizeDate(input.createdAt) || nowIso(),
    updatedAt: normalizeDate(input.updatedAt) || nowIso(),
    _seedIndex: index
  };
}

function normalizeProjects(projects = []) {
  const projectIds = new Set();
  const normalized = DEFAULT_PROJECTS
    .map((project) => ({ ...project }))
    .concat(Array.isArray(projects) ? projects.map((project) => normalizeProject(project)) : [])
    .filter(Boolean)
    .filter((project) => {
      if (projectIds.has(project.id)) {
        return false;
      }
      projectIds.add(project.id);
      return true;
    });

  if (projectIds.size === 0) {
    DEFAULT_PROJECTS.forEach((project) => {
      projectIds.add(project.id);
    });
    return DEFAULT_PROJECTS.map((project) => ({ ...project }));
  }

  return normalized;
}

function normalizeTasks(tasks = [], projectIds = new Set()) {
  if (!Array.isArray(tasks)) {
    return [];
  }

  const seen = new Set();
  return tasks
    .map((task, index) => normalizeTask(task, index, projectIds))
    .filter(Boolean)
    .filter((task) => {
      if (seen.has(task.id)) {
        return false;
      }
      seen.add(task.id);
      return true;
    })
    .map(({ _seedIndex, ...task }) => task);
}

function detectSchemaVersion(payload = {}) {
  const value = Number(payload?.schemaVersion);
  if (Number.isInteger(value) && value > 0) {
    return value;
  }
  return EARLIEST_SCHEMA_VERSION;
}

function normalizeMigrationInfo(payload = {}, fromVersion = EARLIEST_SCHEMA_VERSION, toVersion = CURRENT_SCHEMA_VERSION) {
  const steps = [];
  if (!Number.isInteger(payload?.schemaVersion)) {
    steps.push('injected schemaVersion (legacy payload)');
  }
  if (fromVersion < toVersion) {
    steps.push(`migrated v${fromVersion} -> v${toVersion}`);
  }
  return {
    fromVersion,
    toVersion,
    steps,
    lastMigratedAt: nowIso(),
    hasMigration: steps.length > 0
  };
}

export function normalizePersistedPayload(raw = {}) {
  const payload = isPlainObject(raw) ? raw : {};
  const fromVersion = detectSchemaVersion(payload);
  const projects = normalizeProjects(Array.isArray(payload.projects) ? payload.projects : []);
  const projectIds = new Set(projects.map((project) => project.id));

  const migration = normalizeMigrationInfo(payload, fromVersion, CURRENT_SCHEMA_VERSION);

  return {
    version: sanitizeText(payload.version, DEFAULT_APP_VERSION),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: normalizeDate(payload.updatedAt) || nowIso(),
    createdAt: normalizeDate(payload.createdAt) || nowIso(),
    lastLoadedAt: nowIso(),
    migration,
    revision: sanitizeText(payload.revision, `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
    projects,
    tasks: normalizeTasks(Array.isArray(payload.tasks) ? payload.tasks : [], projectIds)
  };
}

export function validatePersistedPayload(payload = {}) {
  const normalized = normalizePersistedPayload(payload);
  const errors = [];

  if (!Number.isInteger(payload.schemaVersion) && payload?.schemaVersion !== undefined) {
    errors.push('schemaVersion must be a positive integer');
  }

  if (!Array.isArray(normalized.projects)) {
    errors.push('projects must be an array');
  }

  if (!Array.isArray(normalized.tasks)) {
    errors.push('tasks must be an array');
  }

  return {
    ok: errors.length === 0,
    errors,
    value: normalized
  };
}

export const APP_DATA_DEFAULT = normalizePersistedPayload({
  version: DEFAULT_APP_VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  projects: DEFAULT_PROJECTS,
  tasks: []
});

export function createPersistedSeedData() {
  return normalizePersistedPayload(APP_DATA_DEFAULT);
}

export {
  CURRENT_SCHEMA_VERSION,
  EARLIEST_SCHEMA_VERSION
};
