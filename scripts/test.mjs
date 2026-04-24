import assert from 'node:assert/strict';
import { applySyncBatchResult, applyTaskMutation, buildInboxSeedData, buildSeedData, buildTaskDraftFromFormState, createTaskFormState, createTaskId, getClientCacheSummary, getInboxStateSummary, getProjectDefinitionById, getStageDefinitionById, getSyncStateSummary, getTaskDefinitionById, getTaskFilters, getTaskFormOptions, getTaskStateSummary, getViewStateSummary, getWorkspaceById, upsertTask, resolveTaskAction, normalizeTask } from '../apps/desktop/src/state.js';
import { generatePlanSlice, buildPlanWindow, rankConflicts } from '../apps/desktop/src/scheduler.js';
import { ENTITLEMENT_REFRESH_STALE_MS, ENTITLEMENT_STORAGE_KEY, getEntitlementSnapshot, getEntitlementStateSummary, refreshEntitlementSnapshot, requireEntitlement } from '../apps/desktop/src/entitlement.js';
import { validatePersistedPayload, CURRENT_SCHEMA_VERSION } from '../apps/desktop/src/contracts.js';
import { loadStoredData, saveStoredData } from '../apps/desktop/src/storage.js';
import { createTaskSyncEvent, normalizeOutbox } from '../apps/desktop/src/syncContract.js';
import { buildCalendarBusyBlocks, normalizeCalendarEvent, normalizeCalendarOverlay } from '../apps/desktop/src/calendarService.js';
import { createMockEntitlementTransport, normalizeAuthorityRefreshResponse } from '../apps/desktop/src/entitlementClient.js';
import { getTaskScheduleSummary, getTaskScheduleType } from '../apps/desktop/src/taskService.js';
import { getProjectTaskFormDefaults } from '../apps/desktop/src/projectService.js';
import { applyClientTransform, resolveClientRequest } from '../apps/desktop/src/apiClient.js';
import {
  bulkUpdateTasks,
  completeTask,
  getLazyTaskById,
  getPastDueTasks,
  getTaskById,
  queryTasks,
  updateTask
} from '../apps/desktop/src/tasksClient.js';
import { getViews } from '../apps/desktop/src/viewsClient.js';
import {
  fetchUncachedCalendarList,
  getCalendarEvents,
  getCalendars,
  getSchedulingAssistantEventsV4,
  searchCalendarEvents
} from '../apps/desktop/src/calendarClient.js';
import {
  getInboxItems,
  getUnreadInboxCount,
  markInboxItemsAsRead
} from '../apps/desktop/src/inboxClient.js';
import {
  fetchBootstrap,
  getCurrentUser,
  getFeaturePermissions,
  getMySettings,
  updateTaskDefaults
} from '../apps/desktop/src/bootstrapClient.js';
import {
  createPowerSyncUploadRequest,
  createPushEventBatchRequest,
  normalizePowerSyncUploadResponse,
  normalizePushEventBatchResponse
} from '../apps/desktop/src/syncClient.js';
import {
  activateShellView,
  buildSidebarSections,
  deriveShellStateSnapshot,
  getShellViewMeta,
  selectTasksForShellView
} from '../apps/desktop/src/shellService.js';
import {
  createDesktopAgendaPayload,
  createDesktopShellBridge,
  createDesktopTabPayload,
  createShellBridgeSnapshot,
  RECEIVABLE_CHANNELS,
  SENDABLE_CHANNELS
} from '../apps/desktop/src/desktopShellBridge.js';
import {
  FIXTURE_CALENDAR_EVENTS_RAW,
  FIXTURE_CALENDARS_RAW,
  FIXTURE_CALENDAR_OVERLAY,
  FIXTURE_INBOX_STATE,
  FIXTURE_NOW,
  FIXTURE_PROJECT_DEFINITIONS,
  FIXTURE_WORKSPACES,
  FIXTURE_SHELL_STATE,
  FIXTURE_TASKS_RAW,
  getFixtureState
} from '../apps/desktop/src/fixtures.js';

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error.message);
    process.exit(1);
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error.message);
    process.exit(1);
  }
}

const baseTasks = FIXTURE_TASKS_RAW.map((task) => normalizeTask(task));
const fixtureState = getFixtureState();

function createLocalStorageMock() {
  const store = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach((key) => delete store[key]);
    }
  };
}

function withLocalStorage(storage, fn) {
  const previous = globalThis.localStorage;
  const restore = () => {
    if (previous) {
      globalThis.localStorage = previous;
    } else {
      delete globalThis.localStorage;
    }
  };
  globalThis.localStorage = storage;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}

runTest('fixture set is deterministic and parseable', () => {
  const normalized = getFixtureState();
  assert.equal(normalized.workspaces.length, FIXTURE_WORKSPACES.length);
  assert.equal(normalized.projectDefinitions.length, FIXTURE_PROJECT_DEFINITIONS.length);
  assert.equal(normalized.projects.length, 4);
  assert.equal(normalized.tasks.length, 5);
  assert.equal(normalized.inbox.items.length, FIXTURE_INBOX_STATE.items.length);
  assert.equal(normalized.tasks.every((task) => typeof task.title === 'string'), true);
});

runTest('project seed data carries the Motion tutorial workspace and staged project graph', () => {
  const seed = buildSeedData(getFixtureState());
  const tutorialWorkspace = getWorkspaceById(seed.workspaces, 'ws_private_my_tasks');
  const tutorialDefinition = getProjectDefinitionById(seed.projectDefinitions, 'pde_learn_motion');
  const basicsStage = getStageDefinitionById(seed.projectDefinitions, 'stagedef_motion_basics');
  const dashboardsTask = getTaskDefinitionById(seed.projectDefinitions, 'taskdef_dashboards');
  const tutorialProject = seed.projects.find((project) => project.id === 'pr_learn_motion');

  assert.equal(tutorialWorkspace?.name, 'My Tasks (Private)');
  assert.equal(tutorialDefinition?.name, 'Learn motion');
  assert.equal(tutorialDefinition?.stages.length, 3);
  assert.equal(basicsStage?.name, 'Motion Basics');
  assert.equal(dashboardsTask?.name, 'Setup Dashboards');
  assert.equal(tutorialProject?.projectDefinitionId, 'pde_learn_motion');
  assert.equal(tutorialProject?.activeStageDefinitionId, 'stagedef_motion_basics');
  assert.equal(tutorialProject?.stages.length, 3);
});

runTest('task normalization injects Motion-like domain defaults for legacy task drafts', () => {
  const task = normalizeTask({
    id: 'legacy_minimal',
    title: 'Legacy task',
    projectId: 'work',
    durationMinutes: 26
  });

  assert.equal(task.type, 'NORMAL');
  assert.equal(task.statusId, 'status_todo');
  assert.equal(task.priorityLevel, 'MEDIUM');
  assert.equal(task.deadlineType, 'NONE');
  assert.equal(task.workspaceId, 'ws_personal');
  assert.equal(task.durationMinutes, 25);
  assert.equal(task.duration, 25);
  assert.equal(task.minimumDuration, null);
  assert.equal(task.scheduledStatus, null);
  assert.deepEqual(task.blockingTaskIds, []);
  assert.deepEqual(task.blockedByTaskIds, []);
  assert.deepEqual(task.labelIds, []);
});

runTest('fixture tasks expose richer Motion-like dependency and scheduling fields', () => {
  const normalized = FIXTURE_TASKS_RAW.map((task) => normalizeTask(task));
  const draftWeeklyPlan = normalized.find((task) => task.id === 'f1');
  const designReview = normalized.find((task) => task.id === 'f3');
  const notesTask = normalized.find((task) => task.id === 'f5');

  assert.equal(draftWeeklyPlan.priorityLevel, 'HIGH');
  assert.equal(draftWeeklyPlan.workspaceId, 'ws_motion_team');
  assert.equal(draftWeeklyPlan.scheduledStatus, 'ON_TRACK');
  assert.equal(draftWeeklyPlan.taskDefinitionId, 'taskdef_weekly_plan');
  assert.deepEqual(draftWeeklyPlan.blockingTaskIds, ['f4']);
  assert.equal(designReview.scheduledStatus, 'PAST_DUE');
  assert.equal(designReview.needsReschedule, true);
  assert.equal(notesTask.deadlineType, 'NONE');
  assert.equal(notesTask.scheduledStatus, null);
});

runTest('fixture shell state seeds Motion-like tabs, views, and agenda groups', () => {
  const normalized = getFixtureState();
  assert.equal(normalized.shell.theme.mode, 'dark');
  assert.equal(normalized.shell.tabs.length, 3);
  assert.equal(normalized.shell.savedViews.length, 4);
  assert.equal(normalized.shell.activeTabId, 'tab_calendar');
  assert.equal(normalized.shell.activeViewId, 'view_my_tasks');
  assert.equal(normalized.shell.sidebarSections.length, 4);
  assert.equal(normalized.shell.agenda.counts.total, FIXTURE_SHELL_STATE.agenda.counts.total);
  assert.equal(normalized.shell.agenda.counts.total, 6);
});

