import {
  TASK_DEADLINE_TYPES,
  TASK_FORM_MODES,
  TASK_PRIORITY_LEVELS,
  TASK_STATUS_IDS,
  TASK_STATUSES,
  normalizeTask
} from './taskService.js';
import {
  buildProjectDomainSeedData,
  buildProjectSeedData,
  decorateTaskWithProject,
  getProjectById,
  getStageDefinitionById,
  getTaskDefinitionById,
  getWorkspaceById
} from './projectService.js';
import { appendOutboxEvent, normalizeSyncState } from './syncContract.js';
import {
  createPushEventBatchRequest,
  filterAcknowledgedOutbox,
  normalizePushEventBatchResponse
} from './syncClient.js';
import { deriveShellStateSnapshot, getShellViewMeta, selectTasksForShellView } from './shellService.js';

export * from './taskService.js';
export * from './projectService.js';
export { buildPlanWindow, generatePlanSlice, rankConflicts } from './scheduler.js';
export * from './syncContract.js';
export * from './syncClient.js';
export * from './shellService.js';

function nowIso() {
  return new Date().toISOString();
}

export function buildSeedData({ workspaces, projectDefinitions, projects, tasks } = {}) {
  const projectDomain = buildProjectDomainSeedData({
    workspaces,
    projectDefinitions,
    projects
  });
  const normalizedTasks = Array.isArray(tasks)
    ? tasks
        .map((task) => normalizeTask(task, {
          projectIds: new Set(projectDomain.projects.map((project) => project.id))
        }))
        .filter(Boolean)
        .map((task) => decorateTaskWithProject(task, projectDomain))
    : [];

  return {
    ...projectDomain,
    tasks: normalizedTasks
  };
}

export function applyTaskMutation(appData = {}, result = {}) {
  const nextTasks = Array.isArray(result?.tasks) ? result.tasks.slice() : Array.isArray(appData.tasks) ? appData.tasks.slice() : [];
  const nextSync = result?.syncEvent
    ? normalizeSyncState(
        {
          ...appData,
          outbox: appendOutboxEvent(appData.outbox, result.syncEvent, { deviceId: appData.deviceId }),
          deviceId: appData.deviceId,
          lastSyncAt: appData.lastSyncAt,
          syncCursor: appData.syncCursor,
          syncStatus: 'pending'
        },
        { deviceId: appData.deviceId }
      )
    : normalizeSyncState(appData, { deviceId: appData.deviceId });

  return {
    ...appData,
    tasks: nextTasks,
    outbox: nextSync.outbox,
    lastSyncAt: nextSync.lastSyncAt,
    syncCursor: nextSync.syncCursor,
    deviceId: nextSync.deviceId,
    syncStatus: nextSync.syncStatus
  };
}

export function getSyncStateSummary(appData = {}) {
  const sync = normalizeSyncState(appData, { deviceId: appData.deviceId });
  const pushBatch = createPushEventBatchRequest(sync.outbox);
  const pendingCount = sync.outbox.length;
  const hasPendingChanges = pendingCount > 0;
  const isFailed = sync.syncStatus === 'failed';
  const isSyncing = sync.syncStatus === 'syncing';
  const isSynced = sync.syncStatus === 'synced' && !hasPendingChanges;
  const isLocalOnly = !hasPendingChanges && !isSyncing && !isSynced && !isFailed;

  return {
    ...sync,
    pendingCount,
    hasPendingChanges,
    isFailed,
    isSyncing,
    isSynced,
    isLocalOnly,
    isDegraded: hasPendingChanges || isFailed,
    pushBatch,
    pushEventCount: pushBatch.eventCount,
    pushEventTypes: pushBatch.eventTypes
  };
}

