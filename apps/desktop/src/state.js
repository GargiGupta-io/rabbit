import { normalizeTask } from './taskService.js';
import { buildProjectSeedData } from './projectService.js';
import { appendOutboxEvent, normalizeSyncState } from './syncContract.js';

export * from './taskService.js';
export * from './projectService.js';
export { buildPlanWindow, generatePlanSlice, rankConflicts } from './scheduler.js';
export * from './syncContract.js';

export function buildSeedData({ projects, tasks }) {
  const normalizedProjects = buildProjectSeedData(projects);
  const normalizedTasks = Array.isArray(tasks)
    ? tasks.map((task) => normalizeTask(task, { projectIds: new Set(normalizedProjects.map((project) => project.id)) })).filter(Boolean)
    : [];

  return {
    projects: normalizedProjects,
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