runTest('task form state seeds Motion-like defaults from project and workspace context', () => {
  const form = createTaskFormState(fixtureState, {
    projectId: 'work'
  });

  assert.equal(form.projectId, 'work');
  assert.equal(form.projectName, 'Work');
  assert.equal(form.workspaceId, 'ws_motion_team');
  assert.equal(form.assigneeUserId, 'user_manager_motion');
  assert.equal(form.statusId, 'status_todo');
  assert.equal(form.priorityLevel, 'MEDIUM');
  assert.equal(form.deadlineType, 'SOFT');
  assert.equal(form.scheduleMode, 'auto');
  assert.equal(form.scheduleId, 'schedule_work_default');
  assert.equal(form.minimumDuration, 15);
  assert.equal(form.recurrencePattern, 'none');
});

runTest('task form options expose project, assignee, schedule, and recurrence controls', () => {
  const form = createTaskFormState(fixtureState, {
    projectId: 'work'
  });
  const options = getTaskFormOptions(fixtureState, form);

  assert.equal(options.projectOptions.length, 4);
  assert.equal(options.assigneeOptions.some((option) => option.id === 'user_manager_motion'), true);
  assert.equal(options.scheduleOptions.length, 2);
  assert.equal(options.scheduleModeOptions.length, 3);
  assert.equal(options.deadlineOptions.length, 4);
  assert.equal(options.recurrenceOptions.length, 3);
  assert.equal(options.activeWorkspace?.id, 'ws_motion_team');
});

runTest('task form draft builder converts fixed-time form state into a normalized draft', () => {
  const form = createTaskFormState(fixtureState, {
    projectId: 'work',
    title: 'Fixed kickoff prep',
    description: 'Prepare the deck before the kickoff.',
    scheduleMode: 'fixed',
    dueAtInput: '2026-04-18T10:00',
    startAtInput: '2026-04-18T09:00',
    durationMinutes: 60,
    minimumDuration: 30,
    priorityLevel: 'HIGH'
  });
  const draft = buildTaskDraftFromFormState(form);

  assert.equal(draft.title, 'Fixed kickoff prep');
  assert.equal(draft.projectId, 'work');
  assert.equal(draft.workspaceId, 'ws_motion_team');
  assert.equal(draft.isFixedTimeTask, true);
  assert.equal(draft.isAutoScheduled, false);
  assert.equal(draft.scheduleOverridden, true);
  assert.equal(draft.priorityLevel, 'HIGH');
  assert.equal(draft.minimumDuration, 30);
  assert.equal(draft.scheduledStart, '2026-04-18T03:30:00.000Z');
  assert.equal(draft.scheduledEnd, '2026-04-18T04:30:00.000Z');
  assert.equal(draft.dueAt, '2026-04-18T04:30:00.000Z');
});

runTest('project task form defaults derive stage-aware start and due windows from tutorial projects', () => {
  const defaults = getProjectTaskFormDefaults({
    projects: fixtureState.projects,
    projectDefinitions: fixtureState.projectDefinitions,
    projectId: 'pr_learn_motion',
    now: FIXTURE_NOW
  });
  const advancedDefaults = getProjectTaskFormDefaults({
    projects: fixtureState.projects,
    projectDefinitions: fixtureState.projectDefinitions,
    projectId: 'pr_learn_motion',
    stageDefinitionId: 'stagedef_motion_advanced',
    now: FIXTURE_NOW
  });

  assert.equal(defaults.projectDefinitionId, 'pde_learn_motion');
  assert.equal(defaults.selectedStageId, 'stagedef_motion_basics');
  assert.equal(defaults.stageOptions.length, 3);
  assert.equal(defaults.defaultStartAt, '2026-04-20T09:00:00.000Z');
  assert.equal(defaults.defaultDueAt, '2026-04-30T17:00:00.000Z');
  assert.equal(advancedDefaults.selectedStageId, 'stagedef_motion_advanced');
  assert.equal(advancedDefaults.defaultStartAt, '2026-04-30T09:00:00.000Z');
  assert.equal(advancedDefaults.defaultDueAt, '2026-05-15T17:00:00.000Z');
});

runTest('task form draft builder carries project stage defaults and recurrence intervals', () => {
  const draft = buildTaskDraftFromFormState({
    title: 'Template follow-up',
    projectId: 'pr_learn_motion',
    projectName: 'Learn motion',
    workspaceId: 'ws_private_my_tasks',
    projectDefinitionId: 'pde_learn_motion',
    stageDefinitionId: 'stagedef_motion_advanced',
    scheduleMode: 'auto',
    dueAtInput: '2026-05-15T17:00',
    startAtInput: '2026-04-30T09:00',
    recurrencePattern: 'weekly',
    recurrenceInterval: 2,
    durationMinutes: 45
  });

  assert.equal(draft.projectDefinitionId, 'pde_learn_motion');
  assert.equal(draft.stageDefinitionId, 'stagedef_motion_advanced');
  assert.equal(draft.startAt, null);
  assert.equal(draft.startOn, '2026-04-30');
  assert.equal(draft.isAutoScheduled, true);
  assert.equal(draft.recurrence.pattern, 'weekly');
  assert.equal(draft.recurrence.interval, 2);
  assert.equal(draft.dueAt, '2026-05-15T11:30:00.000Z');
});

runTest('task client wrappers mirror Motion task query and mutation shapes', () => {
  const queryRequest = resolveClientRequest(queryTasks, {
    include: ['project', 'workspace'],
    filters: { completed: 'exclude' }
  });
  const taskByIdRequest = resolveClientRequest(getTaskById, {
    id: 'task_123',
    include: ['project', 'workspace']
  });
  const lazyRequest = resolveClientRequest(getLazyTaskById, {
    id: 'task_123',
    include: []
  });
  const updateRequest = resolveClientRequest(updateTask, {
    id: 'task_123',
    title: 'Rename task',
    statusId: 'status_done'
  });
  const completeRequest = resolveClientRequest(completeTask, {
    id: 'task_123',
    completedTime: '2026-04-17T12:00:00.000Z'
  });
  const bulkRequest = resolveClientRequest(bulkUpdateTasks, {
    taskIds: ['task_123', 'task_456'],
    patch: { priorityLevel: 'HIGH' }
  });
  const pastDueRequest = resolveClientRequest(getPastDueTasks, {
    include: ['project']
  });

  assert.equal(queryRequest.method, 'POST');
  assert.equal(queryRequest.uri, '/v2/tasks/query');
  assert.deepEqual(queryRequest.key, ['v2/tasks', 'query', { include: ['project', 'workspace'], filters: { completed: 'exclude' } }]);
  assert.deepEqual(queryRequest.body, { include: ['project', 'workspace'], filters: { completed: 'exclude' } });
  assert.equal(taskByIdRequest.uri, '/v2/tasks/task_123?include=project,workspace');
  assert.deepEqual(taskByIdRequest.key, ['v2/tasks', 'by-id', 'task_123']);
  assert.deepEqual(lazyRequest.key, ['lazy', 'v2/tasks', 'by-id', 'task_123']);
  assert.equal(updateRequest.uri, '/v2/tasks/task_123');
  assert.deepEqual(updateRequest.body, { title: 'Rename task', statusId: 'status_done' });
  assert.equal(completeRequest.uri, '/v2/tasks/task_123/complete');
  assert.deepEqual(completeRequest.body, { id: 'task_123', completedTime: '2026-04-17T12:00:00.000Z' });
  assert.equal(bulkRequest.uri, '/v2/tasks/bulk-update');
  assert.deepEqual(bulkRequest.body, { taskIds: ['task_123', 'task_456'], patch: { priorityLevel: 'HIGH' } });
  assert.equal(pastDueRequest.uri, '/v2/tasks/past_due?include=project');
});

runTest('views client wrapper applies Motion-style column and completed defaults', () => {
  const transformed = applyClientTransform(getViews, {
    ids: ['view_my_tasks', 'view_team_schedule'],
    models: {
      views: {
        view_my_tasks: {
          definition: {
            type: 'projects-and-tasks',
            columns: [{ key: 'title' }, { key: 'status', visible: false }],
            filters: {
              tasks: { filters: {} },
              projects: { filters: {} }
            }
          }
        },
        view_team_schedule: {
          definition: {
            type: 'team-schedule',
            columns: [{ key: 'assignee' }],
            filters: {
              tasks: { filters: {} },
              projects: { filters: {} }
            }
          }
        }
      }
    }
  });

  assert.equal(transformed.models.views.view_my_tasks.definition.columns[0].visible, true);
  assert.equal(transformed.models.views.view_my_tasks.definition.filters.tasks.filters.completed, 'include');
  assert.equal(transformed.models.views.view_my_tasks.definition.filters.projects.filters.completed, 'include');
  assert.equal(transformed.models.views.view_team_schedule.definition.columns[0].visible, undefined);
});

