import { normalizeTask } from './taskService.js';
import {
  buildProjectDomainSeedData,
  buildProjectSeedData,
  decorateTaskWithProject,
  getProjectById,
  getStageDefinitionById,
  getTaskDefinitionById
} from './projectService.js';
import { appendOutboxEvent, normalizeSyncState } from './syncContract.js';
import { deriveShellStateSnapshot, getShellViewMeta, selectTasksForShellView } from './shellService.js';

export * from './taskService.js';
export * from './projectService.js';
export { buildPlanWindow, generatePlanSlice, rankConflicts } from './scheduler.js';
export * from './syncContract.js';
export * from './shellService.js';

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
    isDegraded: hasPendingChanges || isFailed
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