export function applySyncBatchResult(appData = {}, rawResponse = {}, options = {}) {
  const sync = normalizeSyncState(appData, { deviceId: appData.deviceId });
  const response = normalizePushEventBatchResponse(rawResponse);
  const nextOutbox = filterAcknowledgedOutbox(sync.outbox, response);
  const nextSyncStatus = response.failureCount > 0
    ? 'failed'
    : nextOutbox.length > 0
      ? 'pending'
      : response.successCount > 0
        ? 'synced'
        : sync.syncStatus;

  return {
    ...appData,
    outbox: nextOutbox,
    lastSyncAt: response.successCount > 0
      ? nowIso()
      : sync.lastSyncAt,
    syncCursor: typeof options.syncCursor === 'string' && options.syncCursor.trim()
      ? options.syncCursor.trim()
      : sync.syncCursor,
    deviceId: sync.deviceId,
    syncStatus: nextSyncStatus
  };
}

export function getShellState(appData = {}, options = {}) {
  return deriveShellStateSnapshot(appData, options);
}

export function getViewStateSummary(appData = {}, options = {}) {
  const shellState = deriveShellStateSnapshot(appData, options);
  const meta = getShellViewMeta(shellState);
  const tasks = selectTasksForShellView(Array.isArray(appData.tasks) ? appData.tasks : [], shellState, options);

  return {
    shellState,
    meta,
    tasks,
    visibleCount: tasks.length,
    itemType: meta.itemType,
    columns: Array.isArray(meta.columns) ? meta.columns.filter((column) => column.visible) : [],
    filterSummary: Array.isArray(meta.filterSummary) ? meta.filterSummary.slice() : []
  };
}

const TASK_FORM_STATUS_OPTIONS = [
  { id: TASK_STATUS_IDS[TASK_STATUSES.Todo], label: 'To do' },
  { id: TASK_STATUS_IDS[TASK_STATUSES.Done], label: 'Done' }
];

const TASK_FORM_DEADLINE_OPTIONS = TASK_DEADLINE_TYPES.map((value) => ({
  value,
  label: value === 'NONE' ? 'None' : value === 'SOFT' ? 'Soft deadline' : value === 'HARD' ? 'Hard deadline' : 'ASAP'
}));

const TASK_FORM_PRIORITY_OPTIONS = TASK_PRIORITY_LEVELS.map((value) => ({
  value,
  label: value === 'ASAP' ? 'ASAP' : value.charAt(0) + value.slice(1).toLowerCase()
}));

const TASK_FORM_MODE_OPTIONS = TASK_FORM_MODES.map((value) => ({
  value,
  label: value === 'auto' ? 'Auto-schedule' : value === 'manual' ? 'Manual' : 'Fixed time'
}));

const TASK_FORM_RECURRENCE_OPTIONS = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' }
];

function clampTaskFormMinutes(value, fallback = 30) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.max(5, Math.floor(parsed / 5) * 5);
}

function normalizeTaskFormMode(value, input = {}) {
  const normalized = sanitizeText(value).toLowerCase();
  if (TASK_FORM_MODES.includes(normalized)) {
    return normalized;
  }
  if (Boolean(input.isFixedTimeTask)) {
    return 'fixed';
  }
  if (input.isAutoScheduled === false) {
    return 'manual';
  }
  return 'auto';
}