runTest('calendar client wrappers align with extracted query keys and search transforms', () => {
  const calendarsRequest = resolveClientRequest(getCalendars);
  const uncachedRequest = resolveClientRequest(fetchUncachedCalendarList, {
    providerTypes: ['GOOGLE']
  });
  const eventsRequest = resolveClientRequest(getCalendarEvents, {
    providerIds: ['prov_b', 'prov_a']
  });
  const searchRequest = resolveClientRequest(searchCalendarEvents, {
    query: 'kickoff',
    limit: 10
  });
  const schedulingAssistantRequest = resolveClientRequest(getSchedulingAssistantEventsV4, {
    attendees: ['user_1'],
    dateRange: { start: '2026-04-17', end: '2026-04-18' }
  });
  const transformedSearch = applyClientTransform(searchCalendarEvents, {
    calendarEvents: [{ id: 'evt_1' }, { id: 'evt_2' }]
  });

  assert.equal(calendarsRequest.uri, '/v2/calendars');
  assert.deepEqual(calendarsRequest.key, ['calendars']);
  assert.equal(uncachedRequest.uri, '/calendar_list');
  assert.deepEqual(uncachedRequest.key, ['uncached_calendar_list']);
  assert.deepEqual(uncachedRequest.body, { providerTypes: ['GOOGLE'] });
  assert.equal(eventsRequest.uri, '/v2/calendar_events/gantt?providerIds%5B%5D=prov_a&providerIds%5B%5D=prov_b');
  assert.deepEqual(eventsRequest.key, ['calendar-events', 'calendars', 'prov_a', 'prov_b']);
  assert.deepEqual(searchRequest.uri, {
    pathname: '/v2/calendar_events/search',
    search: { query: 'kickoff', limit: 10 }
  });
  assert.deepEqual(searchRequest.key, ['calendar-events', 'kickoff']);
  assert.equal(schedulingAssistantRequest.uri, '/v4/calendar-events/scheduling-assistant');
  assert.equal(schedulingAssistantRequest.method, 'POST');
  assert.deepEqual(transformedSearch, [{ id: 'evt_1' }, { id: 'evt_2' }]);
});

runTest('inbox and bootstrap client wrappers expose Motion-like query keys and settings surfaces', () => {
  const inboxItemsRequest = resolveClientRequest(getInboxItems);
  const unreadRequest = resolveClientRequest(getUnreadInboxCount);
  const markReadRequest = resolveClientRequest(markInboxItemsAsRead, {
    type: 'multiple',
    itemIds: ['notif_2', 'notif_1']
  });
  const bootstrapRequest = resolveClientRequest(fetchBootstrap, {
    workspaceId: 'ws_motion_team',
    viewId: 'view_my_tasks'
  });
  const settingsRequest = resolveClientRequest(getMySettings);
  const meRequest = resolveClientRequest(getCurrentUser);
  const permissionsRequest = resolveClientRequest(getFeaturePermissions);
  const taskDefaultsRequest = resolveClientRequest(updateTaskDefaults, {
    defaultDurationMinutes: 30
  });

  assert.deepEqual(inboxItemsRequest.key, ['inbox', 'items']);
  assert.equal(inboxItemsRequest.uri, '/v2/notifications/items');
  assert.deepEqual(unreadRequest.key, ['inbox', 'unread-count']);
  assert.deepEqual(markReadRequest.key, ['inbox', 'mark-item-as-read', 'notif_2', 'notif_1']);
  assert.equal(markReadRequest.uri, '/v2/notifications/mark-status');
  assert.equal(bootstrapRequest.method, 'POST');
  assert.deepEqual(bootstrapRequest.key, ['bootstrap', { workspaceId: 'ws_motion_team', viewId: 'view_my_tasks' }]);
  assert.equal(settingsRequest.uri, '/v2/users/me/settings');
  assert.deepEqual(settingsRequest.key, ['v2', 'users', 'me', 'settings']);
  assert.equal(settingsRequest.queryOptions.staleTime, 60 * 60 * 1000);
  assert.equal(meRequest.uri, '/v2/users/me');
  assert.deepEqual(meRequest.key, ['v2', 'users', 'me']);
  assert.equal(permissionsRequest.uri, '/v2/users/me/feature-permissions');
  assert.deepEqual(permissionsRequest.key, ['v2', 'users', 'me', 'feature-permissions']);
  assert.deepEqual(taskDefaultsRequest.invalidate, [['v2', 'users', 'me', 'settings']]);
  assert.deepEqual(taskDefaultsRequest.body, { defaultDurationMinutes: 30 });
});

runTest('client cache summary mirrors extracted settings, views, calendar-list, and workspace keys', () => {
  const summary = getClientCacheSummary(fixtureState, {
    now: FIXTURE_NOW
  });

  assert.equal(summary.queryCount, 8);
  assert.equal(summary.viewCount, 4);
  assert.equal(summary.calendarCount, 2);
  assert.equal(summary.workspaceCount, 2);
  assert.equal(summary.settingsGroupCount >= 8, true);
  assert.equal(summary.calendarPermissionStatus, 'granted');
  assert.equal(summary.calendarFetchStatus, 'idle');
  assert.equal(summary.userEmail, 'gargig469@gmail.com');
  assert.equal(summary.activeViewId, 'view_my_tasks');
  assert.equal(summary.activeWorkspaceId, 'ws_private_my_tasks');
  assert.equal(summary.onboardingComplete, true);
  assert.equal(summary.keyLabels.includes('v2/users/me/settings'), true);
  assert.equal(summary.keyLabels.includes('v3/views'), true);
  assert.equal(summary.keyLabels.includes('uncached_calendar_list'), true);
  assert.equal(summary.keyLabels.some((label) => label.startsWith('v2/workspaces/[args]')), true);
});

runTest('saved views are grouped into workspace, private, team, and project sidebar sections', () => {
  const sections = buildSidebarSections({
    savedViews: fixtureState.shell.savedViews,
    projects: fixtureState.projects
  });

  assert.deepEqual(sections.map((section) => section.id), ['workspace', 'my-views', 'team-views', 'projects']);
  assert.equal(sections[1].items.length, 2);
  assert.equal(sections[2].items.length, 2);
  assert.equal(sections[3].items.length, 4);
});

runTest('activating a saved view syncs the matching tab and resolves Motion-like view metadata', () => {
  const nextShell = activateShellView(fixtureState.shell, 'view_project_timelines');
  const snapshot = deriveShellStateSnapshot({
    ...fixtureState,
    shell: nextShell
  });
  const meta = getShellViewMeta(snapshot);

  assert.equal(snapshot.activeTabId, 'tab_project_timelines');
  assert.equal(snapshot.activeViewId, 'view_project_timelines');
  assert.equal(meta.id, 'view_project_timelines');
  assert.equal(meta.layout, 'gantt');
  assert.equal(meta.collectionLabel, 'Project sequence');
  assert.equal(meta.itemType, 'projects');
  assert.equal(meta.visibility, 'team');
  assert.equal(Array.isArray(meta.columns), true);
  assert.equal(meta.columns.length >= 4, true);
});

runTest('saved view runtime preserves views-v3-style definitions and summaries', () => {
  const summary = getViewStateSummary(fixtureState, {
    now: FIXTURE_NOW
  });

  assert.equal(summary.meta.id, 'view_my_tasks');
  assert.equal(summary.meta.viewType, 'projects-and-tasks');
  assert.equal(summary.meta.itemType, 'tasks');
  assert.equal(summary.columns.length, 4);
  assert.equal(summary.filterSummary.includes('Private'), true);
  assert.equal(summary.filterSummary.includes('Assigned to me'), true);
});

runTest('desktop shell bridge exposes extracted sendable and receivable channel families', () => {
  assert.equal(SENDABLE_CHANNELS.includes('tabs:set'), true);
  assert.equal(SENDABLE_CHANNELS.includes('appBar:setAgenda'), true);
  assert.equal(SENDABLE_CHANNELS.includes('updateTheme'), true);
  assert.equal(RECEIVABLE_CHANNELS.includes('tabs:select'), true);
  assert.equal(RECEIVABLE_CHANNELS.includes('appBar:search'), true);
  assert.equal(RECEIVABLE_CHANNELS.includes('main:showMainWindow'), true);
});

runTest('desktop shell bridge derives tab and agenda payloads from shell state', () => {
  const shellState = deriveShellStateSnapshot(fixtureState, {
    now: FIXTURE_NOW
  });
  const tabs = createDesktopTabPayload(shellState);
  const agenda = createDesktopAgendaPayload(shellState);

  assert.equal(tabs.length, 3);
  assert.equal(tabs.find((tab) => tab.id === shellState.activeTabId)?.active, true);
  assert.equal(agenda.length, shellState.agenda.counts.total);
  assert.equal(agenda.some((entry) => entry.sourceType === 'task'), true);
  assert.equal(agenda.some((entry) => entry.sourceType === 'calendar'), true);
  assert.equal(agenda.every((entry) => typeof entry.bucket === 'string'), true);
});

