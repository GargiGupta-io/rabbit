import { createTaskSyncEvent } from './syncContract.js';

export const TASK_STATUSES = {
  Todo: 'todo',
  Done: 'done',
  Deleted: 'deleted'
};

export const TASK_STATUS_IDS = {
  [TASK_STATUSES.Todo]: 'status_todo',
  [TASK_STATUSES.Done]: 'status_done',
  [TASK_STATUSES.Deleted]: 'status_deleted'
};

export const TASK_PRIORITY_LEVELS = ['ASAP', 'HIGH', 'MEDIUM', 'LOW'];
export const TASK_DEADLINE_TYPES = ['ASAP', 'HARD', 'SOFT', 'NONE'];
export const TASK_SCHEDULED_STATUSES = ['ON_TRACK', 'PAST_DUE', 'UNFIT_SCHEDULABLE', 'UNFIT_PAST_DUE'];
export const TASK_TYPES = {
  Normal: 'NORMAL'
};

const ALLOWED_PRIORITY_LEVELS = new Set(TASK_PRIORITY_LEVELS);
const ALLOWED_DEADLINE_TYPES = new Set(TASK_DEADLINE_TYPES);
const ALLOWED_SCHEDULED_STATUSES = new Set(TASK_SCHEDULED_STATUSES);

const MINUTE = 60 * 1000;
const DEFAULT_WORKSPACE_ID = 'ws_personal';
const DEFAULT_CREATED_BY_USER_ID = 'user_local';

function isPresent(value) {
  return value !== undefined && value !== null && value !== '';
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
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
  const createdAt = normalizeDateTime(input.createdAt) || new Date().toISOString();
  const updatedAt = normalizeDateTime(input.updatedAt) || createdAt;
  const durationMinutes = clampDuration(Number(input.durationMinutes ?? input.duration) || 30, options.maxDurationMinutes);
  const startAt = normalizeDateTime(input.startAt ?? input.scheduledStart);
  const dueAt = normalizeDateTime(input.dueAt);
  const dueDate = normalizeDateOnly(input.dueDate) || normalizeDateOnly(dueAt);
  const scheduledStart = normalizeDateTime(input.scheduledStart ?? startAt);
  const scheduledEnd = normalizeDateTime(input.scheduledEnd) || deriveScheduledEnd(scheduledStart, durationMinutes);
  const minimumDuration = normalizeMinimumDuration(input.minimumDuration, durationMinutes);
  const isUnfit = Boolean(input.isUnfit);

  return {
    id: sanitizeText(input.id) || createTaskId(),
    type: sanitizeText(input.type) || TASK_TYPES.Normal,
    title,
    description: sanitizeText(input.description),
    projectId: projectIds instanceof Set && projectIds.size > 0 ? (projectIds.has(projectId) ? projectId : 'inbox') : projectId,
    projectName: sanitizeText(input.projectName),
    status,
    statusId: sanitizeText(input.statusId) || TASK_STATUS_IDS[status],
    workspaceId: sanitizeText(input.workspaceId) || DEFAULT_WORKSPACE_ID,
    assigneeUserId: sanitizeNullableText(input.assigneeUserId),
    createdByUserId: sanitizeText(input.createdByUserId) || DEFAULT_CREATED_BY_USER_ID,
    priorityLevel: normalizePriorityLevel(input.priorityLevel),
    deadlineType: normalizeDeadlineType(input.deadlineType, dueDate || dueAt),
    dueAt,
    dueDate,
    startAt,
    startOn: normalizeDateOnly(input.startOn) || normalizeDateOnly(startAt),
    durationMinutes,
    duration: durationMinutes,
    minimumDuration,
    completedTime: normalizeDateTime(input.completedTime) || (status === TASK_STATUSES.Done ? updatedAt : null),
    isAutoScheduled: normalizeBoolean(input.isAutoScheduled),
    isBusy: normalizeBoolean(input.isBusy),
    isFixedTimeTask: normalizeBoolean(input.isFixedTimeTask),
    isUnfit,
    needsReschedule: normalizeBoolean(input.needsReschedule),
    scheduleId: sanitizeNullableText(input.scheduleId),
    scheduleOverridden: normalizeBoolean(input.scheduleOverridden),
    scheduledStart,
    scheduledEnd,
    scheduledStatus: normalizeScheduledStatus({
      value: input.scheduledStatus,
      isUnfit,
      status,
      dueAt,
      dueDate,
      scheduledStart
    }),
    estimatedCompletionTime: normalizeDateTime(input.estimatedCompletionTime) || scheduledEnd,
    snoozeUntil: normalizeDateTime(input.snoozeUntil),
    manuallyStarted: normalizeBoolean(input.manuallyStarted),
    deadlineStatus: sanitizeNullableText(input.deadlineStatus),
    labelIds: normalizeStringArray(input.labelIds),
    blockingTaskIds: normalizeStringArray(input.blockingTaskIds),
    blockedByTaskIds: normalizeStringArray(input.blockedByTaskIds),
    stageDefinitionId: sanitizeNullableText(input.stageDefinitionId),
    taskDefinitionId: sanitizeNullableText(input.taskDefinitionId),
    isSyncingWithDefinition: normalizeBoolean(input.isSyncingWithDefinition),
    scheduleMeetingWithinDays: normalizeNullableNumber(input.scheduleMeetingWithinDays),
    meetingTaskId: sanitizeNullableText(input.meetingTaskId),
    customFieldValues: normalizeCustomFieldValues(input.customFieldValues),
    lastInteractedTime: normalizeDateTime(input.lastInteractedTime) || updatedAt,
    archivedTime: normalizeDateTime(input.archivedTime),
    ignoreWarnOnPastDue: normalizeBoolean(input.ignoreWarnOnPastDue),
    recurrence: normalizeRecurrence(input.recurrence),
    createdAt,
    updatedAt
  };
}

