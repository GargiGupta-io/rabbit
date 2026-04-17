export const TASK_STATUSES = {
  Todo: 'todo',
  Done: 'done',
  Deleted: 'deleted'
};

const MINUTE = 60 * 1000;

function isPresent(value) {
  return value !== undefined && value !== null && value !== '';
}

export function sanitizeText(value) {
  return String(value ?? '').trim();
}

export function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function normalizeTask(input = {}, options = {}) {
  const { projectIds } = options;
  const projectId = sanitizeText(input.projectId) || 'inbox';
  const title = sanitizeText(input.title);

  if (!title) {
    return null;
  }

  const status = Object.values(TASK_STATUSES).includes(input.status)
    ? input.status
    : TASK_STATUSES.Todo;

  return {
    id: sanitizeText(input.id) || createTaskId(),
    title,
    description: sanitizeText(input.description),
    projectId: projectIds instanceof Set && projectIds.size > 0 ? (projectIds.has(projectId) ? projectId : 'inbox') : projectId,
    projectName: sanitizeText(input.projectName),
    status,
    dueAt: isPresent(input.dueAt) ? sanitizeText(input.dueAt) : null,
    startAt: isPresent(input.startAt) ? sanitizeText(input.startAt) : null,
    durationMinutes: clampDuration(Number(input.durationMinutes) || 30, options.maxDurationMinutes),
    recurrence: normalizeRecurrence(input.recurrence),
    createdAt: sanitizeText(input.createdAt) || new Date().toISOString(),
    updatedAt: sanitizeText(input.updatedAt) || new Date().toISOString()
  };
}

function clampDuration(value, max = 720) {
  if (!Number.isFinite(value) || value <= 0) return 30;
  return Math.min(max, Math.max(5, Math.floor(value / 5) * 5));
}

function normalizeRecurrence(input = {}) {
  const pattern = sanitizeText(input.pattern) || 'none';
  const allowed = new Set(['none', 'daily', 'weekly']);

  return {
    pattern: allowed.has(pattern) ? pattern : 'none',
    interval: Math.max(1, Number(input.interval) || 1),
    endAt: sanitizeText(input.endAt) || null
  };
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed;
}

export function formatDisplayDateTime(value) {
  const parsed = parseDate(value);
  if (!parsed) return 'No due date';

  return parsed.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function upsertTask(tasks = [], draft = {}) {
  const validated = normalizeTask(draft);
  if (!validated) {
    return {
      ok: false,
      error: 'Please add a title before creating a task.'
    };
  }

  const hasDuplicate = tasks.some((task) => task.title.toLowerCase() === validated.title.toLowerCase() && task.projectId === validated.projectId && task.status !== TASK_STATUSES.Deleted);
  if (hasDuplicate) {
    return {
      ok: false,
      error: 'A similar active task already exists in this project.'
    };
  }

  const next = tasks.slice();
  next.unshift(validated);
  return { ok: true, tasks: next };
}

export function resolveTaskAction(tasks = [], taskId, action) {
  if (!taskId) {
    return {
      ok: false,
      error: 'Task identifier missing.'
    };
  }

  const index = tasks.findIndex((task) => task.id === taskId);
  if (index < 0) {
    return {
      ok: false,
      error: 'Task not found. It may have been deleted already.'
    };
  }

  const next = tasks.slice();
  const task = { ...next[index] };

  if (action === 'complete') {
    task.status = task.status === TASK_STATUSES.Done ? TASK_STATUSES.Todo : TASK_STATUSES.Done;
    task.updatedAt = new Date().toISOString();
    next[index] = task;
    return { ok: true, tasks: next };
  }

  if (action === 'delete') {
    task.status = TASK_STATUSES.Deleted;
    task.updatedAt = new Date().toISOString();
    next[index] = task;
    return { ok: true, tasks: next };
  }

  return { ok: false, error: 'Unsupported task action.' };
}

export function getTaskFilters(tasks = [], { statusFilter = 'all', query = '' } = {}) {
  const normalized = sanitizeText(query).toLowerCase();

  return tasks
    .filter((task) => {
      if (statusFilter === 'all') {
        return task.status !== TASK_STATUSES.Deleted;
      }
      if (statusFilter === 'overdue') {
        return task.status !== TASK_STATUSES.Done && task.status !== TASK_STATUSES.Deleted && isOverdue(task);
      }
      return task.status === statusFilter;
    })
    .filter((task) => {
      if (!normalized) return true;
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      return haystack.includes(normalized);
    })
    .sort((left, right) => {
      const leftDate = parseDate(left.dueAt)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      const rightDate = parseDate(right.dueAt)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      return leftDate - rightDate;
    });
}

export function getTaskStateSummary(tasks = []) {
  const now = Date.now();
  const todayStart = startOfDay(new Date()).valueOf();
  const todayEnd = todayStart + 24 * 60 * MINUTE;

  const active = tasks.filter((task) => task.status !== TASK_STATUSES.Deleted);

  return {
    today: active.filter((task) => {
      const due = parseDate(task.dueAt);
      if (!due) return false;
      const value = due.valueOf();
      return value >= todayStart && value < todayEnd;
    }).length,
    upcoming: active.filter((task) => {
      const due = parseDate(task.dueAt);
      if (!due) return false;
      const value = due.valueOf();
      return value >= todayEnd && value <= todayEnd + 6 * 24 * 60 * MINUTE;
    }).length,
    overdue: active.filter((task) => isOverdue(task, now)).length,
    done: tasks.filter((task) => task.status === TASK_STATUSES.Done).length
  };
}

function isOverdue(task, now = Date.now()) {
  const due = parseDate(task.dueAt);
  if (!due) return false;
  if (task.status === TASK_STATUSES.Done) return false;
  return due.valueOf() < now;
}

function startOfDay(value) {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function generatePlanSlice(tasks = [], options = {}) {
  const now = new Date(options.now || Date.now());
  const horizon = options.horizonMinutes || 7 * 24 * 60;
  const windowEnd = now.getTime() + horizon * MINUTE;

  const visible = tasks
    .filter((task) => task.status !== TASK_STATUSES.Deleted)
    .map((task) => ({
      task,
      start: parseDate(task.startAt)?.getTime(),
      due: parseDate(task.dueAt)?.getTime()
    }))
    .filter((entry) => {
      if (!entry.due && !entry.start) return true;
      const when = entry.start || entry.due;
      return when >= now.getTime() && when <= windowEnd;
    });

  const overlaps = computeConflicts(visible);
  return {
    visible,
    overlaps
  };
}

function computeConflicts(entries = []) {
  const overlaps = {};
  const withIntervals = entries
    .filter((entry) => entry.task.durationMinutes && (entry.start || entry.due))
    .map((entry) => {
      const start = (entry.start || entry.due) || 0;
      const end = start + entry.task.durationMinutes * MINUTE;
      return { id: entry.task.id, start, end };
    })
    .filter((item) => Number.isFinite(item.start));

  withIntervals.forEach((left) => {
    const collisionIds = withIntervals
      .filter((right) => right.id !== left.id && right.start < left.end && left.start < right.end)
      .map((item) => item.id);

    if (collisionIds.length) {
      overlaps[left.id] = collisionIds;
    }
  });

  return overlaps;
}