runTest('desktop shell bridge snapshot and provider sync follow Motion-like shell update shape', () => {
  const shellState = deriveShellStateSnapshot(fixtureState, {
    now: FIXTURE_NOW
  });
  const syncState = getSyncStateSummary(fixtureState);
  const inboxState = getInboxStateSummary(fixtureState);
  const sent = [];
  const bridge = createDesktopShellBridge({
    appVersion: 'test-shell',
    distribution: 'apple',
    send(channel, ...args) {
      sent.push({ channel, args });
    }
  });
  let selectedTabId = null;
  bridge.on('tabs:select', (tabId) => {
    selectedTabId = tabId;
  });
  const snapshot = createShellBridgeSnapshot({
    shellState,
    syncState,
    inboxState,
    appVersion: 'test-shell',
    distribution: 'apple'
  });

  bridge.syncShellState({
    shellState,
    syncState,
    inboxState,
    appVersion: 'test-shell',
    distribution: 'apple'
  });
  bridge.emit('tabs:select', 'tab_my_tasks');

  assert.equal(snapshot.distribution, 'apple');
  assert.equal(snapshot.themeMode, 'dark');
  assert.equal(snapshot.tabs.length, 3);
  assert.equal(snapshot.appBarSettings.showTrayText, true);
  assert.equal(sent[0].channel, 'appVersion');
  assert.equal(sent.some((entry) => entry.channel === 'tabs:set'), true);
  assert.equal(sent.some((entry) => entry.channel === 'tabs:didNavigate'), true);
  assert.equal(sent.some((entry) => entry.channel === 'appBar:setAgenda'), true);
  assert.equal(sent.some((entry) => entry.channel === 'updateTheme' && entry.args[0] === 'dark'), true);
  assert.equal(selectedTabId, 'tab_my_tasks');
});

runTest('fixture inbox state seeds a structured personal inbox baseline', () => {
  const normalized = getFixtureState();
  assert.equal(normalized.inbox.activeInboxId, 'inbox_personal');
  assert.equal(normalized.inbox.inboxes.length, 1);
  assert.equal(normalized.inbox.items.length, 5);
});

runTest('inbox runtime normalizes unread counts and resolves task and project targets', () => {
  const inboxState = getInboxStateSummary(fixtureState);

  assert.equal(inboxState.activeInboxLabel, 'Inbox');
  assert.equal(inboxState.totalCount, 5);
  assert.equal(inboxState.unreadCount, 3);
  assert.equal(inboxState.needsActionCount, 3);
  assert.equal(inboxState.items[0].id, 'notif_1');
  assert.equal(inboxState.items[0].targetTitle, 'Draft weekly plan');
  assert.equal(inboxState.items[2].targetTitle, 'Motion Basics');
});

runTest('missing inbox data degrades to a safe empty inbox surface', () => {
  const inboxState = buildInboxSeedData({}, fixtureState);

  assert.equal(inboxState.totalCount, 0);
  assert.equal(inboxState.unreadCount, 0);
  assert.equal(inboxState.activeInboxLabel, 'Inbox');
  assert.equal(inboxState.emptyState.includes('Inbox is clear'), true);
});

runTest('active shell views change the base task collection before ad hoc filters run', () => {
  const deadlineShell = activateShellView(fixtureState.shell, 'view_my_deadlines');
  const deadlineSnapshot = deriveShellStateSnapshot({
    ...fixtureState,
    shell: deadlineShell
  });
  const deadlineTasks = selectTasksForShellView(fixtureState.tasks, deadlineSnapshot, {
    now: FIXTURE_NOW
  });

  assert.deepEqual(deadlineTasks.map((task) => task.id), ['f1']);

  const timelineShell = activateShellView(fixtureState.shell, 'view_project_timelines');
  const timelineSnapshot = deriveShellStateSnapshot({
    ...fixtureState,
    shell: timelineShell
  });
  const timelineTasks = selectTasksForShellView(fixtureState.tasks, timelineSnapshot, {
    now: FIXTURE_NOW
  });

  assert.equal(timelineTasks.every((task) => task.projectId !== 'inbox'), true);
  assert.deepEqual(timelineTasks.map((task) => task.id), ['f3', 'f4', 'f1']);
});

runTest('seeded task/project reconciliation adds workspace and tutorial metadata to runtime tasks', () => {
  const seed = buildSeedData(getFixtureState());
  const workTask = seed.tasks.find((task) => task.id === 'f1');
  const personalTask = seed.tasks.find((task) => task.id === 'f3');

  assert.equal(workTask.workspaceName, 'Motion Team');
  assert.equal(workTask.projectName, 'Work');
  assert.equal(workTask.isTutorialProject, false);
  assert.equal(personalTask.workspaceName, 'My Tasks (Private)');
});

runTest('create duplicate task guard rejects duplicate title in same project', () => {
  const dup = upsertTask(baseTasks, { title: 'Draft weekly plan', projectId: 'work' });
  assert.equal(dup.ok, false);
  assert.equal(dup.error.includes('similar'), true);
});

runTest('task action flow marks task done', () => {
  const result = resolveTaskAction(baseTasks, 'f1', 'complete');
  assert.equal(result.ok, true);
  assert.equal(result.tasks[0].id, 'f1');
  assert.equal(result.tasks.find((task) => task.id === 'f1')?.status, 'done');
});

runTest('task mutations emit normalized sync events for create and complete actions', () => {
  const created = upsertTask([], { title: 'Sync contract baseline', projectId: 'inbox', durationMinutes: 25 });
  assert.equal(created.ok, true);
  assert.equal(created.syncEvent?.action, 'create');
  assert.equal(created.syncEvent?.entityType, 'task');
  assert.equal(created.syncEvent?.entityId, created.tasks[0].id);
  assert.equal(created.syncEvent?.type, 'task.created');
  assert.equal(created.syncEvent?.pushType, 'push.task.create');
  assert.equal(created.syncEvent?.$version, 1);
  assert.equal(created.syncEvent?.data?.models?.tasks?.[created.tasks[0].id]?.title, 'Sync contract baseline');
  assert.equal(created.syncEvent?.payload?.task?.title, 'Sync contract baseline');

  const completed = resolveTaskAction(created.tasks, created.tasks[0].id, 'complete');
  assert.equal(completed.ok, true);
  assert.equal(completed.syncEvent?.action, 'complete');
  assert.equal(completed.syncEvent?.type, 'task.updated');
  assert.equal(completed.syncEvent?.pushType, 'push.task.update');
  assert.equal(completed.syncEvent?.data?.models?.tasks?.[created.tasks[0].id]?.status, 'done');
  assert.equal(completed.syncEvent?.payload?.previousTask?.status, 'todo');
  assert.equal(completed.syncEvent?.payload?.task?.status, 'done');
});

runTest('sync outbox normalization deduplicates repeated revision entries', () => {
  const previousTask = normalizeTask(FIXTURE_TASKS_RAW[0]);
  const nextTask = normalizeTask({
    ...FIXTURE_TASKS_RAW[0],
    title: 'Draft weekly plan v2',
    updatedAt: '2026-04-17T12:30:00.000Z'
  });

  const event = createTaskSyncEvent({
    action: 'update',
    task: nextTask,
    previousTask,
    revision: 'mut_fixed_revision',
    occurredAt: '2026-04-17T12:30:00.000Z'
  });

  const outbox = normalizeOutbox([event, event, { ...event, id: 'duplicate-by-revision' }], {
    deviceId: 'dev_test'
  });

  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].action, 'update');
  assert.equal(outbox[0].type, 'task.updated');
  assert.equal(outbox[0].pushType, 'push.task.update');
  assert.equal(outbox[0].deviceId, 'dev_test');
  assert.equal(outbox[0].payload?.previousTask?.title, previousTask.title);
});

runTest('sync client batch request wraps local outbox events into extracted push DTO direction', () => {
  const created = createTaskSyncEvent({
    action: 'create',
    task: normalizeTask({
      id: 'sync_push_1',
      title: 'Push me',
      projectId: 'work',
      durationMinutes: 30
    }),
    revision: 'mut_push_1',
    occurredAt: '2026-04-17T12:20:00.000Z'
  });
  const deleted = createTaskSyncEvent({
    action: 'delete',
    task: normalizeTask({
      id: 'sync_push_2',
      title: 'Delete me',
      projectId: 'work',
      durationMinutes: 30,
      archivedTime: '2026-04-17T12:25:00.000Z',
      updatedAt: '2026-04-17T12:25:00.000Z',
      status: 'deleted'
    }),
    previousTask: normalizeTask({
      id: 'sync_push_2',
      title: 'Delete me',
      projectId: 'work',
      durationMinutes: 30
    }),
    revision: 'mut_push_2',
    occurredAt: '2026-04-17T12:25:00.000Z'
  });
  const batch = createPushEventBatchRequest([created, deleted]);

  assert.equal(batch.eventCount, 2);
  assert.deepEqual(batch.key, ['sync-events', 'push']);
  assert.deepEqual(batch.eventTypes, ['push.task.create', 'push.task.delete']);
  assert.equal(batch.events[0].type, 'push.task.create');
  assert.equal(batch.events[0].metadata.syncType, 'task.created');
  assert.equal(batch.events[1].type, 'push.task.delete');
  assert.equal(batch.events[1].data.partials.tasks.sync_push_2.deletedTime, '2026-04-17T12:25:00.000Z');
});