function clampDuration(value, max = 720) {
  if (!Number.isFinite(value) || value <= 0) return 30;
  return Math.min(max, Math.max(5, Math.floor(value / 5) * 5));
}

function normalizeMinimumDuration(value, durationMinutes) {
  if (!isPresent(value)) {
    return null;
  }
  return Math.min(clampDuration(Number(value) || 5, durationMinutes), durationMinutes);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

function normalizeNullableNumber(value) {
  if (!isPresent(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeNullableText(value) {
  const normalized = sanitizeText(value);
  return normalized || null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  return value
    .map((entry) => sanitizeText(entry))
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false;
      }
      seen.add(entry);
      return true;
    });
}

function normalizeCustomFieldValues(value) {
  return isPlainObject(value) ? { ...value } : {};
}

function normalizePriorityLevel(value) {
  const priority = sanitizeText(value).toUpperCase();
  return ALLOWED_PRIORITY_LEVELS.has(priority) ? priority : 'MEDIUM';
}

function normalizeDeadlineType(value, dueValue) {
  const deadlineType = sanitizeText(value).toUpperCase();
  if (ALLOWED_DEADLINE_TYPES.has(deadlineType)) {
    return deadlineType;
  }
  return dueValue ? 'HARD' : 'NONE';
}

function normalizeScheduledStatus({ value, isUnfit, status, dueAt, dueDate, scheduledStart }) {
  const scheduledStatus = sanitizeText(value).toUpperCase();
  if (ALLOWED_SCHEDULED_STATUSES.has(scheduledStatus)) {
    return scheduledStatus;
  }
  if (status === TASK_STATUSES.Done || status === TASK_STATUSES.Deleted) {
    return null;
  }
  if (isUnfit) {
    return isPastDue({ dueAt, dueDate }) ? 'UNFIT_PAST_DUE' : 'UNFIT_SCHEDULABLE';
  }
  if (isPastDue({ dueAt, dueDate })) {
    return 'PAST_DUE';
  }
  return scheduledStart || dueAt || dueDate ? 'ON_TRACK' : null;
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

function normalizeDateTime(value) {
  if (!isPresent(value)) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed.toISOString();
}

function normalizeDateOnly(value) {
  if (!isPresent(value)) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed.toISOString().slice(0, 10);
}

function deriveScheduledEnd(startAt, durationMinutes) {
  const parsedStart = parseDate(startAt);
  if (!parsedStart) {
    return null;
  }
  return new Date(parsedStart.valueOf() + durationMinutes * MINUTE).toISOString();
}

function parseDate(value, options = {}) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T${options.endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed;
}

function getDueDateValue(task) {
  return parseDate(task.dueAt) || parseDate(task.dueDate, { endOfDay: true });
}

function isPastDue({ dueAt, dueDate }, now = Date.now()) {
  const due = parseDate(dueAt) || parseDate(dueDate, { endOfDay: true });
  if (!due) {
    return false;
  }
  return due.valueOf() < now;
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

export function createTaskMutationEvent({
  action,
  task,
  previousTask = null,
  deviceId,
  sessionId,
  occurredAt,
  revision
} = {}) {
  return createTaskSyncEvent({
    action,
    task,
    previousTask,
    deviceId,
    sessionId,
    occurredAt,
    revision
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

  const occurredAt = new Date().toISOString();
  const nextTask = {
    ...validated,
    createdAt: validated.createdAt || occurredAt,
    updatedAt: occurredAt
  };

  const next = tasks.slice();
  next.unshift(nextTask);
  return {
    ok: true,
    tasks: next,
    syncEvent: createTaskMutationEvent({
      action: 'create',
      task: nextTask,
      occurredAt
    })
  };
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
  const previousTask = { ...next[index] };
  const task = { ...next[index] };

  if (action === 'complete') {
    task.status = task.status === TASK_STATUSES.Done ? TASK_STATUSES.Todo : TASK_STATUSES.Done;
    task.updatedAt = new Date().toISOString();
    task.statusId = TASK_STATUS_IDS[task.status];
    task.completedTime = task.status === TASK_STATUSES.Done ? task.updatedAt : null;
    task.scheduledStatus = task.status === TASK_STATUSES.Done ? null : normalizeScheduledStatus(task);
    next[index] = task;
    return {
      ok: true,
      tasks: next,
      syncEvent: createTaskMutationEvent({
        action: 'complete',
        task,
        previousTask,
        occurredAt: task.updatedAt
      })
    };
  }

  if (action === 'delete') {
    task.status = TASK_STATUSES.Deleted;
    task.updatedAt = new Date().toISOString();
    task.statusId = TASK_STATUS_IDS[task.status];
    task.archivedTime = task.updatedAt;
    task.scheduledStatus = null;
    next[index] = task;
    return {
      ok: true,
      tasks: next,
      syncEvent: createTaskMutationEvent({
        action: 'delete',
        task,
        previousTask,
        occurredAt: task.updatedAt
      })
    };
  }

  return { ok: false, error: 'Unsupported task action.' };
}

export function getTaskFilters(tasks = [], { statusFilter = 'all', query = '', now = Date.now() } = {}) {
  const normalized = sanitizeText(query).toLowerCase();
  const reference = new Date(now);
  const currentTime = Number.isNaN(reference.valueOf()) ? Date.now() : reference.valueOf();

  return tasks
    .filter((task) => {
      if (statusFilter === 'all') {
        return task.status !== TASK_STATUSES.Deleted;
      }
      if (statusFilter === 'overdue') {
        return task.status !== TASK_STATUSES.Done && task.status !== TASK_STATUSES.Deleted && isOverdue(task, currentTime);
      }
      return task.status === statusFilter;
    })
    .filter((task) => {
      if (!normalized) return true;
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      return haystack.includes(normalized);
    })
    .sort((left, right) => {
      const leftDate = getDueDateValue(left)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      const rightDate = getDueDateValue(right)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      return leftDate - rightDate;
    });
}

export function getTaskStateSummary(tasks = [], { now = Date.now() } = {}) {
  const reference = new Date(now);
  const currentTime = Number.isNaN(reference.valueOf()) ? Date.now() : reference.valueOf();
  const todayStart = startOfDay(Number.isNaN(reference.valueOf()) ? new Date() : reference).valueOf();
  const todayEnd = todayStart + 24 * 60 * MINUTE;

  const active = tasks.filter((task) => task.status !== TASK_STATUSES.Deleted);

  return {
    today: active.filter((task) => {
      const due = getDueDateValue(task);
      if (!due) return false;
      const value = due.valueOf();
      return value >= todayStart && value < todayEnd;
    }).length,
    upcoming: active.filter((task) => {
      const due = getDueDateValue(task);
      if (!due) return false;
      const value = due.valueOf();
      return value >= todayEnd && value <= todayEnd + 6 * 24 * 60 * MINUTE;
    }).length,
    overdue: active.filter((task) => isOverdue(task, currentTime)).length,
    done: tasks.filter((task) => task.status === TASK_STATUSES.Done).length
  };
}

function isOverdue(task, now = Date.now()) {
  const due = getDueDateValue(task);
  if (!due) return false;
  if (task.status === TASK_STATUSES.Done) return false;
  return due.valueOf() < now;
}

function startOfDay(value) {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
}
