import { applyTaskMutation, buildProjectSeedData, decorateTaskWithProject, getProjectById, getSyncStateSummary, getTaskFilters, getTaskStateSummary, resolveTaskAction, upsertTask, formatDisplayDateTime } from './state.js';
import { buildPlanWindow } from './scheduler.js';
import { loadStoredData, saveStoredData } from './storage.js';
import { canMutateTasks, getEntitlementSnapshot, getEntitlementStateSummary, refreshEntitlementSnapshot, requireEntitlement, resolveFeatureGate } from './entitlement.js';
import { ENTITLEMENT_REFRESH_SCENARIOS } from './entitlementClient.js';

let entitlement = getEntitlementSnapshot();
let canMutate = canMutateTasks();
let appData = loadStoredData();
let tasks = appData.tasks.slice();
let activeFilter = 'all';
let activePlanWindow = 'all';
let search = '';
let entitlementRefreshMode = 'active';
let isRefreshingEntitlement = false;

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing app root');
}

const shell = document.createElement('main');
shell.className = 'app-shell';
root.appendChild(shell);

shell.innerHTML = `
  <header class="app-header">
    <h1>Motion Clone</h1>
    <p class="entitlement" id="entitlement-status">Plan: ${entitlement.plan} | AI: ${resolveFeatureGate('ai_suggest') ? 'enabled' : 'disabled'} | Calendar read: ${resolveFeatureGate('calendar_read') ? 'enabled' : 'disabled'} | Mutations: ${canMutate ? 'enabled' : 'read-only'}</p>
  </header>

  <section class="sync-panel" id="sync-panel" aria-live="polite"></section>
  <section class="entitlement-panel" id="entitlement-panel" aria-live="polite"></section>

  <section class="metrics" id="metrics"></section>

  <section class="toolbar">
    <input id="search" type="text" placeholder="Search tasks" />
    <div class="btn-group" id="filter-group">
      <button type="button" class="filter active" data-status="all">All</button>
      <button type="button" class="filter" data-status="todo">Todo</button>
      <button type="button" class="filter" data-status="done">Done</button>
      <button type="button" class="filter" data-status="overdue">Overdue</button>
    </div>
    <div class="btn-group" id="plan-window-group">
      <button type="button" class="plan-window active" data-window="all">Window: All</button>
      <button type="button" class="plan-window" data-window="today">Today</button>
      <button type="button" class="plan-window" data-window="week">Week</button>
    </div>
  </section>

  <section class="form-row">
    <label>
      Title
      <input id="title" type="text" placeholder="Task title" />
    </label>
    <label>
      Project
      <select id="project"></select>
    </label>
    <label>
      Due
      <input id="due" type="datetime-local" />
    </label>
    <label>
      Duration
      <input id="duration" type="number" min="5" max="720" step="5" value="30" />
    </label>
    <label>
      Recurrence
      <select id="recurrence">
        <option value="none">none</option>
        <option value="daily">daily</option>
        <option value="weekly">weekly</option>
      </select>
    </label>
    <button id="add" type="button">Add</button>
  </section>

  <section class="editor" id="editor" aria-live="polite"></section>

  <section id="task-list" class="task-list"></section>
`;