runTest('PowerSync upload request converts local sync events into CRUD operations', () => {
  const created = createTaskSyncEvent({
    action: 'create',
    task: normalizeTask({
      id: 'temp_task_1',
      title: 'Create through PowerSync',
      projectId: 'work',
      durationMinutes: 30
    }),
    revision: 'mut_ps_create',
    occurredAt: '2026-04-17T12:40:00.000Z'
  });
  const updated = createTaskSyncEvent({
    action: 'update',
    task: normalizeTask({
      id: 'temp_task_1',
      title: 'Update through PowerSync',
      projectId: 'work',
      durationMinutes: 30
    }),
    previousTask: normalizeTask({
      id: 'temp_task_1',
      title: 'Create through PowerSync',
      projectId: 'work',
      durationMinutes: 30
    }),
    revision: 'mut_ps_update',
    occurredAt: '2026-04-17T12:41:00.000Z'
  });
  const deleted = createTaskSyncEvent({
    action: 'delete',
    task: normalizeTask({
      id: 'temp_task_2',
      title: 'Delete through PowerSync',
      projectId: 'work',
      durationMinutes: 30
    }),
    previousTask: normalizeTask({
      id: 'temp_task_2',
      title: 'Delete through PowerSync',
      projectId: 'work',
      durationMinutes: 30
    }),
    revision: 'mut_ps_delete',
    occurredAt: '2026-04-17T12:42:00.000Z'
  });
  const batch = createPowerSyncUploadRequest([created, updated, deleted], {
    txId: 77
  });

  assert.deepEqual(batch.key, ['powersync', 'upload']);
  assert.equal(batch.txId, 77);
  assert.equal(batch.operationCount, 3);
  assert.deepEqual(batch.operationTypes, ['PUT', 'PATCH', 'DELETE']);
  assert.deepEqual(batch.tables, ['tasks']);
  assert.equal(batch.operations[0].op, 'PUT');
  assert.equal(batch.operations[0].type, 'tasks');
  assert.equal(batch.operations[0].id, 'temp_task_1');
  assert.equal(batch.operations[0].tx_id, 77);
  assert.equal(batch.operations[0].data.title, 'Create through PowerSync');
  assert.equal(JSON.parse(batch.operations[0].metadata).eventId, created.id);
  assert.equal(batch.operations[1].op, 'PATCH');
  assert.equal(batch.operations[1].data.title, 'Update through PowerSync');
  assert.equal(batch.operations[2].op, 'DELETE');
  assert.equal(batch.operations[2].old.id, 'temp_task_2');
});

runTest('sync batch response normalization and state application acknowledge successful events only', () => {
  const first = createTaskSyncEvent({
    action: 'create',
    task: normalizeTask({
      id: 'sync_ack_1',
      title: 'Ack first',
      projectId: 'inbox',
      durationMinutes: 30
    }),
    revision: 'mut_ack_1',
    occurredAt: '2026-04-17T12:30:00.000Z'
  });
  const second = createTaskSyncEvent({
    action: 'update',
    task: normalizeTask({
      id: 'sync_ack_2',
      title: 'Ack second',
      projectId: 'inbox',
      durationMinutes: 30
    }),
    revision: 'mut_ack_2',
    occurredAt: '2026-04-17T12:31:00.000Z'
  });
  const response = normalizePushEventBatchResponse({
    events: [
      { id: first.id, success: true, metadata: { serverRevision: 'srv_1' } },
      { id: second.id, success: false, error: 'conflict' }
    ]
  });
  const nextState = applySyncBatchResult({
    ...fixtureState,
    outbox: [first, second],
    syncStatus: 'syncing',
    deviceId: 'dev_syncing'
  }, response, {
    syncCursor: 'cursor_after_push'
  });

  assert.equal(response.successCount, 1);
  assert.equal(response.failureCount, 1);
  assert.deepEqual(response.acknowledgedIds, [first.id]);
  assert.deepEqual(response.failedIds, [second.id]);
  assert.equal(nextState.outbox.length, 1);
  assert.equal(nextState.outbox[0].id, second.id);
  assert.equal(nextState.syncStatus, 'failed');
  assert.equal(nextState.syncCursor, 'cursor_after_push');
  assert.equal(typeof nextState.lastSyncAt, 'string');
});

runTest('PowerSync upload response reconciliation keeps failed operations queued and remaps temp ids', () => {
  const createdTask = normalizeTask({
    id: 'temp_task_3',
    title: 'PowerSync temp create',
    projectId: 'inbox',
    durationMinutes: 30
  });
  const created = createTaskSyncEvent({
    action: 'create',
    task: createdTask,
    revision: 'mut_ps_ack_create',
    occurredAt: '2026-04-17T12:45:00.000Z'
  });
  const updated = createTaskSyncEvent({
    action: 'update',
    task: normalizeTask({
      ...createdTask,
      title: 'PowerSync temp update'
    }),
    previousTask: createdTask,
    revision: 'mut_ps_ack_update',
    occurredAt: '2026-04-17T12:46:00.000Z'
  });
  const request = createPowerSyncUploadRequest([created, updated], {
    txId: 91
  });
  const response = normalizePowerSyncUploadResponse({
    success: false,
    errors: [
      { operation: 2, error: 'conflict' }
    ],
    idMappings: [
      { tempId: 'temp_task_3', realId: 'task_real_3', table: 'tasks' }
    ]
  }, request);
  const nextState = applySyncBatchResult({
    ...fixtureState,
    tasks: [createdTask],
    outbox: [created, updated],
    syncStatus: 'syncing',
    deviceId: 'dev_powersync'
  }, {
    success: false,
    errors: [
      { operation: 2, error: 'conflict' }
    ],
    idMappings: [
      { tempId: 'temp_task_3', realId: 'task_real_3', table: 'tasks' }
    ]
  }, {
    request,
    syncCursor: 'cursor_after_powersync'
  });

  assert.equal(response.successCount, 1);
  assert.equal(response.failureCount, 1);
  assert.deepEqual(response.acknowledgedIds, [created.id]);
  assert.deepEqual(response.failedIds, [updated.id]);
  assert.equal(response.taskIdMap.temp_task_3, 'task_real_3');
  assert.equal(nextState.tasks[0].id, 'task_real_3');
  assert.equal(nextState.outbox.length, 1);
  assert.equal(nextState.outbox[0].entityId, 'task_real_3');
  assert.equal(nextState.outbox[0].payload.task.id, 'task_real_3');
  assert.equal(nextState.outbox[0].data.models.tasks.task_real_3.title, 'PowerSync temp update');
  assert.equal(nextState.syncStatus, 'failed');
  assert.equal(nextState.syncCursor, 'cursor_after_powersync');
  assert.equal(typeof nextState.lastSyncAt, 'string');
});

runTest('app state mutation helper appends outbox events and marks sync as pending', () => {
  const created = upsertTask([], { title: 'Queue me for sync', projectId: 'inbox', durationMinutes: 30 });
  const nextState = applyTaskMutation(
    {
      ...getFixtureState(),
      tasks: [],
      outbox: [],
      lastSyncAt: '2026-04-17T12:00:00.000Z',
      syncCursor: 'cursor_before',
      deviceId: 'dev_runtime',
      syncStatus: 'local'
    },
    created
  );

  assert.equal(Array.isArray(nextState.tasks), true);
  assert.equal(nextState.tasks.length, 1);
  assert.equal(nextState.outbox.length, 1);
  assert.equal(nextState.outbox[0]?.action, 'create');
  assert.equal(nextState.syncStatus, 'pending');
  assert.equal(nextState.lastSyncAt, '2026-04-17T12:00:00.000Z');
});

runTest('sync state summary exposes pending local-only runtime status', () => {
  const summary = getSyncStateSummary({
    outbox: [
      createTaskSyncEvent({
        action: 'create',
        task: normalizeTask({
          id: 'queue-summary-1',
          title: 'Queued summary task',
          projectId: 'inbox',
          durationMinutes: 30
        }),
        revision: 'mut_summary_1',
        occurredAt: '2026-04-17T12:15:00.000Z'
      })
    ],
    deviceId: 'dev_summary',
    syncStatus: 'local'
  });

  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.hasPendingChanges, true);
  assert.equal(summary.isDegraded, true);
  assert.equal(summary.syncStatus, 'pending');
  assert.equal(summary.pushEventCount, 1);
  assert.deepEqual(summary.pushEventTypes, ['push.task.create']);
  assert.equal(summary.uploadOperationCount, 1);
  assert.deepEqual(summary.uploadOperationTypes, ['PUT']);
  assert.deepEqual(summary.uploadTables, ['tasks']);
});

runTest('calendar overlay normalization keeps deterministic busy blocks and derives all-day end time', () => {
  const overlay = normalizeCalendarOverlay(FIXTURE_CALENDAR_OVERLAY);
  const busyBlocks = buildCalendarBusyBlocks(overlay.importedEvents);

  assert.equal(Array.isArray(overlay.calendars), true);
  assert.equal(overlay.calendars.length, FIXTURE_CALENDARS_RAW.length);
  assert.equal(Array.isArray(overlay.importedEvents), true);
  assert.equal(overlay.importedEvents.length, 3);
  assert.equal(overlay.permissionStatus, 'granted');
  assert.equal(overlay.source.provider, 'google');
  assert.equal(overlay.source.providerType, 'GOOGLE');
  assert.equal(overlay.source.accountEmail, 'gargig469@gmail.com');
  assert.equal(overlay.calendars[0]?.accessRole, 'OWNER');
  assert.equal(overlay.calendars[1]?.type, 'FREQUENTLY_MET');
  assert.equal(overlay.importedEvents[0]?.type, 'NORMAL');
  assert.equal(overlay.importedEvents[0]?.conferenceType, 'meet');
  assert.equal(overlay.importedEvents[0]?.attendees.length, 2);
  assert.equal(overlay.importedEvents[0]?.visibility, 'DEFAULT');
  assert.equal(overlay.importedEvents[2]?.allDay, true);
  assert.equal(overlay.importedEvents[2]?.endAt, '2026-04-19T00:00:00.000Z');
  assert.equal(busyBlocks.length, 3);
});