function normalizeDateTimeInputValue(value) {
  const candidate = sanitizeText(value);
  if (!candidate) {
    return '';
  }

  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.valueOf())) {
    return '';
  }

  const local = new Date(parsed.valueOf() - parsed.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatUserLabel(userId) {
  const id = sanitizeText(userId);
  if (!id) {
    return 'Unassigned';
  }
  if (id === 'user_gargi') {
    return 'Me';
  }
  const base = id.replace(/^user_/, '').replaceAll('_', ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function formatScheduleLabel(scheduleId) {
  const id = sanitizeText(scheduleId);
  if (!id) {
    return 'No schedule';
  }

  return id
    .replace(/^schedule_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildTaskFormScheduleOptions(tasks = [], project = null) {
  const candidates = Array.isArray(tasks) ? tasks : [];
  const scheduleIds = new Set();

  candidates
    .filter((task) => sanitizeText(task.scheduleId))
    .filter((task) => {
      if (!project) {
        return true;
      }
      return task.projectId === project.id || task.workspaceId === project.workspaceId;
    })
    .forEach((task) => scheduleIds.add(task.scheduleId));

  return Array.from(scheduleIds)
    .sort()
    .map((id) => ({
      id,
      label: formatScheduleLabel(id)
    }));
}

function buildTaskFormAssigneeOptions(appData = {}, project = null) {
  const ids = new Set(['user_gargi']);
  if (project?.managerId) {
    ids.add(project.managerId);
  }
  if (Array.isArray(appData.tasks)) {
    appData.tasks.forEach((task) => {
      if (task.assigneeUserId) {
        ids.add(task.assigneeUserId);
      }
      if (task.createdByUserId) {
        ids.add(task.createdByUserId);
      }
    });
  }

  return [
    { id: '', label: 'Unassigned' },
    ...Array.from(ids)
      .filter(Boolean)
      .sort()
      .map((id) => ({
        id,
        label: formatUserLabel(id)
      }))
  ];
}

export function createTaskFormState(appData = {}, input = {}) {
  const projectDomain = buildProjectDomainSeedData({
    workspaces: appData.workspaces,
    projectDefinitions: appData.projectDefinitions,
    projects: appData.projects
  });
  const projects = buildProjectSeedData(projectDomain.projects);
  const project = getProjectById(projects, sanitizeText(input.projectId)) || getProjectById(projects, 'inbox') || projects[0] || null;
  const workspace = getWorkspaceById(projectDomain.workspaces, project?.workspaceId);
  const scheduleOptions = buildTaskFormScheduleOptions(appData.tasks, project);
  const scheduleMode = normalizeTaskFormMode(input.scheduleMode, input);
  const dueAtInput = normalizeDateTimeInputValue(input.dueAtInput || input.dueAt);
  const startAtInputBase = normalizeDateTimeInputValue(input.startAtInput || input.startAt || input.scheduledStart);
  const startAtInput = scheduleMode === 'fixed' && !startAtInputBase ? dueAtInput : startAtInputBase;
  const defaultScheduleId = scheduleOptions[0]?.id || '';
  const scheduleId = sanitizeText(input.scheduleId, defaultScheduleId);
  const assigneeUserId = sanitizeText(input.assigneeUserId, sanitizeText(project?.managerId, 'user_gargi'));
  const recurrencePattern = sanitizeText(input.recurrencePattern || input.recurrence?.pattern, 'none');

  return {
    title: sanitizeText(input.title),
    description: sanitizeText(input.description),
    projectId: project?.id || 'inbox',
    projectName: project?.name || 'Inbox',
    workspaceId: project?.workspaceId || workspace?.id || 'ws_private_my_tasks',
    workspaceName: workspace?.name || 'My Tasks (Private)',
    assigneeUserId,
    statusId: sanitizeText(input.statusId, TASK_STATUS_IDS[TASK_STATUSES.Todo]),
    priorityLevel: sanitizeText(input.priorityLevel, 'MEDIUM'),
    deadlineType: sanitizeText(input.deadlineType, 'SOFT'),
    scheduleMode,
    dueAtInput,
    startAtInput,
    durationMinutes: clampTaskFormMinutes(input.durationMinutes ?? input.duration, 30),
    minimumDuration: clampTaskFormMinutes(input.minimumDuration, 15),
    scheduleId: scheduleOptions.some((option) => option.id === scheduleId) ? scheduleId : defaultScheduleId,
    recurrencePattern: ['none', 'daily', 'weekly'].includes(recurrencePattern) ? recurrencePattern : 'none'
  };
}

export function getTaskFormOptions(appData = {}, formState = {}) {
  const projectDomain = buildProjectDomainSeedData({
    workspaces: appData.workspaces,
    projectDefinitions: appData.projectDefinitions,
    projects: appData.projects
  });
  const projects = buildProjectSeedData(projectDomain.projects);
  const project = getProjectById(projects, formState.projectId) || getProjectById(projects, 'inbox') || projects[0] || null;
  const workspace = getWorkspaceById(projectDomain.workspaces, project?.workspaceId);

  return {
    activeProject: project,
    activeWorkspace: workspace,
    projectOptions: projects.map((entry) => ({
      id: entry.id,
      label: entry.name,
      workspaceId: entry.workspaceId
    })),
    assigneeOptions: buildTaskFormAssigneeOptions(appData, project),
    statusOptions: TASK_FORM_STATUS_OPTIONS.map((entry) => ({ ...entry })),
    priorityOptions: TASK_FORM_PRIORITY_OPTIONS.map((entry) => ({ ...entry })),
    deadlineOptions: TASK_FORM_DEADLINE_OPTIONS.map((entry) => ({ ...entry })),
    scheduleModeOptions: TASK_FORM_MODE_OPTIONS.map((entry) => ({ ...entry })),
    scheduleOptions: buildTaskFormScheduleOptions(appData.tasks, project),
    recurrenceOptions: TASK_FORM_RECURRENCE_OPTIONS.map((entry) => ({ ...entry }))
  };
}

const INBOX_TYPE_DETAILS = {
  'task-assigned': {
    accent: 'task',
    actionLabel: 'Open task',
    sourceLabel: 'Task'
  },
  'mentioned-in-task-comment': {
    accent: 'mention',
    actionLabel: 'Open comment',
    sourceLabel: 'Comment'
  },
  'project-stage-entered': {
    accent: 'project',
    actionLabel: 'Open project',
    sourceLabel: 'Project'
  },
  'meeting-insights': {
    accent: 'insight',
    actionLabel: 'Open note',
    sourceLabel: 'Meeting'
  },
  'post-onboarding': {
    accent: 'guide',
    actionLabel: 'View guide',
    sourceLabel: 'Guide'
  }
};

const DEFAULT_INBOX_ID = 'inbox_personal';

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim();
  return normalized || fallback;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function toIsoString(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed.toISOString();
}

function cloneMetadata(value) {
  return isPlainObject(value) ? { ...value } : {};
}

function normalizeInboxDescriptor(input = {}) {
  const id = sanitizeText(input.id);
  const label = sanitizeText(input.label || input.name);
  if (!id || !label) {
    return null;
  }

  return {
    id,
    label,
    kind: sanitizeText(input.kind, 'personal'),
    sourceIds: Array.isArray(input.sourceIds) ? input.sourceIds.map((entry) => sanitizeText(entry)).filter(Boolean) : []
  };
}

function resolveInboxTarget(raw = {}, context = {}) {
  const metadata = cloneMetadata(raw?.payload?.metadata);
  const tasks = Array.isArray(context.tasks) ? context.tasks : [];
  const projects = Array.isArray(context.projects) ? context.projects : [];
  const projectDefinitions = Array.isArray(context.projectDefinitions) ? context.projectDefinitions : [];
  const task = tasks.find((entry) => entry.id === metadata.taskId) || null;
  const project = getProjectById(projects, metadata.projectId || task?.projectId);
  const stage = getStageDefinitionById(projectDefinitions, metadata.stageDefinitionId || task?.stageDefinitionId);
  const taskDefinition = getTaskDefinitionById(projectDefinitions, metadata.taskDefinitionId || task?.taskDefinitionId);

  if (task) {
    return {
      targetTitle: task.title,
      targetSubtitle: project?.name || task.projectName || 'Task',
      projectId: task.projectId || null
    };
  }

  if (taskDefinition) {
    return {
      targetTitle: taskDefinition.name,
      targetSubtitle: stage?.name || 'Project stage',
      projectId: project?.id || null
    };
  }

  if (stage || project) {
    return {
      targetTitle: stage?.name || project?.name || 'Project',
      targetSubtitle: project?.name || 'Project update',
      projectId: project?.id || null
    };
  }

  if (sanitizeText(metadata.noteId)) {
    return {
      targetTitle: sanitizeText(raw?.payload?.snapshot?.title, 'Meeting insights'),
      targetSubtitle: 'Meeting note',
      projectId: null
    };
  }

  return {
    targetTitle: sanitizeText(raw?.payload?.snapshot?.title, 'Inbox item'),
    targetSubtitle: sanitizeText(raw?.payload?.snapshot?.description, 'Inbox item'),
    projectId: null
  };
}

function normalizeInboxItem(input = {}, context = {}) {
  if (!isPlainObject(input)) {
    return null;
  }

  const id = sanitizeText(input.id);
  const type = sanitizeText(input.type);
  const createdTime = toIsoString(input.createdTime);
  const inboxId = sanitizeText(input.inboxId, DEFAULT_INBOX_ID);
  const snapshot = isPlainObject(input.payload?.snapshot) ? input.payload.snapshot : {};
  const title = sanitizeText(snapshot.title);

  if (!id || !type || !createdTime || !title) {
    return null;
  }

  const detail = INBOX_TYPE_DETAILS[type] || {
    accent: 'generic',
    actionLabel: 'Open item',
    sourceLabel: 'Inbox'
  };
  const resolvedTarget = resolveInboxTarget(input, context);

  return {
    id,
    inboxId,
    type,
    read: Boolean(input.read),
    createdTime,
    title,
    description: sanitizeText(snapshot.description),
    metadata: cloneMetadata(input.payload?.metadata),
    accent: detail.accent,
    actionLabel: detail.actionLabel,
    sourceLabel: detail.sourceLabel,
    ...resolvedTarget
  };
}

export function buildInboxSeedData(rawInbox = {}, context = {}) {
  const inboxInput = isPlainObject(rawInbox) ? rawInbox : {};
  const inboxes = (Array.isArray(inboxInput.inboxes) ? inboxInput.inboxes : [
    {
      id: DEFAULT_INBOX_ID,
      label: 'Inbox',
      kind: 'personal',
      sourceIds: ['motion-notifications']
    }
  ])
    .map((entry) => normalizeInboxDescriptor(entry))
    .filter(Boolean);
  const activeInboxId = sanitizeText(inboxInput.activeInboxId, inboxes[0]?.id || DEFAULT_INBOX_ID);
  const items = (Array.isArray(inboxInput.items) ? inboxInput.items : [])
    .map((entry) => normalizeInboxItem(entry, context))
    .filter(Boolean)
    .filter((item) => item.inboxId === activeInboxId)
    .sort((left, right) => new Date(right.createdTime).valueOf() - new Date(left.createdTime).valueOf());
  const unreadItems = items.filter((item) => !item.read);
  const unreadCount = unreadItems.length;
  const typeCounts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return {
    inboxes,
    activeInboxId,
    activeInboxLabel: inboxes.find((entry) => entry.id === activeInboxId)?.label || 'Inbox',
    items,
    unreadItems,
    readItems: items.filter((item) => item.read),
    unreadCount,
    totalCount: items.length,
    needsActionCount: unreadItems.length,
    sourceCount: new Set((inboxes.find((entry) => entry.id === activeInboxId)?.sourceIds || [])).size,
    highlightedItem: items[0] || null,
    emptyState: 'Inbox is clear. New notifications and mentions will appear here.',
    typeCounts
  };
}

export function getInboxStateSummary(appData = {}, options = {}) {
  const projectDomain = buildProjectDomainSeedData({
    workspaces: appData.workspaces,
    projectDefinitions: appData.projectDefinitions,
    projects: appData.projects
  });

  return buildInboxSeedData(appData.inbox, {
    ...projectDomain,
    tasks: Array.isArray(appData.tasks) ? appData.tasks : [],
    ...options
  });
}