const style = document.createElement('style');
style.textContent = `
  :root {
    color-scheme: light;
  }
  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f6f7fb;
    color: #111827;
  }
  .app-shell {
    max-width: 1140px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    gap: 12px;
  }
  .app-header h1 {
    margin: 0;
  }
  .app-header p {
    margin: 6px 0;
  }
  .entitlement {
    color: #4b5563;
    font-size: 13px;
  }
  .metrics,
  .toolbar,
  .form-row,
  .editor,
  .task-list,
  .sync-panel,
  .entitlement-panel {
    background: #fff;
    border: 1px solid #d9deea;
    border-radius: 12px;
    padding: 12px;
  }
  .toolbar,
  .form-row,
  .task-item {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    align-items: end;
  }
  .toolbar {
    align-items: center;
  }
  .btn-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .toolbar input,
  .toolbar button,
  .form-row input,
  .form-row select,
  .form-row button,
  .editor,
  .task-actions button {
    border: 1px solid #cfd3dc;
    border-radius: 8px;
    padding: 8px;
  }
  .toolbar button,
  .form-row button,
  .task-actions button {
    background: #fff;
    border-color: #cbd5e1;
    cursor: pointer;
  }
  .toolbar button.active {
    background: #111827;
    color: #fff;
  }
  .form-row label {
    display: grid;
    gap: 5px;
    font-size: 12px;
    color: #334155;
  }
  .form-row button {
    align-self: end;
  }
  .task-item {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 8px;
  }
  .task-title {
    font-weight: 700;
  }
  .task-title.done {
    text-decoration: line-through;
    color: #64748b;
  }
  .muted {
    color: #64748b;
    font-size: 12px;
  }
  .task-actions {
    display: flex;
    gap: 6px;
  }
  .conflict {
    color: #b91c1c;
    font-size: 12px;
  }
  .error {
    color: #b91c1c;
    font-size: 12px;
  }
  .sync-panel {
    display: grid;
    gap: 8px;
    background: #f8fafc;
  }
  .entitlement-panel {
    display: grid;
    gap: 8px;
    background: #f8fafc;
  }
  .sync-header {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }
  .sync-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .sync-pill.local-only {
    background: #e2e8f0;
    color: #334155;
  }
  .sync-pill.pending,
  .sync-pill.offline {
    background: #fef3c7;
    color: #92400e;
  }
  .sync-pill.healthy {
    background: #dcfce7;
    color: #166534;
  }
  .sync-pill.degraded {
    background: #fee2e2;
    color: #991b1b;
  }
  .sync-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  .sync-stat {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px;
    background: #fff;
  }
  .sync-stat strong {
    display: block;
    font-size: 12px;
    color: #475569;
    margin-bottom: 6px;
  }
  .sync-value {
    font-size: 18px;
    font-weight: 700;
  }
  .sync-note {
    margin: 0;
    font-size: 12px;
    color: #475569;
  }
  .calendar-summary {
    display: grid;
    gap: 8px;
  }
  .control-row {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    align-items: end;
  }
  .control-row label {
    display: grid;
    gap: 5px;
    font-size: 12px;
    color: #334155;
  }
  .control-row select,
  .control-row button {
    border: 1px solid #cfd3dc;
    border-radius: 8px;
    padding: 8px;
    background: #fff;
  }
  .control-row button {
    cursor: pointer;
  }
  .control-row button[disabled] {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

document.head.appendChild(style);

const metricsEl = shell.querySelector('#metrics') as HTMLDivElement;
const syncPanelEl = shell.querySelector('#sync-panel') as HTMLDivElement;
const entitlementPanelEl = shell.querySelector('#entitlement-panel') as HTMLDivElement;
const searchEl = shell.querySelector('#search') as HTMLInputElement;
const filterContainer = shell.querySelector('#filter-group') as HTMLDivElement;
const planWindowContainer = shell.querySelector('#plan-window-group') as HTMLDivElement;
const titleEl = shell.querySelector('#title') as HTMLInputElement;
const projectEl = shell.querySelector('#project') as HTMLSelectElement;
const dueEl = shell.querySelector('#due') as HTMLInputElement;
const durationEl = shell.querySelector('#duration') as HTMLInputElement;
const recurrenceEl = shell.querySelector('#recurrence') as HTMLSelectElement;
const addBtn = shell.querySelector('#add') as HTMLButtonElement;
const editorEl = shell.querySelector('#editor') as HTMLElement;
const taskListEl = shell.querySelector('#task-list') as HTMLDivElement;
const entitlementStatusEl = shell.querySelector('#entitlement-status') as HTMLParagraphElement;
const warningEl = document.createElement('p');

function getEntitlementPresentation(summary) {
  if (summary.isRevoked) {
    return {
      badgeClass: 'degraded',
      title: 'Revoked',
      detail: summary.reason || 'The authority revoked this entitlement, so premium actions are blocked safely.'
    };
  }

  if (summary.isOffline) {
    return {
      badgeClass: 'offline',
      title: 'Offline',
      detail: summary.reason || 'Authority refresh is offline, so the app is using the last safe entitlement snapshot.'
    };
  }

  if (summary.isStale) {
    return {
      badgeClass: 'pending',
      title: 'Stale',
      detail: summary.reason || 'Entitlement data is older than the freshness window and should be refreshed soon.'
    };
  }

  if (summary.isFresh) {
    return {
      badgeClass: 'healthy',
      title: 'Fresh',
      detail: summary.reason || 'Entitlement was confirmed recently by the authority.'
    };
  }

  return {
    badgeClass: 'local-only',
    title: 'Cached',
    detail: summary.reason || 'The app is still using cached entitlement data until the first authority refresh runs.'
  };
}

function updateEntitlementPanel() {
  const summary = getEntitlementStateSummary(entitlement);
  const presentation = getEntitlementPresentation(summary);
  const refreshOptions = ENTITLEMENT_REFRESH_SCENARIOS.map(({ id, label }) => {
    const selected = id === entitlementRefreshMode ? 'selected' : '';
    return `<option value="${id}" ${selected}>${label}</option>`;
  }).join('');
  const refreshButtonLabel = isRefreshingEntitlement ? 'Refreshing...' : 'Refresh entitlement';

  entitlementPanelEl.innerHTML = `
    <div class="sync-header">
      <strong>Entitlement authority</strong>
      <span class="sync-pill ${presentation.badgeClass}">${presentation.title}</span>
    </div>
    <div class="sync-grid">
      <div class="sync-stat">
        <strong>Plan</strong>
        <div class="sync-value">${summary.plan}</div>
      </div>
      <div class="sync-stat">
        <strong>Last success</strong>
        <div class="sync-value">${formatSyncDate(summary.lastSuccessfulAt)}</div>
      </div>
      <div class="sync-stat">
        <strong>Last attempt</strong>
        <div class="sync-value">${formatSyncDate(summary.lastAttemptAt)}</div>
      </div>
      <div class="sync-stat">
        <strong>Authority source</strong>
        <div class="sync-value">${summary.source || 'Unknown'}</div>
      </div>
    </div>
    <div class="control-row">
      <label>
        Mock authority response
        <select id="entitlement-refresh-mode">
          ${refreshOptions}
        </select>
      </label>
      <button id="entitlement-refresh-btn" type="button" ${isRefreshingEntitlement ? 'disabled' : ''}>${refreshButtonLabel}</button>
    </div>
    <p class="sync-note">${presentation.detail}</p>
  `;
}

function refreshEntitlementState() {
  entitlement = getEntitlementSnapshot({ allowPersistence: false });
  const entitlementSummary = getEntitlementStateSummary(entitlement);
  const entitlementCheck = requireEntitlement('tasks_manage', Date.now(), entitlement);
  canMutate = entitlementCheck.allowed;
  const aiStatus = entitlementSummary.aiEnabled ? 'enabled' : 'disabled';
  const calendarStatus = entitlementSummary.calendarReadEnabled ? 'enabled' : 'disabled';
  const mutationState = canMutate ? 'enabled' : 'read-only';
  entitlementStatusEl.textContent = `Plan: ${entitlement.plan} | Authority: ${entitlementSummary.authorityStatus} | AI: ${aiStatus} | Calendar read: ${calendarStatus} | Mutations: ${mutationState}`;
  addBtn.disabled = !canMutate;
  updateEntitlementPanel();

  if (!canMutate && entitlementCheck.reason) {
    warningEl.className = 'error';
    warningEl.textContent = `Read-only mode active: ${entitlementCheck.reason}`;
    editorEl.prepend(warningEl);
    return;
  }

  if (warningEl.parentElement === editorEl) {
    warningEl.remove();
  }
}

function hydrateProjects() {
  projectEl.innerHTML = '';
  buildProjectSeedData(appData.projects).forEach((project) => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    projectEl.appendChild(option);
  });
}

function setFilter(filter) {
  activeFilter = filter;
  filterContainer.querySelectorAll('.filter').forEach((button) => {
    const buttonEl = button as HTMLButtonElement;
    buttonEl.classList.toggle('active', buttonEl.dataset.status === filter);
  });
}

function setPlanWindowFilter(windowFilter) {
  activePlanWindow = windowFilter;
  planWindowContainer.querySelectorAll('.plan-window').forEach((button) => {
    const buttonEl = button as HTMLButtonElement;
    buttonEl.classList.toggle('active', buttonEl.dataset.window === windowFilter);
  });
}

function buildTaskDraft() {
  const title = titleEl.value.trim();
  const projectId = projectEl.value;
  const dueAt = dueEl.value ? new Date(dueEl.value).toISOString() : null;
  const durationMinutes = Number(durationEl.value || 30);
  const recurrence = { pattern: recurrenceEl.value };
  const project = getProjectById(appData.projects, projectId);

  return {
    title,
    projectId,
    projectName: project?.name || 'Inbox',
    dueAt,
    durationMinutes,
    recurrence
  };
}

function clearDraft() {
  titleEl.value = '';
  dueEl.value = '';
  durationEl.value = '30';
  recurrenceEl.value = 'none';
}

function showError(message) {
  editorEl.textContent = '';
  if (!message) return;
  const line = document.createElement('p');
  line.className = 'error';
  line.textContent = message;
  editorEl.appendChild(line);
}

function formatSyncDate(value) {
  if (!value) {
    return 'Not yet';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'Not yet';
  }

  return parsed.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getSyncPresentation(sync) {
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  if (isOffline && sync.hasPendingChanges) {
    return {
      badgeClass: 'offline',
      title: 'Offline',
      detail: 'Changes are saved on this device and will stay queued until sync is available again.'
    };
  }

  if (sync.isFailed) {
    return {
      badgeClass: 'degraded',
      title: 'Degraded',
      detail: 'The local outbox is preserved, but remote sync needs attention before these changes are confirmed elsewhere.'
    };
  }

  if (sync.isSyncing) {
    return {
      badgeClass: 'healthy',
      title: 'Syncing',
      detail: 'The local outbox is actively being prepared for sync.'
    };
  }

  if (sync.hasPendingChanges) {
    return {
      badgeClass: 'pending',
      title: 'Pending',
      detail: 'Changes are stored locally and waiting for the future remote sync path.'
    };
  }

  if (sync.isSynced) {
    return {
      badgeClass: 'healthy',
      title: 'Healthy',
      detail: 'No pending local changes are waiting in the outbox.'
    };
  }

  return {
    badgeClass: 'local-only',
    title: 'Local only',
    detail: 'This install is ready for sync later, but no remote sync has run in this session yet.'
  };
}

function updateSyncStatus() {
  const sync = getSyncStateSummary(appData);
  const presentation = getSyncPresentation(sync);

  syncPanelEl.innerHTML = `
    <div class="sync-header">
      <strong>Sync health</strong>
      <span class="sync-pill ${presentation.badgeClass}">${presentation.title}</span>
    </div>
    <div class="sync-grid">
      <div class="sync-stat">
        <strong>Pending changes</strong>
        <div class="sync-value">${sync.pendingCount}</div>
      </div>
      <div class="sync-stat">
        <strong>Last sync</strong>
        <div class="sync-value">${formatSyncDate(sync.lastSyncAt)}</div>
      </div>
      <div class="sync-stat">
        <strong>Cursor</strong>
        <div class="sync-value">${sync.syncCursor || 'Not set'}</div>
      </div>
      <div class="sync-stat">
        <strong>Device</strong>
        <div class="sync-value">${sync.deviceId || 'Unknown'}</div>
      </div>
    </div>
    <p class="sync-note">${presentation.detail}</p>
  `;
}

function buildPlannerState() {
  const filteredTasks = getTaskFilters(tasks, { statusFilter: activeFilter, query: search }).map((task) => {
    return decorateTaskWithProject(task, appData.projects);
  });
  const planWindow = buildPlanWindow(filteredTasks, {
    calendarOverlay: appData.calendarOverlay
  });

  let visibleEntries = planWindow.visible;
  if (activePlanWindow === 'today') {
    visibleEntries = planWindow.today;
  } else if (activePlanWindow === 'week') {
    visibleEntries = planWindow.week;
  }

  const visibleTasks = visibleEntries.map((entry) => entry.task);
  const visibleTaskIds = new Set(visibleTasks.map((task) => task.id));
  const overlaps = Object.fromEntries(
    Object.entries(planWindow.overlaps)
      .filter(([taskId]) => visibleTaskIds.has(taskId))
      .map(([taskId, peers]) => [taskId, peers.filter((peerId) => visibleTaskIds.has(peerId))])
      .filter(([, peers]) => peers.length > 0)
  );
  const blockedTaskIds = planWindow.blockedTaskIds.filter((taskId) => visibleTaskIds.has(taskId));

  return {
    planWindow,
    visibleTasks,
    overlaps,
    blockedTaskIds
  };
}

function updateSummary(plannerState) {
  const summary = getTaskStateSummary(tasks);
  const overlay = appData.calendarOverlay || {
    importedEvents: [],
    permissionStatus: 'unknown',
    refreshedAt: null
  };
  const permissionLabel = overlay.permissionStatus === 'granted'
    ? `${plannerState.planWindow.busyBlocks.length} busy blocks active`
    : `Calendar overlay ${overlay.permissionStatus}`;

  metricsEl.innerHTML = `
    <div class="calendar-summary">
      <div class="sync-grid">
        <div class="sync-stat">
          <strong>Today</strong>
          <div class="sync-value">${summary.today}</div>
        </div>
        <div class="sync-stat">
          <strong>Upcoming</strong>
          <div class="sync-value">${summary.upcoming}</div>
        </div>
        <div class="sync-stat">
          <strong>Overdue</strong>
          <div class="sync-value">${summary.overdue}</div>
        </div>
        <div class="sync-stat">
          <strong>Busy blocks</strong>
          <div class="sync-value">${plannerState.planWindow.busyBlocks.length}</div>
        </div>
        <div class="sync-stat">
          <strong>Blocked tasks</strong>
          <div class="sync-value">${plannerState.blockedTaskIds.length}</div>
        </div>
        <div class="sync-stat">
          <strong>Available minutes</strong>
          <div class="sync-value">${plannerState.planWindow.availableMinutes}</div>
        </div>
      </div>
      <p class="sync-note">${permissionLabel} | Refreshed: ${formatSyncDate(overlay.refreshedAt)}</p>
    </div>
  `;
}

function renderTasks(plannerState) {
  const { visibleTasks, overlaps, blockedTaskIds } = plannerState;
  const blockedTaskSet = new Set(blockedTaskIds);
  taskListEl.innerHTML = '';

  if (!visibleTasks.length) {
    taskListEl.innerHTML = '<p class="muted">No matching tasks.</p>';
    return;
  }

  visibleTasks.forEach((task) => {
    const conflictIds = overlaps[task.id] || [];
    const isCalendarBlocked = blockedTaskSet.has(task.id);
    const item = document.createElement('article');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="muted">${task.projectName} | status: ${task.status}</div>
      <div class="task-title ${task.status === 'done' ? 'done' : ''}">${task.title}</div>
      <div class="muted">Due: ${formatDisplayDateTime(task.dueAt)} | Duration: ${task.durationMinutes} min | Recurrence: ${task.recurrence.pattern}</div>
      <div class="muted">${task.description ? task.description : 'No notes'}</div>
      ${conflictIds.length ? `<div class="conflict">Task overlap with: ${conflictIds.join(', ')}</div>` : ''}
      ${isCalendarBlocked ? '<div class="conflict">Calendar busy block overlaps this task.</div>' : ''}
      <div class="task-actions">
        <button data-action="complete" data-id="${task.id}" ${canMutate ? '' : 'disabled'}>${task.status === 'done' ? 'Undo' : 'Done'}</button>
        <button data-action="delete" data-id="${task.id}" ${canMutate ? '' : 'disabled'}>Delete</button>
      </div>
    `;
    taskListEl.appendChild(item);
  });
}