runTest('calendar overlay normalization drops invalid calendar rows safely', () => {
  const overlay = normalizeCalendarOverlay({
    calendars: [
      ...FIXTURE_CALENDARS_RAW,
      { id: '', title: 'Missing id', providerType: 'GOOGLE' }
    ],
    importedEvents: [
      ...FIXTURE_CALENDAR_EVENTS_RAW,
      { id: 'bad_1', title: 'Missing end', startAt: '2026-04-17T18:00:00.000Z' },
      { id: 'bad_2', title: 'Reverse range', startAt: '2026-04-17T20:00:00.000Z', endAt: '2026-04-17T19:00:00.000Z' },
      { title: 'No id', startAt: '2026-04-17T10:00:00.000Z', endAt: '2026-04-17T11:00:00.000Z' }
    ],
    permissionStatus: 'prompt',
    source: {
      provider: 'google',
      calendarIds: ['team-primary', 'team-primary', 'company-shared']
    }
  });

  assert.equal(overlay.calendars.length, 2);
  assert.equal(overlay.importedEvents.length, 3);
  assert.equal(overlay.permissionStatus, 'prompt');
  assert.deepEqual(overlay.source.calendarIds, ['team-primary', 'company-shared']);
});

runTest('calendar event normalization keeps Motion-like event metadata while preserving planner fields', () => {
  const event = normalizeCalendarEvent(FIXTURE_CALENDAR_EVENTS_RAW[0], {
    provider: 'google',
    providerType: 'GOOGLE',
    calendarId: 'team-primary',
    accountEmail: 'gargig469@gmail.com'
  });

  assert.equal(event.providerId, 'google_evt_1');
  assert.equal(event.providerType, 'GOOGLE');
  assert.equal(event.calendarUniqueId, 'team-primary');
  assert.equal(event.email, 'gargig469@gmail.com');
  assert.equal(event.start, '2026-04-17T13:00:00.000Z');
  assert.equal(event.end, '2026-04-17T14:00:00.000Z');
  assert.equal(event.availability, 'BUSY');
  assert.equal(event.organizer?.email, 'gargig469@gmail.com');
  assert.equal(event.attendees[1]?.email, 'customer@example.com');
  assert.equal(event.conferenceLink, 'https://meet.google.com/abc-defg-hij');
  assert.equal(event.lastModifiedAt, '2026-04-17T12:04:00.000Z');
});

runTest('task filter supports search and status windows', () => {
  const todaySearch = getTaskFilters(baseTasks, { statusFilter: 'all', query: 'draft' });
  assert.equal(todaySearch.length, 1);
  assert.equal(todaySearch[0].id, 'f1');

  const overdue = getTaskFilters(baseTasks, { statusFilter: 'overdue', now: FIXTURE_NOW });
  assert.equal(overdue.length, 1);
  assert.equal(overdue[0].id, 'f3');

  const todo = getTaskFilters(baseTasks, { statusFilter: 'todo' });
  assert.equal(todo.length, 4);
});

runTest('summary aligns with deterministic fixture timeline', () => {
  const summary = getTaskStateSummary(baseTasks, { now: FIXTURE_NOW });
  assert.equal(summary.today, 3);
  assert.equal(summary.upcoming, 0);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.done, 1);
});

runTest('task schedule summary follows Motion-like pending, on-track, and unfit semantics', () => {
  const onTrack = getTaskScheduleSummary(baseTasks.find((task) => task.id === 'f1'), { now: FIXTURE_NOW });
  const pending = getTaskScheduleSummary(baseTasks.find((task) => task.id === 'f3'), { now: FIXTURE_NOW });
  const customUnfit = getTaskScheduleSummary(
    normalizeTask({
      id: 'custom_unfit',
      title: 'Unfit fixture',
      projectId: 'work',
      isAutoScheduled: true,
      scheduledStatus: 'UNFIT_SCHEDULABLE',
      dueAt: '2026-04-20T17:00:00.000Z',
      durationMinutes: 45
    }),
    { now: FIXTURE_NOW }
  );

  assert.equal(onTrack.type, 'beforeDue');
  assert.equal(onTrack.shortLabel, 'On track');
  assert.equal(onTrack.tone, 'on');
  assert.equal(pending.type, 'pending');
  assert.equal(pending.label, 'Needs reschedule');
  assert.equal(customUnfit.type, 'unfitSchedulable');
  assert.equal(customUnfit.shortLabel, 'Future');
  assert.equal(getTaskScheduleType(baseTasks.find((task) => task.id === 'f2'), { now: FIXTURE_NOW }), 'completed');
});

runTest('conflict detector uses deterministic overlapping fixture tasks', () => {
  const plan = generatePlanSlice(baseTasks, { now: FIXTURE_NOW, limitMinutes: 480, horizonMinutes: 60 * 24 * 7 });
  assert.equal(Boolean(plan.overlaps.f1), true);
  assert.equal(plan.overlaps.f1.includes('f4'), true);
  assert.equal(plan.overlaps.f4.includes('f1'), true);
  assert.equal(Array.isArray(plan.rankedOverlaps), true);
});

runTest('planning window and overlap ranking are deterministic', () => {
  const window = buildPlanWindow(baseTasks, { now: FIXTURE_NOW, horizonMinutes: 60 * 24 * 7 });
  const ranked = rankConflicts(window.overlaps);
  assert.equal(Boolean(window.overlaps?.f1?.includes('f4')), true);
  assert.equal(window.visible.length >= 3, true);
  assert.equal(window.today.length >= 2, true);
  assert.equal(ranked.length >= 1, true);
  assert.equal(window.rankedOverlaps[0]?.taskId, 'f1');
  assert.equal(window.rankedOverlaps[0]?.count >= 1, true);
  assert.equal(window.week.length >= 2, true);
});

runTest('calendar-aware planning window reports busy blocks, blocked tasks, and available minutes', () => {
  const window = buildPlanWindow(baseTasks, {
    now: FIXTURE_NOW,
    horizonMinutes: 60 * 24 * 7,
    calendarOverlay: FIXTURE_CALENDAR_OVERLAY
  });

  assert.equal(window.busyBlocks.length, 3);
  assert.deepEqual(window.blockedTaskIds, ['f3', 'f4']);
  assert.deepEqual(window.calendarConflictTaskIds, ['f1', 'f4']);
  assert.deepEqual(window.conflictTaskIds, ['f1', 'f4']);
  assert.deepEqual(window.pendingTaskIds, ['f3']);
  assert.deepEqual(window.unschedulableTaskIds, []);
  assert.equal(window.taskSemantics.f3?.isDependencyBlocked, true);
  assert.equal(window.taskSemantics.f3?.isPendingReschedule, true);
  assert.equal(window.taskSemantics.f1?.isCalendarConflict, true);
  assert.equal(window.taskSemantics.f1?.scheduleType, 'beforeDue');
  assert.equal(window.availableMinutes, 8490);
  assert.equal(Boolean(window.overlaps?.f1?.includes('f4')), true);
});

runTest('calendar-aware plan slice preserves task overlap output while layering calendar conflicts', () => {
  const plan = generatePlanSlice(baseTasks, {
    now: FIXTURE_NOW,
    horizonMinutes: 60 * 24 * 7,
    calendarOverlay: FIXTURE_CALENDAR_OVERLAY
  });

  assert.equal(plan.busyBlocks.length, 3);
  assert.equal(plan.blockedTaskIds.includes('f3'), true);
  assert.equal(plan.blockedTaskIds.includes('f4'), true);
  assert.equal(plan.calendarConflictTaskIds.includes('f1'), true);
  assert.equal(plan.conflictTaskIds.includes('f4'), true);
  assert.equal(plan.pendingTaskIds.includes('f3'), true);
  assert.equal(plan.availableMinutes, 8490);
  assert.equal(Boolean(plan.overlaps?.f1?.includes('f4')), true);
});

runTest('planning semantics surface unschedulable tasks separately from dependency blocks', () => {
  const plan = buildPlanWindow([
    normalizeTask({
      id: 'blocker_task',
      title: 'Blocker',
      projectId: 'work',
      status: 'todo',
      scheduledStart: '2026-04-17T12:30:00.000Z',
      scheduledEnd: '2026-04-17T13:00:00.000Z',
      durationMinutes: 30
    }),
    normalizeTask({
      id: 'blocked_task',
      title: 'Blocked child',
      projectId: 'work',
      status: 'todo',
      isAutoScheduled: true,
      blockedByTaskIds: ['blocker_task'],
      scheduledStatus: 'ON_TRACK',
      scheduledStart: '2026-04-17T13:15:00.000Z',
      scheduledEnd: '2026-04-17T14:00:00.000Z',
      dueAt: '2026-04-17T17:00:00.000Z',
      durationMinutes: 45
    }),
    normalizeTask({
      id: 'cannot_fit',
      title: 'Cannot fit',
      projectId: 'work',
      status: 'todo',
      isAutoScheduled: true,
      scheduledStatus: 'UNFIT_PAST_DUE',
      dueAt: '2026-04-17T11:00:00.000Z',
      durationMinutes: 60
    })
  ], {
    now: FIXTURE_NOW,
    horizonMinutes: 60 * 24 * 7
  });

  assert.deepEqual(plan.blockedTaskIds, ['blocked_task']);
  assert.deepEqual(plan.unschedulableTaskIds, ['cannot_fit']);
  assert.equal(plan.pendingTaskIds.length, 0);
  assert.equal(plan.taskSemantics.blocked_task?.isDependencyBlocked, true);
  assert.equal(plan.taskSemantics.cannot_fit?.isUnschedulable, true);
  assert.equal(plan.taskSemantics.cannot_fit?.scheduleType, 'unfitPastDue');
});

runTest('feature gate keeps AI disabled by default', () => {
  const entitlement = getEntitlementSnapshot();
  const check = requireEntitlement('ai_suggest');
  assert.equal(entitlement.plan, 'free');
  assert.equal(check.allowed, false);
});

runTest('missing entitlement snapshot remains usable and safe default', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    storage.removeItem(ENTITLEMENT_STORAGE_KEY);
    const check = requireEntitlement('tasks_manage');
    assert.equal(check.allowed, true);
    assert.equal(check.plan, 'free');
    assert.equal(check.reason, null);
  });
});

runTest('expired entitlement disables task mutations', () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T13:00:00.000Z').valueOf();
  withLocalStorage(storage, () => {
    storage.setItem(
      ENTITLEMENT_STORAGE_KEY,
      JSON.stringify({
        userId: 'user-1',
        plan: 'pro',
        featureFlags: {
          ai_suggest: true,
          calendar_read: true,
          calendar_write: true,
          advanced_recurrence: true,
          tasks_manage: true
        },
        entitlements: ['tasks.basic', 'calendar.read'],
        source: 'test',
        token: 'rabbit-signature:test-token',
        issuedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now - 60 * 1000).toISOString()
      })
    );

    const snapshot = getEntitlementSnapshot({ now });
    const check = requireEntitlement('tasks_manage', now);

    assert.equal(snapshot.validation?.isExpired, true);
    assert.equal(check.allowed, false);
    assert.equal(check.reason.includes('entitlement expired'), true);
  });
});

runTest('tampered entitlement token blocks premium feature gates', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    storage.setItem(
      ENTITLEMENT_STORAGE_KEY,
      JSON.stringify({
        userId: 'user-1',
        plan: 'pro',
        featureFlags: {
          ai_suggest: true,
          calendar_read: true,
          calendar_write: true,
          advanced_recurrence: true,
          tasks_manage: true
        },
        entitlements: ['tasks.basic', 'calendar.read'],
        source: 'test',
        token: 'bad-token',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    );

    const check = requireEntitlement('ai_suggest');
    assert.equal(check.allowed, false);
    assert.equal(check.reason.includes('token signature'), true);
  });
});

runTest('authority response normalization flags revoked and malformed refresh payloads', () => {
  const revoked = normalizeAuthorityRefreshResponse(
    {
      status: 'revoked',
      source: 'mock-authority',
      reason: 'Subscription revoked by authority.'
    },
    { now: new Date('2026-04-17T12:00:00.000Z').valueOf() }
  );
  const malformed = normalizeAuthorityRefreshResponse(
    {
      status: 'active',
      source: 'mock-authority'
    },
    { now: new Date('2026-04-17T12:00:00.000Z').valueOf() }
  );

  assert.equal(revoked.ok, true);
  assert.equal(revoked.status, 'revoked');
  assert.equal(revoked.reason.includes('revoked'), true);
  assert.equal(malformed.ok, false);
  assert.equal(malformed.reason.includes('payload'), true);
});

runTest('stale entitlement summary is derived from authority freshness window', () => {
  const staleNow = new Date('2026-04-18T18:00:00.000Z').valueOf();
  const snapshot = getEntitlementSnapshot({
    now: staleNow,
    allowPersistence: false,
    rawSnapshot: {
      userId: 'user-1',
      plan: 'pro',
      featureFlags: {
        ai_suggest: true,
        calendar_read: true,
        calendar_write: true,
        advanced_recurrence: true,
        tasks_manage: true
      },
      entitlements: ['tasks.basic', 'calendar.read', 'ai.suggest'],
      source: 'mock-authority',
      token: 'rabbit-signature:test-token',
      issuedAt: '2026-04-17T08:00:00.000Z',
      expiresAt: '2026-04-30T08:00:00.000Z',
      authority: {
        status: 'fresh',
        source: 'mock-authority',
        checkedAt: '2026-04-17T08:00:00.000Z',
        lastAttemptAt: '2026-04-17T08:00:00.000Z',
        lastSuccessfulAt: '2026-04-17T08:00:00.000Z',
        staleAfterMs: ENTITLEMENT_REFRESH_STALE_MS
      }
    }
  });
  const summary = getEntitlementStateSummary({
    ...snapshot,
    now: staleNow
  });

  assert.equal(summary.isStale, true);
  assert.equal(summary.authorityStatus, 'stale');
  assert.equal(summary.reason.includes('freshness'), true);
});

await runAsyncTest('authority refresh upgrade path persists a fresh entitlement snapshot', async () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T12:00:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    const snapshot = await refreshEntitlementSnapshot({
      now,
      transport: createMockEntitlementTransport()
    });
    const check = requireEntitlement('ai_suggest', now, snapshot);
    const saved = JSON.parse(storage.getItem(ENTITLEMENT_STORAGE_KEY));

    assert.equal(snapshot.authority.status, 'fresh');
    assert.equal(snapshot.plan, 'free');
    assert.equal(check.allowed, false);
    assert.equal(saved.authority.status, 'fresh');
    assert.equal(saved.authority.source, 'mock-authority');
  });
});

await runAsyncTest('authority refresh can mock an upgrade and unlock premium flags', async () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T12:10:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    const snapshot = await refreshEntitlementSnapshot({
      now,
      scenario: 'upgrade',
      transport: createMockEntitlementTransport()
    });
    const summary = getEntitlementStateSummary(snapshot);

    assert.equal(snapshot.authority.status, 'fresh');
    assert.equal(snapshot.plan, 'pro');
    assert.equal(summary.aiEnabled, true);
    assert.equal(summary.calendarReadEnabled, true);
    assert.equal(requireEntitlement('ai_suggest', now, snapshot).allowed, true);
  });
});

await runAsyncTest('offline authority refresh keeps the last safe snapshot and marks it offline', async () => {
  const storage = createLocalStorageMock();
  const onlineNow = new Date('2026-04-17T12:15:00.000Z').valueOf();
  const offlineNow = new Date('2026-04-17T12:30:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    await refreshEntitlementSnapshot({
      now: onlineNow,
      scenario: 'upgrade',
      transport: createMockEntitlementTransport()
    });

    const snapshot = await refreshEntitlementSnapshot({
      now: offlineNow,
      scenario: 'offline',
      transport: createMockEntitlementTransport()
    });
    const summary = getEntitlementStateSummary(snapshot);

    assert.equal(summary.isOffline, true);
    assert.equal(summary.authorityStatus, 'offline');
    assert.equal(snapshot.plan, 'pro');
    assert.equal(summary.aiEnabled, true);
    assert.equal(summary.reason.includes('offline'), true);
  });
});

await runAsyncTest('revoked authority refresh forces read-only fallback', async () => {
  const storage = createLocalStorageMock();
  const now = new Date('2026-04-17T13:00:00.000Z').valueOf();
  await withLocalStorage(storage, async () => {
    const snapshot = await refreshEntitlementSnapshot({
      now,
      scenario: 'revoked',
      transport: createMockEntitlementTransport()
    });
    const summary = getEntitlementStateSummary(snapshot);
    const taskCheck = requireEntitlement('tasks_manage', now, snapshot);

    assert.equal(summary.isRevoked, true);
    assert.equal(summary.authorityStatus, 'revoked');
    assert.equal(summary.canMutate, false);
    assert.equal(taskCheck.allowed, false);
    assert.equal(taskCheck.reason.includes('revoked'), true);
  });
});

runTest('task IDs are stable unique shape', () => {
  const first = createTaskId();
  const second = createTaskId();
  assert.equal(first === second, false);
  assert.equal(first.length > 10, true);
});