function persistAppData() {
  const saved = saveStoredData(appData);
  if (saved) {
    appData = saved;
    tasks = appData.tasks.slice();
  }
}

function renderPlannerViews() {
  const plannerState = buildPlannerState();
  updateSummary(plannerState);
  renderTasks(plannerState);
}

function renderAll() {
  refreshEntitlementState();
  persistAppData();
  updateSyncStatus();
  renderPlannerViews();
}

addBtn.addEventListener('click', () => {
  if (!canMutate) {
    showError('This install is currently read-only due to entitlement status.');
    return;
  }
  const draft = buildTaskDraft();
  const result = upsertTask(tasks, draft);
  if (!result.ok) {
    showError(result.error);
    return;
  }

  appData = applyTaskMutation(appData, result);
  tasks = appData.tasks.slice();
  clearDraft();
  showError('');
  renderAll();
});

searchEl.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    search = target.value.trim();
    renderPlannerViews();
  }
});

filterContainer.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  const status = target.dataset.status;
  if (!status) {
    return;
  }
  setFilter(status);
  renderPlannerViews();
});

planWindowContainer.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  const windowFilter = target.dataset.window;
  if (!windowFilter) {
    return;
  }
  setPlanWindowFilter(windowFilter);
  renderPlannerViews();
});

taskListEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) {
    return;
  }

  if (!canMutate) {
    showError('This install is currently read-only due to entitlement status.');
    return;
  }
  const result = resolveTaskAction(tasks, id, action);
  if (!result.ok) {
    showError(result.error);
    return;
  }

  appData = applyTaskMutation(appData, result);
  tasks = appData.tasks.slice();
  showError('');
  renderAll();
});

entitlementPanelEl.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) {
    return;
  }
  if (target.id !== 'entitlement-refresh-mode') {
    return;
  }

  entitlementRefreshMode = target.value || 'active';
  updateEntitlementPanel();
});

entitlementPanelEl.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  if (target.id !== 'entitlement-refresh-btn' || isRefreshingEntitlement) {
    return;
  }

  isRefreshingEntitlement = true;
  updateEntitlementPanel();

  try {
    await refreshEntitlementSnapshot({
      scenario: entitlementRefreshMode
    });
    showError('');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Entitlement refresh failed.';
    showError(message);
  } finally {
    isRefreshingEntitlement = false;
    renderAll();
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => renderAll());
  window.addEventListener('offline', () => renderAll());
}

function run() {
  hydrateProjects();
  setPlanWindowFilter('all');
  renderAll();
}

run();