runTest('storage contract migrates legacy payloads by injecting calendar and shell state', () => {
  const result = validatePersistedPayload({
    version: '0.9.0',
    schemaVersion: 1,
    projects: fixtureState.projects,
    tasks: fixtureState.tasks
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(result.value.migration.hasMigration, true);
  assert.equal(result.value.migration.fromVersion, 1);
  assert.equal(result.value.migration.toVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(Array.isArray(result.value.projects), true);
  assert.equal(result.value.projects.length, 4);
  assert.equal(result.value.tasks.length, 5);
  assert.equal(Array.isArray(result.value.calendarOverlay.calendars), true);
  assert.equal(result.value.calendarOverlay.calendars.length, 0);
  assert.equal(Array.isArray(result.value.calendarOverlay.importedEvents), true);
  assert.equal(result.value.calendarOverlay.importedEvents.length, 0);
  assert.equal(Array.isArray(result.value.shell.tabs), true);
  assert.equal(Array.isArray(result.value.shell.savedViews), true);
  assert.equal(result.value.shell.activeTabId, 'tab_calendar');
});

runTest('storage contract keeps seeded shell state on current fixture payloads', () => {
  const result = validatePersistedPayload(fixtureState);

  assert.equal(result.ok, true);
  assert.equal(result.value.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(result.value.tasks[0].workspaceId, 'ws_motion_team');
  assert.equal(result.value.tasks[0].priorityLevel, 'HIGH');
  assert.equal(result.value.tasks[0].scheduledStatus, 'ON_TRACK');
  assert.equal(result.value.tasks[0].taskDefinitionId, 'taskdef_weekly_plan');
  assert.equal(result.value.shell.theme.mode, 'dark');
  assert.equal(result.value.shell.savedViews.length, 4);
  assert.equal(result.value.shell.sidebarSections.length, 4);
  assert.equal(result.value.shell.agenda.counts.total, 6);
  assert.equal(result.value.calendarOverlay.calendars.length, 2);
  assert.equal(result.value.calendarOverlay.calendars[0]?.providerType, 'GOOGLE');
  assert.equal(result.value.calendarOverlay.importedEvents[0]?.providerType, 'GOOGLE');
  assert.equal(result.value.calendarOverlay.importedEvents[0]?.attendees.length, 2);
});

runTest('storage contract removes malformed payload rows while retaining valid fixture-like rows', () => {
  const badPayload = {
    schemaVersion: 1,
    version: '1.0.0',
    projects: [
      { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false }
    ],
    tasks: [
      { title: '', projectId: 'inbox' },
      { title: 'Valid task', projectId: 'inbox', status: 'done', dueAt: 'not-a-date' },
      { title: 'Another valid task', projectId: 'unknown-project', durationMinutes: 15 }
    ]
  };

  const result = validatePersistedPayload(badPayload);

  assert.equal(result.ok, true);
  assert.equal(result.value.tasks.length, 2);
  assert.equal(result.value.tasks.some((task) => task.title === 'Valid task'), true);
  assert.equal(result.value.tasks.some((task) => task.title === 'Another valid task'), true);
  assert.equal(result.value.tasks.some((task) => task.projectId === 'inbox'), true);
  assert.equal(Array.isArray(result.value.calendarOverlay.importedEvents), true);
});

runTest('storage load/save path keeps sync metadata, outbox, and revision-safe data shape', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    const outboxEvent = createTaskSyncEvent({
      action: 'create',
      task: normalizeTask({
        id: 'sync-fixture-1',
        title: 'Persist sync event',
        projectId: 'inbox',
        dueAt: '2026-04-17T12:05:00.000Z',
        durationMinutes: 30
      }),
      revision: 'mut_fixture_create',
      occurredAt: '2026-04-17T12:05:00.000Z'
    });

    const payload = {
      schemaVersion: 1,
      version: '0.9.0',
      projects: getFixtureState().projects,
      tasks: getFixtureState().tasks,
      calendarOverlay: getFixtureState().calendarOverlay,
      shell: getFixtureState().shell,
      outbox: [outboxEvent, outboxEvent],
      lastSyncAt: '2026-04-17T12:00:00.000Z',
      syncCursor: 'cursor_step15',
      syncStatus: 'synced',
      metadata: { source: 'desktop', syncState: 'local' }
    };

    const savedSnapshot = saveStoredData(payload);
    const raw = storage.getItem('motion_clone_phase1_app_data');
    assert.equal(typeof raw, 'string');

    const saved = JSON.parse(raw);
    assert.equal(saved.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(typeof saved.metadata, 'object');
    assert.equal(saved.metadata.app, 'rabbit');
    assert.equal(saved.metadata.source, 'desktop');
    assert.equal(saved.metadata.syncState, 'pending');
    assert.equal(saved.metadata.shellState, 'present');
    assert.equal(saved.metadata.queryCacheState, 'present');
    assert.equal(saved.metadata.cachedQueryCount, 8);
    assert.equal(Array.isArray(saved.outbox), true);
    assert.equal(saved.outbox.length, 1);
    assert.equal(saved.syncCursor, 'cursor_step15');
    assert.equal(saved.syncStatus, 'pending');
    assert.equal(typeof saved.deviceId, 'string');
    assert.equal(saved.calendarOverlay.permissionStatus, 'granted');
    assert.equal(saved.calendarOverlay.calendars.length, 2);
    assert.equal(saved.calendarOverlay.importedEvents.length, 3);
    assert.equal(saved.calendarOverlay.source.providerType, 'GOOGLE');
    assert.equal(saved.calendarOverlay.source.accountEmail, 'gargig469@gmail.com');
    assert.equal(saved.tasks[0].workspaceId, 'ws_motion_team');
    assert.equal(saved.tasks[0].priorityLevel, 'HIGH');
    assert.equal(saved.tasks[0].blockingTaskIds.includes('f4'), true);
    assert.equal(saved.shell.theme.mode, 'dark');
    assert.equal(saved.shell.tabs.length, 3);
    assert.equal(saved.shell.savedViews.length, 4);
    assert.equal(Array.isArray(saved.queryCache?.queries), true);
    assert.equal(saved.queryCache.queries.length, 8);
    assert.equal(saved.queryCache.queries.some((entry) => JSON.stringify(entry.key) === JSON.stringify(['v2', 'users', 'me', 'settings'])), true);
    assert.equal(saved.queryCache.queries.some((entry) => JSON.stringify(entry.key) === JSON.stringify(['v3', 'views'])), true);
    assert.equal(saved.queryCache.queries.some((entry) => JSON.stringify(entry.key) === JSON.stringify(['uncached_calendar_list'])), true);
    assert.equal(savedSnapshot.syncStatus, 'pending');
    assert.equal(savedSnapshot.outbox.length, 1);
    assert.equal(savedSnapshot.calendarOverlay.source.provider, 'google');
    assert.equal(savedSnapshot.tasks[0].scheduledStatus, 'ON_TRACK');
    assert.equal(savedSnapshot.shell.activeViewId, 'view_my_tasks');
    assert.equal(Array.isArray(savedSnapshot.queryCache?.queries), true);
    assert.equal(savedSnapshot.queryCache.queries.length, 8);

    const loaded = loadStoredData();
    assert.equal(Array.isArray(loaded.tasks), true);
    assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(Array.isArray(loaded.outbox), true);
    assert.equal(loaded.outbox.length, 1);
    assert.equal(loaded.outbox[0]?.entityType, 'task');
    assert.equal(loaded.syncCursor, 'cursor_step15');
    assert.equal(loaded.syncStatus, 'pending');
    assert.equal(loaded.deviceId, saved.deviceId);
    assert.equal(loaded.calendarOverlay.permissionStatus, 'granted');
    assert.equal(loaded.calendarOverlay.calendars.length, 2);
    assert.equal(loaded.calendarOverlay.importedEvents.length, 3);
    assert.equal(loaded.calendarOverlay.importedEvents[0]?.provider, 'google');
    assert.equal(loaded.calendarOverlay.importedEvents[0]?.providerType, 'GOOGLE');
    assert.equal(loaded.calendarOverlay.importedEvents[0]?.attendees.length, 2);
    assert.equal(loaded.tasks[0].workspaceId, 'ws_motion_team');
    assert.equal(loaded.tasks[0].priorityLevel, 'HIGH');
    assert.equal(loaded.tasks[0].scheduledStatus, 'ON_TRACK');
    assert.equal(Array.isArray(loaded.shell.tabs), true);
    assert.equal(loaded.shell.tabs.length, 3);
    assert.equal(loaded.shell.savedViews.length, 4);
    assert.equal(loaded.shell.agenda.counts.total, 6);
    assert.equal(Array.isArray(loaded.queryCache?.queries), true);
    assert.equal(loaded.queryCache.queries.length, 8);
    assert.equal(loaded.queryCache.queries.some((entry) => JSON.stringify(entry.key) === JSON.stringify(['v2', 'users', 'me', 'settings'])), true);
    assert.equal(loaded.queryCache.queries.some((entry) => JSON.stringify(entry.key) === JSON.stringify(['v3', 'views'])), true);
    assert.equal(loaded.queryCache.queries.some((entry) => JSON.stringify(entry.key) === JSON.stringify(['uncached_calendar_list'])), true);
    assert.equal(Array.isArray(loaded.metadata?.revision) || typeof loaded.metadata?.revision === 'string', true);
  });
});

runTest('storage handles future schema payload by applying an upgrade compatibility shim', () => {
  const storage = createLocalStorageMock();
  withLocalStorage(storage, () => {
    const futurePayload = {
      schemaVersion: CURRENT_SCHEMA_VERSION + 1,
      version: '1.2.0',
      projects: getFixtureState().projects,
      tasks: getFixtureState().tasks
    };
    storage.setItem('motion_clone_phase1_app_data', JSON.stringify(futurePayload));

    const loaded = loadStoredData();
    assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(loaded.migration?.hasMigration, true);
    assert.equal(loaded.migration?.fromVersion, CURRENT_SCHEMA_VERSION + 1);
    assert.equal(Array.isArray(loaded.migration?.steps), true);
    assert.equal(loaded.migration?.steps.length > 0, true);
  });
});

console.log(`PASS: Domain regression suite completed (${baseTasks.length} fixture tasks)`);
