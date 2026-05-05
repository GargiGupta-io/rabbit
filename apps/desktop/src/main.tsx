import {
  addShellViewTab,
  activateShellTab,
  activateShellView,
  applySyncBatchResult,
  applyTaskMutation,
  buildTaskDraftFromFormState,
  getClientCacheSummary,
  createTaskFormState,
  decorateTaskWithProject,
  formatDisplayDateTime,
  getInboxStateSummary,
  getShellState,
  getTaskFormOptions,
  getShellThemeClassName,
  getSyncStateSummary,
  getTaskFilters,
  getTaskStateSummary,
  getViewStateSummary,
  moveShellTab,
  navigateShellTabs,
  removeShellTab,
  resolveTaskAction,
  upsertTask
} from './state.js';
import {
  createBackendEntitlementTransport,
  executeBackendDefinition,
  executeBackendPowerSyncUpload,
  hasBackendConfiguration,
  hydrateAppDataFromBackend,
  normalizeBackendState
} from './backendClient.js';
import { fetchBootstrap, getCurrentUser, getFeaturePermissions } from './bootstrapClient.js';
import { getCalendars, getCalendarEvents } from './calendarClient.js';
import { normalizeCalendarEvent } from './calendarService.js';
import { createDesktopShellBridge, createQuickMeetingPayload } from './desktopShellBridge.js';
import { getInboxItems } from './inboxClient.js';
import { getProjectTaskFormDefaults } from './projectService.js';
import { buildPlanWindow } from './scheduler.js';
import { loadStoredData, saveStoredData } from './storage.js';
import {
  canMutateTasks,
  getEntitlementSnapshot,
  getEntitlementStateSummary,
  refreshEntitlementSnapshot,
  requireEntitlement
} from './entitlement.js';
import { ENTITLEMENT_REFRESH_SCENARIOS } from './entitlementClient.js';
import {
  DEFAULT_CURRENT_USER_EMAIL,
  DEFAULT_CURRENT_USER_NAME
} from './identityDefaults.js';
import { getTaskScheduleSummary } from './taskService.js';
import { queryTasks } from './tasksClient.js';
import { getViews } from './viewsClient.js';
import { createDesktopPlatformProfile, getShellCommandForKeyboardEvent } from './desktopPlatform.js';

let entitlement = getEntitlementSnapshot();
let canMutate = canMutateTasks();
let appData = loadStoredData();
let tasks = appData.tasks.slice();
let activeFilter = 'all';
let activePlanWindow = 'all';
let search = '';
let entitlementRefreshMode = 'active';
let isRefreshingEntitlement = false;
let isBackendBusy = false;
let backendBusyAction = '';
let backendBaseUrlInput = appData.backend?.baseUrl || '';
let backendAuthTokenInput = appData.backend?.authToken || '';
let taskForm = createProjectAwareTaskFormState();
const DESKTOP_SHELL_APP_VERSION = 'phase-8-step-41';
const INITIAL_DESKTOP_PLATFORM = createDesktopPlatformProfile({
  preferredDistribution: 'apple',
  targetPlatform: 'macos'
});
const desktopShellBridge = createDesktopShellBridge({
  appVersion: DESKTOP_SHELL_APP_VERSION,
  distribution: INITIAL_DESKTOP_PLATFORM.distribution,
  maxTabs: 6
});

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing app root');
}

const SHOW_INTERNAL_SURFACES = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('debug') === '1';

const shell = document.createElement('main');
shell.className = 'desktop-shell';
root.appendChild(shell);

shell.innerHTML = `
  <aside class="shell-sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark">R</div>
      <div class="brand-copy">
        <strong>Rabbit</strong>
        <p>Plan the day without the noise.</p>
      </div>
    </div>

    <div id="sidebar-nav" class="sidebar-nav"></div>
  </aside>

  <section class="shell-workspace">
    <header class="workspace-header">
      <div class="header-leading">
        <div class="window-chrome" id="window-chrome" aria-hidden="true">
          <span class="traffic-light close"></span>
          <span class="traffic-light minimize"></span>
          <span class="traffic-light zoom"></span>
        </div>
        <div class="workspace-heading">
          <span class="workspace-kicker" id="workspace-kicker">Private workspace</span>
          <h1>Rabbit</h1>
        </div>
      </div>
      <div class="workspace-meta">
        <div class="workspace-status-row">
          <span class="workspace-pill local-only" id="workspace-status-pill">Ready</span>
          <p class="workspace-status" id="entitlement-status"></p>
        </div>
        <div class="shell-actions" id="shell-actions">
          <button type="button" class="shell-action" data-shell-command="search">
            <span>Search</span>
            <span class="key-hint" data-key-hint="search">Ctrl/Cmd K</span>
          </button>
          <button type="button" class="shell-action" data-shell-command="new-task">
            <span>New task</span>
            <span class="key-hint" data-key-hint="new-task">Ctrl/Cmd Shift N</span>
          </button>
          <button type="button" class="shell-action" data-shell-command="quick-meeting">
            <span>Quick meeting</span>
            <span class="key-hint" data-key-hint="quick-meeting">Ctrl/Cmd Shift M</span>
          </button>
          <button type="button" class="shell-action" data-shell-command="menu">
            <span data-menu-label>Menu</span>
            <span class="key-hint" data-key-hint="menu">Alt / Ctrl M</span>
          </button>
        </div>
      </div>
    </header>

    <div id="tab-strip" class="tab-strip"></div>

    <div class="workspace-body">
      <section class="content-surface">
        <header class="panel view-header" id="view-header"></header>

        <section class="panel metrics" id="metrics"></section>

        <section class="panel toolbar-panel">
          <div class="toolbar-search">
            <label class="field-label" for="search">Quick filter</label>
            <input id="search" type="text" placeholder="Search tasks, projects, notes" />
          </div>

          <div class="toolbar-stacks">
            <div class="toolbar-stack">
              <span class="stack-label">Status</span>
              <div class="btn-group" id="filter-group">
                <button type="button" class="filter active" data-status="all">All</button>
                <button type="button" class="filter" data-status="todo">Todo</button>
                <button type="button" class="filter" data-status="done">Done</button>
                <button type="button" class="filter" data-status="overdue">Overdue</button>
              </div>
            </div>

            <div class="toolbar-stack">
              <span class="stack-label">Planning window</span>
              <div class="btn-group" id="plan-window-group">
                <button type="button" class="plan-window active" data-window="all">All</button>
                <button type="button" class="plan-window" data-window="today">Today</button>
                <button type="button" class="plan-window" data-window="week">Week</button>
              </div>
            </div>
          </div>
        </section>

        <section class="panel composer-panel" id="task-form-panel"></section>

        <section class="panel editor-panel" id="editor" aria-live="polite"></section>

        <section class="panel task-surface">
          <div class="surface-header">
            <div>
              <strong>Tasks</strong>
              <p id="surface-caption" class="surface-caption">Your active queue.</p>
            </div>
            <span id="surface-count" class="surface-count"></span>
          </div>
          <section id="task-list" class="task-list"></section>
        </section>
      </section>

      <aside class="shell-rail">
        <section class="panel agenda-panel" id="agenda-panel"></section>
        <section class="panel inbox-panel" id="inbox-panel"></section>
        <section class="panel sync-panel" id="sync-panel" aria-live="polite"></section>
        <section class="panel entitlement-panel" id="entitlement-panel" aria-live="polite" hidden></section>
      </aside>
    </div>
  </section>
`;

const style = document.createElement('style');
style.textContent = `
  :root {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    font-family: "Segoe UI Variable Text", "Segoe UI", sans-serif;
    background: #151819;
    color: #f3f4f6;
  }

  .desktop-shell {
    --workspace-bg: #1a1d1e;
    --panel-bg: #23282d;
    --panel-border: rgba(255, 255, 255, 0.08);
    --panel-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
    --text-strong: #f8fafc;
    --text-muted: rgba(226, 232, 240, 0.8);
    --text-soft: rgba(148, 163, 184, 0.88);
    --accent: #60a5fa;
    --accent-strong: #93c5fd;
    --sidebar-bg: #151819;
    --sidebar-border: rgba(255, 255, 255, 0.06);
    --sidebar-text: #f8fafc;
    --sidebar-muted: rgba(203, 213, 225, 0.64);
    --sidebar-active: rgba(255, 255, 255, 0.08);
    min-height: 100vh;
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    background: radial-gradient(circle at top left, rgba(96, 165, 250, 0.08), transparent 28%),
      linear-gradient(180deg, #1b1f20 0%, #16191a 100%);
  }

  .desktop-shell.theme-light,
  .desktop-shell[data-theme="light"] {
    --workspace-bg: #f7f9fc;
    --panel-bg: #ffffff;
    --panel-border: #dbe3ef;
    --panel-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
    --sidebar-bg: #ffffff;
    --sidebar-border: #dbe3ef;
    --sidebar-text: #172033;
    --sidebar-muted: #5b677a;
    --sidebar-active: #edf2fb;
  }

  .shell-sidebar {
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    padding: 22px 16px 18px;
    display: grid;
    gap: 18px;
    grid-template-rows: auto 1fr auto;
    border-right: 1px solid var(--sidebar-border);
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
    box-shadow: 0 12px 28px rgba(14, 165, 233, 0.28);
  }

  .brand-copy strong {
    display: block;
    font-size: 15px;
    letter-spacing: 0.02em;
  }

  .brand-copy p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--sidebar-muted);
  }

  .sidebar-nav {
    display: grid;
    gap: 18px;
    align-content: start;
    overflow: auto;
  }

  .sidebar-section {
    display: grid;
    gap: 8px;
  }

  .sidebar-section h2 {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sidebar-muted);
    padding: 0 10px;
  }

  .sidebar-items {
    display: grid;
    gap: 4px;
  }

  .nav-item,
  .nav-item-passive {
    width: 100%;
    border: 0;
    border-radius: 14px;
    background: transparent;
    color: inherit;
    padding: 10px 12px;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font: inherit;
  }

  .nav-item {
    cursor: pointer;
  }

  .nav-item:hover,
  .nav-item:focus-visible {
    background: var(--sidebar-active);
    outline: none;
  }

  .nav-item.active {
    background: var(--sidebar-active);
  }

  .nav-item-passive {
    color: var(--sidebar-muted);
  }

  .nav-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .nav-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: currentColor;
    flex: 0 0 auto;
  }

  .nav-kind {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--sidebar-muted);
  }

  .sidebar-footer {
    border: 1px solid var(--sidebar-border);
    border-radius: 16px;
    padding: 12px 14px;
    display: grid;
    gap: 6px;
    background: rgba(255, 255, 255, 0.04);
  }

  .sidebar-foot-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sidebar-muted);
  }

  .shell-workspace {
    background: var(--workspace-bg);
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    min-width: 0;
  }

  .workspace-header {
    padding: 24px 24px 12px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .header-leading {
    display: grid;
    gap: 12px;
    align-content: start;
  }

  .window-chrome {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 12px;
  }

  .traffic-light {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    display: inline-block;
  }

  .traffic-light.close {
    background: #ff5f57;
  }

  .traffic-light.minimize {
    background: #febc2e;
  }

  .traffic-light.zoom {
    background: #28c840;
  }

  .workspace-heading h1 {
    margin: 4px 0 0;
    font-size: 28px;
    letter-spacing: -0.03em;
    color: var(--text-strong);
  }

  .workspace-kicker {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-soft);
  }

  .workspace-status {
    margin: 0;
    max-width: 300px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted);
    text-align: right;
  }

  .workspace-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .workspace-meta {
    display: grid;
    gap: 12px;
    justify-items: end;
  }

  .desktop-shell[data-platform="windows"] .window-chrome,
  .desktop-shell.platform-windows .window-chrome {
    opacity: 0.5;
  }

  .desktop-shell[data-platform="macos"] .workspace-header,
  .desktop-shell.platform-macos .workspace-header {
    padding-top: 18px;
  }

  .shell-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .shell-action,
  .tab-add,
  .tab-close {
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-strong);
    font: inherit;
  }

  .shell-action {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
  }

  .shell-action:hover,
  .shell-action:focus-visible,
  .tab-add:hover,
  .tab-add:focus-visible,
  .tab-close:hover,
  .tab-close:focus-visible {
    border-color: rgba(255, 255, 255, 0.16);
    outline: none;
  }

  .key-hint {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .tab-strip {
    display: flex;
    gap: 10px;
    padding: 0 24px 18px;
    overflow: auto;
  }

  .tab-shell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .tab-button {
    border: 1px solid transparent;
    border-radius: 16px;
    background: rgba(148, 163, 184, 0.12);
    color: var(--text-muted);
    padding: 10px 14px;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    white-space: nowrap;
    font: inherit;
  }

  .tab-button:hover,
  .tab-button:focus-visible {
    border-color: #c5d0df;
    outline: none;
  }

  .tab-button.active {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.14);
    color: var(--text-strong);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2);
  }

  .tab-label {
    font-weight: 600;
  }

  .tab-kind {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .tab-close,
  .tab-add {
    padding: 9px 12px;
    cursor: pointer;
    flex: 0 0 auto;
  }

  .tab-close {
    border-radius: 12px;
  }

  .workspace-body {
    padding: 0 24px 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 18px;
    min-width: 0;
  }

  .content-surface,
  .shell-rail {
    display: grid;
    gap: 16px;
    align-content: start;
    min-width: 0;
  }

  .panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 22px;
    box-shadow: var(--panel-shadow);
    padding: 18px;
  }

  .panel[hidden] {
    display: none !important;
  }

  .view-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .view-copy h2 {
    margin: 6px 0 8px;
    font-size: 26px;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--text-strong);
  }

  .view-copy p {
    margin: 0;
    max-width: 620px;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .view-breadcrumb {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .view-chip-row {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .view-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(96, 165, 250, 0.12);
    color: var(--text-muted);
    font-size: 12px;
  }

  .view-stat-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, minmax(88px, 1fr));
    min-width: 260px;
  }

  .view-focus-card {
    min-width: 180px;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid var(--panel-border);
    background: rgba(255, 255, 255, 0.03);
    display: grid;
    gap: 6px;
    align-content: start;
  }

  .view-focus-card strong {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .view-focus-card span {
    color: var(--text-strong);
    font-size: 15px;
    line-height: 1.4;
  }

  .view-stat {
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
  }

  .view-stat strong,
  .sync-stat strong {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .view-stat span,
  .sync-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-strong);
  }

  .metric-grid,
  .sync-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }

  .metric-card,
  .sync-stat {
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
  }

  .metric-card strong {
    display: block;
    margin-bottom: 8px;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .metric-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-strong);
  }

  .metric-note,
  .sync-note {
    margin: 12px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .toolbar-panel {
    display: grid;
    gap: 16px;
    grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
    align-items: start;
  }

  .toolbar-stacks {
    display: grid;
    gap: 14px;
  }

  .toolbar-stack {
    display: grid;
    gap: 8px;
  }

  .field-label,
  .stack-label,
  .form-row label {
    display: grid;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .toolbar-search input,
  .form-row input,
  .form-row select,
  .control-row input,
  .control-row select {
    width: 100%;
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 11px 12px;
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-strong);
    font: inherit;
  }

  .btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn-group button,
  .form-row button,
  .task-actions button,
  .control-row button {
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-strong);
    cursor: pointer;
    font: inherit;
  }

  .btn-group button.active,
  .form-row button {
    background: #f8fafc;
    border-color: #f8fafc;
    color: #111827;
  }

  .btn-group button:hover,
  .task-actions button:hover,
  .control-row button:hover {
    border-color: rgba(255, 255, 255, 0.16);
  }

  .toolbar-search input::placeholder,
  .form-row input::placeholder,
  .control-row input::placeholder {
    color: rgba(148, 163, 184, 0.72);
  }

  .toolbar-search input:focus,
  .form-row input:focus,
  .form-row select:focus,
  .control-row input:focus,
  .control-row select:focus,
  .btn-group button:focus-visible,
  .task-actions button:focus-visible,
  .control-row button:focus-visible,
  .tab-button:focus-visible,
  .nav-item:focus-visible {
    outline: 2px solid rgba(96, 165, 250, 0.55);
    outline-offset: 2px;
  }

  .desktop-shell[data-theme="light"] .btn-group button.active,
  .desktop-shell.theme-light .btn-group button.active,
  .desktop-shell[data-theme="light"] .form-row button,
  .desktop-shell.theme-light .form-row button {
    background: #111827;
    border-color: #111827;
    color: #ffffff;
  }

  .composer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .composer-header p {
    margin: 4px 0 0;
    color: var(--text-muted);
    font-size: 13px;
  }

  .composer-mode {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(96, 165, 250, 0.12);
    color: var(--text-muted);
    font-size: 12px;
  }

  .task-form-advanced {
    margin-top: 16px;
    border-top: 1px solid var(--panel-border);
    padding-top: 14px;
  }

  .task-form-advanced summary {
    cursor: pointer;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    list-style: none;
  }

  .task-form-advanced summary::-webkit-details-marker {
    display: none;
  }

  .task-form-advanced[open] summary {
    color: var(--text-strong);
  }

  .task-form-advanced-grid {
    margin-top: 14px;
  }

  .form-row {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    align-items: end;
  }

  .task-form-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .task-form-field {
    display: grid;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .task-form-field.span-2 {
    grid-column: span 2;
  }

  .task-form-field textarea,
  .task-form-field input,
  .task-form-field select {
    width: 100%;
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 11px 12px;
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-strong);
    font: inherit;
  }

  .task-form-field textarea {
    min-height: 84px;
    resize: vertical;
  }

  .task-form-foot {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .task-form-summary {
    color: var(--text-soft);
    font-size: 12px;
    line-height: 1.5;
  }

  .task-form-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .task-form-actions button {
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-strong);
    cursor: pointer;
    font: inherit;
  }

  .task-form-actions .primary {
    background: #f8fafc;
    border-color: #f8fafc;
    color: #111827;
  }

  .editor-panel:empty {
    display: none;
  }

  .surface-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .surface-header p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--text-muted);
  }

  .surface-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #eef4fb;
    color: var(--text-muted);
    font-size: 12px;
  }

  .task-list {
    display: grid;
    gap: 12px;
  }

  .task-item {
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.02);
    padding: 16px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .task-main {
    min-width: 0;
  }

  .task-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }

  .project-chip,
  .status-chip,
  .agenda-type {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .status-chip.tone-on {
    background: rgba(96, 165, 250, 0.14);
    color: #bfdbfe;
  }

  .status-chip.tone-off {
    background: rgba(148, 163, 184, 0.12);
    color: var(--text-muted);
  }

  .status-chip.tone-error {
    background: rgba(239, 68, 68, 0.14);
    color: #fecaca;
  }

  .task-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-strong);
    line-height: 1.3;
  }

  .task-title.done {
    color: var(--text-soft);
    text-decoration: line-through;
  }

  .task-note {
    margin-top: 8px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .task-foot {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--text-soft);
    font-size: 12px;
  }

  .task-side {
    width: 168px;
    display: grid;
    gap: 10px;
    align-content: start;
    justify-items: end;
  }

  .task-time {
    font-size: 12px;
    color: var(--text-muted);
    text-align: right;
  }

  .task-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .muted {
    color: var(--text-soft);
    font-size: 13px;
  }

  .task-alert,
  .error,
  .editor-message {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  .task-alert.warning {
    color: #fbbf24;
  }

  .task-alert.error,
  .error {
    color: #b42318;
  }

  .editor-message.info {
    color: var(--text-muted);
  }

  .editor-message.success {
    color: #0f9f6e;
  }

  .editor-message.warning {
    color: #f59e0b;
  }

  .agenda-panel,
  .inbox-panel,
  .sync-panel,
  .entitlement-panel {
    display: grid;
    gap: 14px;
  }

  .rail-note {
    margin: 0;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .inbox-summary-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
  }

  .inbox-summary-card {
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
  }

  .inbox-summary-card strong {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .inbox-summary-card span {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-strong);
  }

  .inbox-list {
    display: grid;
    gap: 10px;
  }

  .inbox-item {
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    display: grid;
    gap: 10px;
  }

  .inbox-item.unread {
    border-color: rgba(96, 165, 250, 0.4);
    background: rgba(96, 165, 250, 0.08);
  }

  .inbox-item-head,
  .inbox-item-foot {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .inbox-item-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-strong);
    line-height: 1.35;
  }

  .inbox-item-subtitle,
  .inbox-item-note,
  .inbox-item-time {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .inbox-item-note {
    margin: 0;
  }

  .inbox-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .inbox-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .rail-header,
  .sync-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .rail-header strong,
  .sync-header strong {
    font-size: 14px;
    color: var(--text-strong);
  }

  .rail-count,
  .sync-pill,
  .workspace-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .rail-count,
  .sync-pill.local-only,
  .workspace-pill.local-only {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-muted);
  }

  .sync-pill.pending,
  .sync-pill.offline,
  .workspace-pill.pending,
  .workspace-pill.offline {
    background: #fff2d8;
    color: #9a6700;
  }

  .sync-pill.healthy,
  .workspace-pill.healthy {
    background: #dcfae6;
    color: #067647;
  }

  .sync-pill.degraded,
  .workspace-pill.degraded {
    background: #fee4e2;
    color: #b42318;
  }

  .agenda-groups {
    display: grid;
    gap: 14px;
  }

  .agenda-group {
    display: grid;
    gap: 10px;
  }

  .agenda-group h3 {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  .agenda-items {
    display: grid;
    gap: 10px;
  }

  .agenda-item {
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    display: grid;
    gap: 8px;
  }

  .agenda-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .agenda-title {
    font-weight: 700;
    color: var(--text-strong);
    line-height: 1.35;
  }

  .agenda-subtitle,
  .agenda-time {
    font-size: 12px;
    color: var(--text-muted);
  }

  .control-row {
    display: grid;
    gap: 12px;
  }

  .control-row button[disabled] {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (max-width: 1180px) {
    .workspace-body {
      grid-template-columns: 1fr;
    }

    .shell-rail {
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
  }

  @media (max-width: 960px) {
    .desktop-shell {
      grid-template-columns: 1fr;
    }

    .shell-sidebar {
      grid-template-rows: auto auto auto;
      border-right: 0;
      border-bottom: 1px solid var(--sidebar-border);
    }

    .workspace-header {
      flex-direction: column;
    }

    .workspace-status {
      max-width: none;
      text-align: left;
    }
  }

  @media (max-width: 720px) {
    .workspace-header,
    .tab-strip,
    .workspace-body {
      padding-left: 16px;
      padding-right: 16px;
    }

    .toolbar-panel,
    .view-header,
    .task-item {
      grid-template-columns: 1fr;
    }

    .task-form-grid {
      grid-template-columns: 1fr;
    }

    .task-form-field.span-2 {
      grid-column: span 1;
    }

    .view-stat-grid,
    .task-side {
      width: auto;
      justify-items: start;
    }

    .task-actions {
      justify-content: flex-start;
    }
  }
`;

document.head.appendChild(style);

const sidebarNavEl = shell.querySelector('#sidebar-nav') as HTMLDivElement;
const tabStripEl = shell.querySelector('#tab-strip') as HTMLDivElement;
const viewHeaderEl = shell.querySelector('#view-header') as HTMLDivElement;
const metricsEl = shell.querySelector('#metrics') as HTMLDivElement;
const agendaPanelEl = shell.querySelector('#agenda-panel') as HTMLDivElement;
const inboxPanelEl = shell.querySelector('#inbox-panel') as HTMLDivElement;
const syncPanelEl = shell.querySelector('#sync-panel') as HTMLDivElement;
const entitlementPanelEl = shell.querySelector('#entitlement-panel') as HTMLDivElement;
const shellActionsEl = shell.querySelector('#shell-actions') as HTMLDivElement;
const windowChromeEl = shell.querySelector('#window-chrome') as HTMLDivElement;
const workspaceKickerEl = shell.querySelector('#workspace-kicker') as HTMLSpanElement;
const searchEl = shell.querySelector('#search') as HTMLInputElement;
const filterContainer = shell.querySelector('#filter-group') as HTMLDivElement;
const planWindowContainer = shell.querySelector('#plan-window-group') as HTMLDivElement;
const taskFormPanelEl = shell.querySelector('#task-form-panel') as HTMLDivElement;
const editorEl = shell.querySelector('#editor') as HTMLElement;
const taskListEl = shell.querySelector('#task-list') as HTMLDivElement;
const entitlementStatusEl = shell.querySelector('#entitlement-status') as HTMLParagraphElement;
const workspaceStatusPillEl = shell.querySelector('#workspace-status-pill') as HTMLSpanElement;
const surfaceCountEl = shell.querySelector('#surface-count') as HTMLSpanElement;
const surfaceCaptionEl = shell.querySelector('#surface-caption') as HTMLParagraphElement;
const warningEl = document.createElement('p');

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeText(value: unknown, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function getDesktopPlatformProfileState() {
  return createDesktopPlatformProfile({
    runtimePlatform: appData?.metadata?.platform,
    preferredDistribution: 'apple',
    targetPlatform: 'macos'
  });
}

function formatCompactDate(value: unknown) {
  if (!value) {
    return 'No date';
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.valueOf())) {
    return 'No date';
  }

  return parsed.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

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

function getBackendState() {
  return normalizeBackendState(appData.backend);
}

function getDraftBackendState() {
  return normalizeBackendState({
    ...appData.backend,
    baseUrl: backendBaseUrlInput,
    authToken: backendAuthTokenInput
  });
}

function getBackendPresentation(backend) {
  if (!hasBackendConfiguration(backend)) {
    return {
      badgeClass: 'local-only',
      title: 'Unconfigured',
      detail: 'Rabbit is still local-first. Add a backend URL to enable live bootstrap, refresh, sync push, and authority refresh.'
    };
  }

  if (backend.status === 'error') {
    return {
      badgeClass: 'degraded',
      title: 'Error',
      detail: backend.lastError || 'The configured backend returned an error, so Rabbit stayed on local state safely.'
    };
  }

  if (backend.status === 'connecting') {
    return {
      badgeClass: 'pending',
      title: 'Working',
      detail: 'Rabbit is actively talking to the configured backend.'
    };
  }

  if (backend.status === 'online') {
    return {
      badgeClass: 'healthy',
      title: 'Online',
      detail: 'Rabbit has completed at least one successful backend operation in this session.'
    };
  }

  return {
    badgeClass: 'pending',
    title: 'Configured',
    detail: 'Rabbit has a saved backend target, but no successful live operation has completed in this session yet.'
  };
}

function setBackendState(overrides: Record<string, unknown> = {}) {
  const current = getBackendState();
  const hasConfig = hasBackendConfiguration({
    baseUrl: backendBaseUrlInput,
    authToken: backendAuthTokenInput
  });
  const nextStatus = typeof overrides.status === 'string'
    ? overrides.status
    : hasConfig
      ? current.status === 'unconfigured'
        ? 'idle'
        : current.status
      : 'unconfigured';
  const next = normalizeBackendState({
    ...current,
    ...overrides,
    status: nextStatus,
    baseUrl: backendBaseUrlInput,
    authToken: backendAuthTokenInput,
    lastError: hasConfig
      ? (Object.prototype.hasOwnProperty.call(overrides, 'lastError') ? overrides.lastError : current.lastError)
      : null
  });

  appData = {
    ...appData,
    backend: next
  };

  return next;
}

function buildBackendBootstrapArgs() {
  const cache = getClientCacheSummary(appData);
  return {
    workspaceId: cache.activeWorkspaceId || undefined,
    viewId: cache.activeViewId || undefined
  };
}

function summarizeRemoteRefresh(appState) {
  const sync = getSyncStateSummary(appState);
  const calendarCount = Array.isArray(appState.calendarOverlay?.calendars)
    ? appState.calendarOverlay.calendars.length
    : 0;
  const eventCount = Array.isArray(appState.calendarOverlay?.importedEvents)
    ? appState.calendarOverlay.importedEvents.length
    : 0;
  const inboxCount = Array.isArray(appState.inbox?.items)
    ? appState.inbox.items.length
    : 0;

  return `Refreshed ${appState.tasks.length} tasks, ${calendarCount} calendars, ${eventCount} events, and ${inboxCount} inbox items. ${sync.pendingCount} local change(s) remain queued.`;
}

async function runBackendAction(action, callback) {
  const configuredBackend = setBackendState({
    status: 'connecting',
    lastError: null,
    lastAction: action
  });

  if (!hasBackendConfiguration(configuredBackend)) {
    setBackendState({
      status: 'unconfigured',
      lastAction: action
    });
    renderAll();
    showError('Set a backend URL first. Rabbit will stay local-only until a backend is configured.');
    return null;
  }

  isBackendBusy = true;
  backendBusyAction = action;
  renderAll();

  try {
    const result = await callback(configuredBackend);
    const completedAt = new Date().toISOString();
    setBackendState({
      status: 'online',
      lastError: null,
      lastConnectedAt: completedAt,
      lastRequestAt: completedAt,
      lastAction: action,
      ...(result?.backendPatch || {})
    });
    showEditorMessage(result?.message || `Backend ${action} completed successfully.`, 'success');
    return result || {};
  } catch (error) {
    const completedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : `Backend ${action} failed.`;
    if (action === 'push') {
      appData = {
        ...appData,
        syncStatus: 'failed'
      };
    }
    setBackendState({
      status: 'error',
      lastError: message,
      lastRequestAt: completedAt,
      lastAction: action
    });
    showError(message);
    return null;
  } finally {
    isBackendBusy = false;
    backendBusyAction = '';
    renderAll();
  }
}

async function handleBackendConnect() {
  await runBackendAction('connect', async (backend) => {
    await executeBackendDefinition(fetchBootstrap, buildBackendBootstrapArgs(), {
      backend
    });
    const connectedAt = new Date().toISOString();
    return {
      backendPatch: {
        lastBootstrapAt: connectedAt
      },
      message: `Connected to ${backend.baseUrl}. Rabbit can now use the live backend path.`
    };
  });
}

async function handleBackendRefresh() {
  await runBackendAction('refresh', async (backend) => {
    const bootstrapArgs = buildBackendBootstrapArgs();
    const results = await Promise.allSettled([
      executeBackendDefinition(fetchBootstrap, bootstrapArgs, { backend }),
      executeBackendDefinition(getCurrentUser, {}, { backend }),
      executeBackendDefinition(getFeaturePermissions, {}, { backend }),
      executeBackendDefinition(getViews, {}, { backend }),
      executeBackendDefinition(getInboxItems, {}, { backend }),
      executeBackendDefinition(queryTasks, {}, { backend }),
      executeBackendDefinition(getCalendars, {}, { backend })
    ]);
    const values = results.map((result) => result.status === 'fulfilled' ? result.value.data : undefined);
    const calendarsSnapshot = hydrateAppDataFromBackend(appData, {
      calendars: values[6]
    }, {
      now: Date.now()
    });
    const providerIds = (calendarsSnapshot.calendarOverlay?.calendars || [])
      .map((calendar) => calendar.providerId || calendar.id)
      .filter(Boolean);
    let calendarEventsData;
    let calendarEventsError = null;

    if (providerIds.length) {
      try {
        const calendarEventsResult = await executeBackendDefinition(getCalendarEvents, {
          providerIds
        }, {
          backend
        });
        calendarEventsData = calendarEventsResult.data;
      } catch (error) {
        calendarEventsError = error instanceof Error ? error.message : 'Calendar event refresh failed.';
      }
    }

    const successfulSlices = values.filter((value) => value !== undefined).length + (calendarEventsData !== undefined ? 1 : 0);
    if (!successfulSlices) {
      const firstRejected = results.find((result) => result.status === 'rejected');
      throw firstRejected?.reason instanceof Error
        ? firstRejected.reason
        : new Error('The backend did not return any usable data.');
    }

    appData = hydrateAppDataFromBackend(appData, {
      bootstrap: values[0],
      currentUser: values[1],
      featurePermissions: values[2],
      views: values[3],
      inbox: values[4],
      tasks: values[5],
      calendars: values[6],
      calendarEvents: calendarEventsData
    }, {
      now: Date.now()
    });
    tasks = appData.tasks.slice();

    const degradedCalls = results.filter((result) => result.status === 'rejected').length + (calendarEventsError ? 1 : 0);
    const refreshedAt = new Date().toISOString();
    const suffix = calendarEventsError
      ? ` Calendar events stayed on the local snapshot because the live refresh failed: ${calendarEventsError}`
      : '';

    return {
      backendPatch: {
        lastBootstrapAt: values[0] !== undefined ? refreshedAt : getBackendState().lastBootstrapAt,
        lastDataRefreshAt: refreshedAt
      },
      message: degradedCalls
        ? `${summarizeRemoteRefresh(appData)} ${degradedCalls} backend call(s) degraded during the refresh.${suffix}`
        : `${summarizeRemoteRefresh(appData)}`
    };
  });
}

async function handleBackendPush() {
  if (!getSyncStateSummary(appData).pendingCount) {
    showEditorMessage('No queued local changes need to be pushed right now.', 'info');
    return;
  }

  appData = {
    ...appData,
    syncStatus: 'syncing'
  };

  await runBackendAction('push', async (backend) => {
    const upload = await executeBackendPowerSyncUpload(appData.outbox, backend);
    appData = applySyncBatchResult(appData, upload.syncResponse, {
      request: upload.uploadRequest
    });
    tasks = appData.tasks.slice();

    const pushedAt = new Date().toISOString();
    const summary = upload.syncResponse.failureCount > 0
      ? `Pushed ${upload.syncResponse.successCount} change(s); ${upload.syncResponse.failureCount} stayed queued because the backend rejected them.`
      : `Pushed ${upload.syncResponse.successCount} queued change(s) to the backend.`;

    return {
      backendPatch: {
        lastPushAt: pushedAt
      },
      message: summary
    };
  });
}

function getSyncPresentation(sync) {
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const backend = getBackendState();
  const backendConfigured = hasBackendConfiguration(backend);

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
      detail: backendConfigured
        ? 'Changes are stored locally and waiting for the next backend push.'
        : 'Changes are stored locally and waiting for the future remote sync path.'
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
    title: backendConfigured ? 'Configured' : 'Local only',
    detail: backendConfigured
      ? 'A backend is configured, but Rabbit has not completed a live sync operation in this session yet.'
      : 'This install is ready for sync later, but no remote sync has run in this session yet.'
  };
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

function sanitizeTaskFormText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim();
  return normalized || fallback;
}

function normalizeTaskFormDateTimeValue(value) {
  const candidate = sanitizeTaskFormText(value);
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

function createProjectAwareTaskFormState(input: any = {}) {
  const base = createTaskFormState(appData, input);
  const rawStageDefinitionId = sanitizeTaskFormText(input?.stageDefinitionId);
  const projectDefaults = getProjectTaskFormDefaults({
    projects: appData.projects,
    projectDefinitions: appData.projectDefinitions,
    projectId: base.projectId,
    stageDefinitionId: rawStageDefinitionId,
    now: appData.calendarOverlay?.refreshedAt || new Date().toISOString()
  } as any);
  const hasCustomStageId = Boolean(
    input?.hasCustomStageId &&
    rawStageDefinitionId &&
    projectDefaults.stageOptions.some((stage) => stage.id === rawStageDefinitionId)
  );
  const stageDefinitionId = hasCustomStageId
    ? rawStageDefinitionId
    : projectDefaults.selectedStageId || '';
  const activeProjectDefaults = getProjectTaskFormDefaults({
    projects: appData.projects,
    projectDefinitions: appData.projectDefinitions,
    projectId: base.projectId,
    stageDefinitionId,
    now: appData.calendarOverlay?.refreshedAt || new Date().toISOString()
  } as any);
  const defaultStartAtInput = normalizeTaskFormDateTimeValue(activeProjectDefaults.defaultStartAt);
  const defaultDueAtInput = normalizeTaskFormDateTimeValue(activeProjectDefaults.defaultDueAt);
  const customStartAtInput = normalizeTaskFormDateTimeValue(input?.startAtInput || input?.startAt || input?.scheduledStart);
  const customDueAtInput = normalizeTaskFormDateTimeValue(input?.dueAtInput || input?.dueAt);
  const hasCustomStartAt = Boolean(input?.hasCustomStartAt && customStartAtInput);
  const hasCustomDueAt = Boolean(input?.hasCustomDueAt && customDueAtInput);
  const resolvedDueAtInput = hasCustomDueAt
    ? customDueAtInput
    : defaultDueAtInput || base.dueAtInput;
  const startAtCandidate = hasCustomStartAt
    ? customStartAtInput
    : defaultStartAtInput || base.startAtInput;
  const resolvedStartAtInput = base.scheduleMode === 'fixed'
    ? (startAtCandidate || resolvedDueAtInput)
    : startAtCandidate;
  const recurrenceInterval = Math.max(1, Number(input?.recurrenceInterval) || 1);

  return {
    ...base,
    projectDefinitionId: activeProjectDefaults.projectDefinitionId,
    stageDefinitionId,
    stageName: activeProjectDefaults.selectedStage?.label || '',
    stageOptions: activeProjectDefaults.stageOptions,
    recurrenceInterval,
    startAtInput: resolvedStartAtInput,
    dueAtInput: resolvedDueAtInput,
    defaultStartAtInput,
    defaultDueAtInput,
    hasCustomStageId,
    hasCustomStartAt,
    hasCustomDueAt
  };
}

function renderTaskForm() {
  taskForm = createProjectAwareTaskFormState(taskForm);
  const options = getTaskFormOptions(appData, taskForm);
  const scheduleHint = taskForm.scheduleMode === 'auto'
    ? 'Auto-scheduled'
    : taskForm.scheduleMode === 'manual'
      ? 'Manual placement'
      : 'Fixed time';
  const shouldExpandAdvanced = taskForm.scheduleMode !== 'auto'
    || taskForm.recurrencePattern !== 'none'
    || taskForm.recurrenceInterval !== 1
    || taskForm.minimumDuration !== taskForm.durationMinutes
    || taskForm.statusId !== 'TODO';
  const stageOptions = taskForm.stageOptions.length
    ? taskForm.stageOptions.map((option) => `
      <option value="${escapeHtml(option.id)}" ${option.id === taskForm.stageDefinitionId ? 'selected' : ''}>
        ${escapeHtml(option.label)}${option.dueDate ? ` • due ${escapeHtml(option.dueDate)}` : ''}
      </option>
    `).join('')
    : '<option value="">No project stage</option>';
  const projectOptions = options.projectOptions.map((option) => `
    <option value="${escapeHtml(option.id)}" ${option.id === taskForm.projectId ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
  const assigneeOptions = options.assigneeOptions.map((option) => `
    <option value="${escapeHtml(option.id)}" ${option.id === taskForm.assigneeUserId ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
  const statusOptions = options.statusOptions.map((option) => `
    <option value="${escapeHtml(option.id)}" ${option.id === taskForm.statusId ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
  const priorityOptions = options.priorityOptions.map((option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === taskForm.priorityLevel ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
  const deadlineOptions = options.deadlineOptions.map((option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === taskForm.deadlineType ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
  const scheduleModeOptions = options.scheduleModeOptions.map((option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === taskForm.scheduleMode ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
  const scheduleOptions = [
    '<option value="">No schedule</option>',
    ...options.scheduleOptions.map((option) => `
      <option value="${escapeHtml(option.id)}" ${option.id === taskForm.scheduleId ? 'selected' : ''}>
        ${escapeHtml(option.label)}
      </option>
    `)
  ].join('');
  const recurrenceOptions = options.recurrenceOptions.map((option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === taskForm.recurrencePattern ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');

  taskFormPanelEl.innerHTML = `
    <div class="composer-header">
      <div>
        <strong>New task</strong>
        <p>Capture the work first. Scheduling details stay tucked away until you need them.</p>
      </div>
      <span class="composer-mode">${escapeHtml(scheduleHint)}</span>
    </div>
    <div class="task-form-grid">
      <label class="task-form-field span-2">
        Task name
        <input name="title" type="text" placeholder="What needs to happen?" value="${escapeHtml(taskForm.title)}" />
      </label>
      <label class="task-form-field span-2">
        Description
        <textarea name="description" placeholder="Add context, notes, or meeting details">${escapeHtml(taskForm.description)}</textarea>
      </label>
      <label class="task-form-field">
        Project
        <select name="projectId">${projectOptions}</select>
      </label>
      <label class="task-form-field">
        Stage
        <select name="stageDefinitionId" ${taskForm.stageOptions.length ? '' : 'disabled'}>${stageOptions}</select>
      </label>
      <label class="task-form-field">
        Priority
        <select name="priorityLevel">${priorityOptions}</select>
      </label>
      <label class="task-form-field">
        Due
        <input name="dueAtInput" type="datetime-local" value="${escapeHtml(taskForm.dueAtInput)}" />
      </label>
      <label class="task-form-field">
        Duration
        <input name="durationMinutes" type="number" min="5" max="720" step="5" value="${escapeHtml(String(taskForm.durationMinutes))}" />
      </label>
    </div>
    <details class="task-form-advanced" ${shouldExpandAdvanced ? 'open' : ''}>
      <summary>More options</summary>
      <div class="task-form-grid task-form-advanced-grid">
        <label class="task-form-field">
          Assignee
          <select name="assigneeUserId">${assigneeOptions}</select>
        </label>
        <label class="task-form-field">
          Status
          <select name="statusId">${statusOptions}</select>
        </label>
        <label class="task-form-field">
          Schedule mode
          <select name="scheduleMode">${scheduleModeOptions}</select>
        </label>
        <label class="task-form-field">
          Schedule
          <select name="scheduleId">${scheduleOptions}</select>
        </label>
        <label class="task-form-field">
          ${taskForm.scheduleMode === 'fixed' ? 'Starts' : 'Earliest start'}
          <input name="startAtInput" type="datetime-local" value="${escapeHtml(taskForm.startAtInput)}" />
        </label>
        <label class="task-form-field">
          Min chunk
          <input name="minimumDuration" type="number" min="5" max="720" step="5" value="${escapeHtml(String(taskForm.minimumDuration))}" />
        </label>
        <label class="task-form-field">
          Deadline
          <select name="deadlineType">${deadlineOptions}</select>
        </label>
        <label class="task-form-field">
          Recurrence
          <select name="recurrencePattern">${recurrenceOptions}</select>
        </label>
        <label class="task-form-field">
          Repeat every
          <input
            name="recurrenceInterval"
            type="number"
            min="1"
            max="30"
            step="1"
            value="${escapeHtml(String(taskForm.recurrenceInterval))}"
            ${taskForm.recurrencePattern === 'none' ? 'disabled' : ''}
          />
        </label>
      </div>
    </details>
    <div class="task-form-foot">
      <div class="task-form-summary">
        ${escapeHtml(taskForm.workspaceName)} • ${escapeHtml(taskForm.projectName)} • ${escapeHtml(taskForm.stageName || 'No project stage')} • ${escapeHtml(options.assigneeOptions.find((option) => option.id === taskForm.assigneeUserId)?.label || 'Unassigned')}
      </div>
      <div class="task-form-actions">
        <button type="button" id="task-form-reset">Reset</button>
        <button type="button" id="task-form-submit" class="primary" ${canMutate ? '' : 'disabled'}>Create task</button>
      </div>
    </div>
  `;
}

function updateTaskForm(patch) {
  taskForm = createProjectAwareTaskFormState({
    ...taskForm,
    ...patch
  });
  renderTaskForm();
}

function resetTaskForm() {
  taskForm = createProjectAwareTaskFormState({
    projectId: taskForm.projectId
  });
  renderTaskForm();
}

function getTaskFormFieldValue(target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (target instanceof HTMLInputElement && target.type === 'number') {
    return target.value === '' ? '' : Number(target.value);
  }
  return target.value;
}

function handleTaskFormFieldChange(target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const name = target.name;
  if (!name) {
    return;
  }

  if (name === 'projectId') {
    updateTaskForm({
      projectId: getTaskFormFieldValue(target),
      stageDefinitionId: '',
      dueAtInput: '',
      startAtInput: '',
      hasCustomStageId: false,
      hasCustomDueAt: false,
      hasCustomStartAt: false
    });
    return;
  }

  if (name === 'stageDefinitionId') {
    updateTaskForm({
      stageDefinitionId: getTaskFormFieldValue(target),
      dueAtInput: '',
      startAtInput: '',
      hasCustomStageId: Boolean(target.value),
      hasCustomDueAt: false,
      hasCustomStartAt: false
    });
    return;
  }

  if (name === 'dueAtInput') {
    updateTaskForm({
      dueAtInput: getTaskFormFieldValue(target),
      hasCustomDueAt: Boolean(target.value)
    });
    return;
  }

  if (name === 'startAtInput') {
    updateTaskForm({
      startAtInput: getTaskFormFieldValue(target),
      hasCustomStartAt: Boolean(target.value)
    });
    return;
  }

  if (name === 'recurrencePattern') {
    updateTaskForm({
      recurrencePattern: getTaskFormFieldValue(target),
      recurrenceInterval: target.value === 'none' ? 1 : taskForm.recurrenceInterval || 1
    });
    return;
  }

  updateTaskForm({
    [name]: getTaskFormFieldValue(target)
  });
}

function showEditorMessage(message, tone = 'info') {
  editorEl.textContent = '';
  if (!message) {
    return;
  }

  const line = document.createElement('p');
  line.className = tone === 'error' ? 'error' : `editor-message ${tone}`;
  line.textContent = message;
  editorEl.appendChild(line);
}

function showError(message) {
  showEditorMessage(message, 'error');
}

function updateEntitlementPanel() {
  if (!SHOW_INTERNAL_SURFACES) {
    entitlementPanelEl.hidden = true;
    entitlementPanelEl.innerHTML = '';
    return;
  }

  entitlementPanelEl.hidden = false;
  const summary = getEntitlementStateSummary(entitlement);
  const presentation = getEntitlementPresentation(summary);
  const backend = getBackendState();
  const useLiveAuthority = hasBackendConfiguration(backend);
  const refreshOptions = ENTITLEMENT_REFRESH_SCENARIOS.map(({ id, label }) => {
    const selected = id === entitlementRefreshMode ? 'selected' : '';
    return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(label)}</option>`;
  }).join('');
  const refreshButtonLabel = isRefreshingEntitlement ? 'Refreshing...' : 'Refresh entitlement';
  const authorityControl = useLiveAuthority
    ? `
        <label class="field-label">
          Authority source
          <input type="text" value="Live backend transport" disabled />
        </label>
      `
    : `
        <label class="field-label">
          Mock authority response
          <select id="entitlement-refresh-mode">
            ${refreshOptions}
          </select>
        </label>
      `;

  entitlementPanelEl.innerHTML = `
    <div class="sync-header">
      <strong>Entitlement authority</strong>
      <span class="sync-pill ${presentation.badgeClass}">${escapeHtml(presentation.title)}</span>
    </div>
    <div class="sync-grid">
      <div class="sync-stat">
        <strong>Plan</strong>
        <div class="sync-value">${escapeHtml(summary.plan)}</div>
      </div>
      <div class="sync-stat">
        <strong>Last success</strong>
        <div class="sync-value">${escapeHtml(formatSyncDate(summary.lastSuccessfulAt))}</div>
      </div>
      <div class="sync-stat">
        <strong>Last attempt</strong>
        <div class="sync-value">${escapeHtml(formatSyncDate(summary.lastAttemptAt))}</div>
      </div>
      <div class="sync-stat">
        <strong>Authority source</strong>
        <div class="sync-value">${escapeHtml(summary.source || 'Unknown')}</div>
      </div>
    </div>
    <div class="control-row">
      ${authorityControl}
      <button id="entitlement-refresh-btn" type="button" ${isRefreshingEntitlement ? 'disabled' : ''}>${escapeHtml(refreshButtonLabel)}</button>
    </div>
    <p class="sync-note">${escapeHtml(useLiveAuthority ? `${presentation.detail} The configured backend transport now drives entitlement refreshes.` : presentation.detail)}</p>
  `;
}

function refreshEntitlementState() {
  entitlement = getEntitlementSnapshot({ allowPersistence: false });
  const entitlementSummary = getEntitlementStateSummary(entitlement);
  const entitlementCheck = requireEntitlement('tasks_manage', Date.now(), entitlement);
  canMutate = entitlementCheck.allowed;
  entitlementStatusEl.textContent = !canMutate
    ? `Read-only mode: ${entitlementCheck.reason || 'Planning access is currently limited.'}`
    : entitlementSummary.isOffline
      ? 'Using cached access while Rabbit waits for a fresh authority check.'
      : entitlementSummary.isStale
        ? 'Everything is available. Access will refresh again shortly.'
        : 'Everything you need to plan, capture, and update work is available.';
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

function buildPlannerState(shellState) {
  const viewState = getViewStateSummary({
    ...appData,
    shell: shellState
  }, {
    now: shellState.referenceNow
  });
  const viewTasks = viewState.tasks;
  const filteredTasks = getTaskFilters(viewTasks, {
    statusFilter: activeFilter,
    query: search
  }).map((task) => decorateTaskWithProject(task, appData.projects));
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
  const conflictTaskIds = planWindow.conflictTaskIds.filter((taskId) => visibleTaskIds.has(taskId));
  const calendarConflictTaskIds = planWindow.calendarConflictTaskIds.filter((taskId) => visibleTaskIds.has(taskId));
  const unschedulableTaskIds = planWindow.unschedulableTaskIds.filter((taskId) => visibleTaskIds.has(taskId));
  const pendingTaskIds = planWindow.pendingTaskIds.filter((taskId) => visibleTaskIds.has(taskId));
  const taskSemantics = Object.fromEntries(
    Object.entries(planWindow.taskSemantics || {}).filter(([taskId]) => visibleTaskIds.has(taskId))
  );

  return {
    viewState,
    planWindow,
    visibleTasks,
    overlaps,
    blockedTaskIds,
    conflictTaskIds,
    calendarConflictTaskIds,
    unschedulableTaskIds,
    pendingTaskIds,
    taskSemantics
  };
}

function updateSyncStatus() {
  const sync = getSyncStateSummary(appData);
  const cache = getClientCacheSummary(appData);
  const backend = getBackendState();
  const backendPresentation = getBackendPresentation(backend);
  const presentation = getSyncPresentation(sync);
  workspaceStatusPillEl.textContent = presentation.title;
  workspaceStatusPillEl.className = `workspace-pill ${presentation.badgeClass}`;
  const cacheKeysLabel = cache.displayKeys.length
    ? cache.displayKeys.join(' | ')
    : 'No persisted query keys yet.';
  const connectLabel = isBackendBusy && backendBusyAction === 'connect' ? 'Connecting...' : 'Connect';
  const refreshLabel = isBackendBusy && backendBusyAction === 'refresh' ? 'Refreshing...' : 'Refresh remote';
  const pushLabel = isBackendBusy && backendBusyAction === 'push' ? 'Pushing...' : 'Push outbox';
  const backendConfigured = hasBackendConfiguration(backend);

  if (!SHOW_INTERNAL_SURFACES) {
    syncPanelEl.innerHTML = `
      <div class="rail-header">
        <strong>Sync</strong>
        <span class="sync-pill ${presentation.badgeClass}">${escapeHtml(presentation.title)}</span>
      </div>
      <div class="sync-grid">
        <div class="sync-stat">
          <strong>Pending</strong>
          <div class="sync-value">${escapeHtml(String(sync.pendingCount))}</div>
        </div>
        <div class="sync-stat">
          <strong>Last update</strong>
          <div class="sync-value">${escapeHtml(formatSyncDate(sync.lastSyncAt))}</div>
        </div>
      </div>
      <p class="sync-note">${escapeHtml(presentation.detail)}</p>
    `;
    return;
  }

  syncPanelEl.innerHTML = `
    <div class="sync-header">
      <strong>Sync health</strong>
      <span class="sync-pill ${presentation.badgeClass}">${escapeHtml(presentation.title)}</span>
    </div>
    <div class="sync-grid">
      <div class="sync-stat">
        <strong>Pending changes</strong>
        <div class="sync-value">${escapeHtml(String(sync.pendingCount))}</div>
      </div>
      <div class="sync-stat">
        <strong>Last sync</strong>
        <div class="sync-value">${escapeHtml(formatSyncDate(sync.lastSyncAt))}</div>
      </div>
      <div class="sync-stat">
        <strong>Cursor</strong>
        <div class="sync-value">${escapeHtml(sync.syncCursor || 'Not set')}</div>
      </div>
      <div class="sync-stat">
        <strong>Device</strong>
        <div class="sync-value">${escapeHtml(sync.deviceId || 'Unknown')}</div>
      </div>
    </div>
    <div class="sync-grid">
      <div class="sync-stat">
        <strong>Cached queries</strong>
        <div class="sync-value">${escapeHtml(String(cache.queryCount))}</div>
      </div>
      <div class="sync-stat">
        <strong>Views cache</strong>
        <div class="sync-value">${escapeHtml(String(cache.viewCount))}</div>
      </div>
      <div class="sync-stat">
        <strong>Settings groups</strong>
        <div class="sync-value">${escapeHtml(String(cache.settingsGroupCount))}</div>
      </div>
      <div class="sync-stat">
        <strong>Calendar cache</strong>
        <div class="sync-value">${escapeHtml(String(cache.calendarCount))}</div>
      </div>
    </div>
    <p class="sync-note">${escapeHtml(presentation.detail)}</p>
    <p class="sync-note">${escapeHtml(`IndexedDB-style cache is hydrating ${cacheKeysLabel}. Active workspace: ${cache.activeWorkspaceId || 'Unknown'} | Active view: ${cache.activeViewId || 'Unknown'} | User: ${cache.userEmail}`)}</p>
    <div class="sync-header">
      <strong>Backend runtime</strong>
      <span class="sync-pill ${backendPresentation.badgeClass}">${escapeHtml(backendPresentation.title)}</span>
    </div>
    <div class="sync-grid">
      <div class="sync-stat">
        <strong>Backend URL</strong>
        <div class="sync-value">${escapeHtml(backend.baseUrl || 'Not set')}</div>
      </div>
      <div class="sync-stat">
        <strong>Status</strong>
        <div class="sync-value">${escapeHtml(backend.status)}</div>
      </div>
      <div class="sync-stat">
        <strong>Last request</strong>
        <div class="sync-value">${escapeHtml(formatSyncDate(backend.lastRequestAt))}</div>
      </div>
      <div class="sync-stat">
        <strong>Last push</strong>
        <div class="sync-value">${escapeHtml(formatSyncDate(backend.lastPushAt))}</div>
      </div>
    </div>
    <div class="control-row">
      <label class="field-label">
        Backend URL
        <input id="backend-base-url" type="url" placeholder="https://api.rabbit.local" value="${escapeHtml(backendBaseUrlInput)}" />
      </label>
      <label class="field-label">
        Bearer token
        <input id="backend-auth-token" type="password" placeholder="Optional access token" value="${escapeHtml(backendAuthTokenInput)}" />
      </label>
    </div>
    <div class="control-row">
      <button type="button" data-backend-action="save">Save settings</button>
      <button type="button" data-backend-action="connect" ${isBackendBusy || !backendConfigured ? 'disabled' : ''}>${escapeHtml(connectLabel)}</button>
      <button type="button" data-backend-action="refresh" ${isBackendBusy || !backendConfigured ? 'disabled' : ''}>${escapeHtml(refreshLabel)}</button>
      <button type="button" data-backend-action="push" ${isBackendBusy || !backendConfigured || !sync.pendingCount ? 'disabled' : ''}>${escapeHtml(pushLabel)}</button>
    </div>
    <p class="sync-note">${escapeHtml(backendPresentation.detail)}</p>
    ${backend.lastError ? `<p class="sync-note">${escapeHtml(`Last backend error: ${backend.lastError}`)}</p>` : ''}
  `;
}

function renderDesktopPlatformChrome(platformProfile) {
  shell.dataset.platform = platformProfile.id;
  shell.dataset.distribution = platformProfile.distribution;
  shell.classList.toggle('platform-macos', platformProfile.isMacLike);
  shell.classList.toggle('platform-windows', platformProfile.isWindowsLike);
  windowChromeEl.style.visibility = platformProfile.windowChrome.showTrafficLights ? 'visible' : 'hidden';
  workspaceKickerEl.textContent = 'Private workspace';

  shellActionsEl.querySelectorAll('[data-key-hint]').forEach((element) => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const hintId = element.dataset.keyHint;
    const shortcut = hintId === 'search'
      ? platformProfile.shortcuts.search
      : hintId === 'new-task'
        ? platformProfile.shortcuts.addTask
        : hintId === 'quick-meeting'
          ? platformProfile.shortcuts.quickMeeting
          : hintId === 'menu'
            ? platformProfile.shortcuts.appMenu
            : null;
    if (shortcut?.label) {
      element.textContent = shortcut.label;
    }
  });

  const menuLabelEl = shellActionsEl.querySelector('[data-menu-label]');
  if (menuLabelEl instanceof HTMLElement) {
    menuLabelEl.textContent = platformProfile.menuBehavior.label;
  }
}

function focusSearchInput() {
  searchEl.focus();
  searchEl.select();
}

function focusTaskComposer() {
  const titleInput = taskFormPanelEl.querySelector('input[name="title"]');
  if (titleInput instanceof HTMLInputElement) {
    titleInput.focus();
    titleInput.select();
  }
}

function syncDesktopShell(shellState) {
  const platformProfile = getDesktopPlatformProfileState();
  const syncState = getSyncStateSummary(appData);
  const inboxState = getInboxStateSummary(appData);
  const showTrayText = inboxState.unreadCount > 0
    || syncState.pendingCount > 0
    || shellState.agenda?.counts?.ongoing > 0;

  desktopShellBridge.syncShellState({
    shellState,
    syncState,
    inboxState,
    appVersion: DESKTOP_SHELL_APP_VERSION,
    distribution: platformProfile.distribution,
    maxTabs: Math.max(6, Array.isArray(shellState.tabs) ? shellState.tabs.length : 0),
    appBarSettings: {
      showTrayText,
      defaultConferenceType: 'GOOGLE_MEET',
      email: DEFAULT_CURRENT_USER_EMAIL,
      hasAIWorkflows: getEntitlementStateSummary(entitlement).aiEnabled,
      meetingInsights: {}
    }
  });
}

function performTaskAction(taskId, action, options: { clearComposerError?: boolean } = {}) {
  if (!canMutate) {
    showError('This install is currently read-only due to entitlement status.');
    return false;
  }

  const result = resolveTaskAction(tasks, taskId, action);
  if (!result.ok) {
    showError(result.error);
    return false;
  }

  appData = applyTaskMutation(appData, result);
  tasks = appData.tasks.slice();
  const nextTask = tasks.find((task) => task.id === taskId);
  if (action === 'complete' && sanitizeText(taskId) && nextTask?.status === 'done') {
    desktopShellBridge.send('appBar:taskCompleted', { taskId });
  }
  if (options.clearComposerError !== false) {
    showError('');
  }
  renderAll();
  return true;
}

function selectMyTasksSurface() {
  const matchingTab = Array.isArray(appData.shell?.tabs)
    ? appData.shell.tabs.find((tab) => tab.itemType === 'view' && tab.itemId === 'view_my_tasks')
    : null;

  if (matchingTab?.id) {
    setActiveShellTab(matchingTab.id);
    return;
  }

  setActiveShellView('view_my_tasks');
}

function openTaskFromDesktopShell(taskId) {
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task) {
    showError(`Desktop shell requested unknown task ${taskId}.`);
    return false;
  }

  selectMyTasksSurface();
  search = task.title;
  renderAll();
  focusSearchInput();
  return true;
}

function openTaskUrlFromDesktopShell(taskUrl = '') {
  const taskId = resolveTaskIdFromUrl(taskUrl);
  if (!taskId) {
    showError(`Desktop shell task URL could not be matched: ${taskUrl}`);
    return false;
  }

  return openTaskFromDesktopShell(taskId);
}

function openEventFromDesktopShell(payload: { providerId?: string } = {}) {
  search = '';
  setActiveShellTab('tab_calendar');
  const providerId = sanitizeText(payload.providerId);
  if (providerId) {
    const matchingEvent = (appData.calendarOverlay?.importedEvents || []).find((event) => event.providerId === providerId || event.id === providerId);
    if (matchingEvent) {
      showEditorMessage(`Focused calendar surface for ${matchingEvent.title}.`, 'info');
    }
  }
  renderAll();
  return true;
}

function openNewTaskFromDesktopShell() {
  const platformProfile = getDesktopPlatformProfileState();
  if (platformProfile.optionSpace.usesDedicatedWindow) {
    desktopShellBridge.send('openOptionSpace');
  }
  resetTaskForm();
  showError('');
  renderAll();
  focusTaskComposer();
}

function requestShellSearch() {
  desktopShellBridge.send('main:search');
  desktopShellBridge.emit('appBar:search');
}

function requestShellNewTask() {
  const payload = { type: 'task' };
  desktopShellBridge.send('main:openNew', payload);
  desktopShellBridge.emit('appBar:openNew', payload);
}

function requestQuickMeeting() {
  const payload = createQuickMeetingPayload({
    conferenceProvider: 'GOOGLE_MEET',
    addNotetaker: false
  });
  desktopShellBridge.send('main:quickMeeting:create', payload);
  desktopShellBridge.emit('appBar:quickMeeting:create', payload);
}

function requestShellMenu() {
  desktopShellBridge.emit('windows:showMainMenu', { x: 0, y: 0 });
}

function requestOpenCalendarSurface() {
  desktopShellBridge.send('navigateInApp', '/web/calendar');
  desktopShellBridge.emit('tabs:select', 'tab_calendar');
}

function requestOpenProjectManagerSurface() {
  desktopShellBridge.send('navigateInApp', '/web/views/project-timelines');
  setActiveShellView('view_project_timelines');
  renderAll();
}

function requestOpenSchedulerSurface() {
  desktopShellBridge.send('navigateInApp', '/web/views/team-schedule');
  setActiveShellView('view_team_schedule');
  renderAll();
}

function installDesktopShellBridgeHandlers() {
  desktopShellBridge.on('tabs:get', () => {
    syncDesktopShell(getShellState(appData));
  });

  desktopShellBridge.on('tabs:select', (tabId) => {
    if (!sanitizeText(tabId)) {
      return;
    }
    setActiveShellTab(tabId);
    renderAll();
  });

  desktopShellBridge.on('tabs:add', () => {
    addDesktopShellTab();
    renderAll();
  });

  desktopShellBridge.on('tabs:move', (tabId, toIndex) => {
    moveDesktopShellTab(tabId, toIndex);
    renderAll();
  });

  desktopShellBridge.on('tabs:remove', (tabId) => {
    removeDesktopShellTab(tabId);
    renderAll();
  });

  desktopShellBridge.on('tabs:navigate', (payload = { direction: 'forward' }) => {
    const direction = payload?.direction === 'backward' ? 'backward' : 'forward';
    navigateDesktopShellTabs(direction);
    renderAll();
  });

  desktopShellBridge.on('tabs:didChangeOnlineStatus', () => {
    renderAll();
  });

  desktopShellBridge.on('appBar:getInitialData', () => {
    desktopShellBridge.send('loadCalendar');
    desktopShellBridge.send('loadScheduleSettings');
    syncDesktopShell(getShellState(appData));
  });

  desktopShellBridge.on('appBar:search', () => {
    focusSearchInput();
  });

  desktopShellBridge.on('openTask', (payload: { taskUrl?: string } = {}) => {
    openTaskUrlFromDesktopShell(payload.taskUrl);
  });

  desktopShellBridge.on('appBar:openTask', (payload: { taskId?: string } = {}) => {
    openTaskFromDesktopShell(payload.taskId);
  });

  desktopShellBridge.on('appBar:completeTask', (payload: { taskId?: string } = {}) => {
    if (!sanitizeText(payload.taskId)) {
      return;
    }
    performTaskAction(payload.taskId, 'complete');
  });

  desktopShellBridge.on('appBar:openEvent', (payload: { providerId?: string } = {}) => {
    openEventFromDesktopShell(payload);
  });

  desktopShellBridge.on('appBar:openNew', (payload: { type?: string } = {}) => {
    if (payload.type === 'task') {
      openNewTaskFromDesktopShell();
      return;
    }
    if (payload.type === 'event') {
      openEventFromDesktopShell();
      showEditorMessage('Desktop shell is pointing new event creation at the calendar surface.', 'info');
      return;
    }
    showError(`Desktop shell quick-create for ${payload.type || 'unknown'} is not wired yet.`);
  });

  desktopShellBridge.on('appBar:joinEvent', (payload: { conferenceLink?: string } = {}) => {
    const link = sanitizeText(payload.conferenceLink);
    if (!link) {
      showError('Quick meeting join action did not provide a conference link.');
      return;
    }
    showEditorMessage(`Join event requested: ${link}`, 'info');
  });

  desktopShellBridge.on('appBar:quickMeeting:create', (payload = createQuickMeetingPayload()) => {
    handleQuickMeetingCreate(createQuickMeetingPayload(payload));
  });

  desktopShellBridge.on('appBar:settings:requestSettings', () => {
    syncDesktopShell(getShellState(appData));
  });

  desktopShellBridge.on('appBar:settings:update', (payload: { showTrayText?: boolean } = {}) => {
    showEditorMessage(payload.showTrayText ? 'Tray text visibility enabled.' : 'Tray text visibility hidden.', 'info');
  });

  desktopShellBridge.on('windows:showMainMenu', (payload = { x: 0, y: 0 }) => {
    const platformProfile = getDesktopPlatformProfileState();
    showEditorMessage(`${platformProfile.menuBehavior.label} requested at ${payload.x}, ${payload.y}.`, 'info');
  });

  desktopShellBridge.on('main:showMainWindow', () => {
    if (typeof window !== 'undefined' && typeof window.focus === 'function') {
      window.focus();
    }
  });

  desktopShellBridge.on('main:quickMeeting:created', (payload: { eventId?: string } = {}) => {
    if (sanitizeText(payload.eventId)) {
      showEditorMessage(`Desktop confirmed quick meeting ${payload.eventId}.`, 'success');
    }
  });

  desktopShellBridge.on('main:quickMeeting:error', (payload: { error?: string } = {}) => {
    const errorMessage = sanitizeText(payload.error, 'Quick meeting failed.');
    showError(errorMessage);
  });
}

function updateSummary(plannerState, shellState) {
  const summary = getTaskStateSummary(tasks);
  const meta = plannerState.viewState.meta;
  const overlay = appData.calendarOverlay || {
    importedEvents: [],
    permissionStatus: 'unknown',
    refreshedAt: null
  };
  const activeLabel = meta.title || 'Calendar';
  const permissionLabel = overlay.permissionStatus === 'granted'
    ? `${plannerState.planWindow.busyBlocks.length} busy times are already protected in ${activeLabel}.`
    : 'Calendar availability has not synced yet.';
  const pendingLabel = plannerState.pendingTaskIds.length
    ? `${plannerState.pendingTaskIds.length} task${plannerState.pendingTaskIds.length === 1 ? '' : 's'} need a fresh schedule.`
    : 'The queue is fitting cleanly into the current plan.';

  metricsEl.innerHTML = `
    <div class="metric-grid">
      <div class="metric-card">
        <strong>Today</strong>
        <div class="metric-value">${escapeHtml(String(summary.today))}</div>
      </div>
      <div class="metric-card">
        <strong>Upcoming</strong>
        <div class="metric-value">${escapeHtml(String(summary.upcoming))}</div>
      </div>
      <div class="metric-card">
        <strong>Overdue</strong>
        <div class="metric-value">${escapeHtml(String(summary.overdue))}</div>
      </div>
      <div class="metric-card">
        <strong>Busy blocks</strong>
        <div class="metric-value">${escapeHtml(String(plannerState.planWindow.busyBlocks.length))}</div>
      </div>
      <div class="metric-card">
        <strong>Open space</strong>
        <div class="metric-value">${escapeHtml(String(plannerState.planWindow.availableMinutes))}</div>
      </div>
    </div>
    <p class="metric-note">${escapeHtml(permissionLabel)} ${escapeHtml(pendingLabel)} Last calendar refresh: ${escapeHtml(formatSyncDate(overlay.refreshedAt))}.</p>
  `;
}

function renderSidebar(shellState) {
  sidebarNavEl.innerHTML = shellState.sidebarSections.map((section) => {
    const items = section.items.map((item) => {
      if (item.kind === 'project') {
        const color = escapeHtml(item.color || '#94a3b8');
        return `
          <div class="nav-item-passive">
            <span class="nav-label">
              <span class="nav-dot" style="color: ${color}; background: ${color};"></span>
              <span class="nav-title">${escapeHtml(item.label)}</span>
            </span>
            <span class="nav-kind">project</span>
          </div>
        `;
      }

      const isActive = item.kind === 'route'
        ? shellState.activeTab?.route === item.route
        : shellState.activeViewId === item.viewId || shellState.activeTab?.itemId === item.viewId;

      return `
        <button
          type="button"
          class="nav-item ${isActive ? 'active' : ''}"
          data-kind="${escapeHtml(item.kind)}"
          data-route="${escapeHtml(item.route || '')}"
          data-view-id="${escapeHtml(item.viewId || '')}"
        >
          <span class="nav-label">
            <span class="nav-dot"></span>
            <span class="nav-title">${escapeHtml(item.label)}</span>
          </span>
          <span class="nav-kind">${escapeHtml(item.layout || item.kind)}</span>
        </button>
      `;
    }).join('');

    return `
      <section class="sidebar-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="sidebar-items">${items}</div>
      </section>
    `;
  }).join('');
}

function renderTabStrip(shellState) {
  tabStripEl.innerHTML = shellState.tabs.map((tab, index) => `
    <div class="tab-shell">
      <button type="button" class="tab-button ${shellState.activeTabId === tab.id ? 'active' : ''}" data-tab-id="${escapeHtml(tab.id)}" data-tab-index="${escapeHtml(String(index))}">
        <span class="tab-label">${escapeHtml(tab.title)}</span>
        <span class="tab-kind">${escapeHtml(tab.itemType)}</span>
      </button>
      ${tab.closable ? `<button type="button" class="tab-close" aria-label="Close ${escapeHtml(tab.title)}" data-tab-close="${escapeHtml(tab.id)}">×</button>` : ''}
    </div>
  `).join('') + `
    <button type="button" class="tab-add" data-tab-command="add">+</button>
  `;
}

function renderViewHeader(shellState, plannerState) {
  const meta = plannerState.viewState.meta;
  const chips = [
    meta.collectionLabel,
    activePlanWindow === 'today'
      ? 'Today'
      : activePlanWindow === 'week'
        ? 'This week'
        : 'All planned work',
    `${plannerState.visibleTasks.length} visible ${meta.itemType === 'projects' ? 'records' : 'tasks'}`
  ]
    .concat(Array.isArray(meta.filterSummary) ? meta.filterSummary.slice(0, 2) : [])
    .map((chip) => `<span class="view-chip">${escapeHtml(chip)}</span>`)
    .join('');
  const focusLabel = activePlanWindow === 'today'
    ? 'Focused on today'
    : activePlanWindow === 'week'
      ? 'Focused on this week'
      : 'Full queue';

  viewHeaderEl.innerHTML = `
    <div class="view-copy">
      <div class="view-breadcrumb">My workspace</div>
      <h2>${escapeHtml(meta.title)}</h2>
      <p>${escapeHtml(meta.description)}</p>
      <div class="view-chip-row">${chips}</div>
    </div>
    <div class="view-focus-card">
      <strong>${escapeHtml(focusLabel)}</strong>
      <span>${escapeHtml(String(plannerState.visibleTasks.length))} task${plannerState.visibleTasks.length === 1 ? '' : 's'} ready to review.</span>
    </div>
  `;
}

function renderAgendaGroup(title, entries, emptyMessage) {
  const items = entries.length
    ? entries.map((entry) => `
        <article class="agenda-item">
          <div class="agenda-head">
            <div class="agenda-title">${escapeHtml(entry.title)}</div>
            <span class="agenda-type">${escapeHtml(entry.sourceType)}</span>
          </div>
          <div class="agenda-subtitle">${escapeHtml(entry.subtitle || 'Untitled source')}</div>
          <div class="agenda-time">${escapeHtml(formatCompactDate(entry.startAt || entry.dueAt || entry.sortAt))}</div>
        </article>
      `).join('')
    : `<p class="muted">${escapeHtml(emptyMessage)}</p>`;

  return `
    <section class="agenda-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="agenda-items">${items}</div>
    </section>
  `;
}

function renderAgenda(shellState) {
  const agenda = shellState.agenda;
  agendaPanelEl.innerHTML = `
    <div class="rail-header">
      <strong>Agenda</strong>
      <span class="rail-count">${escapeHtml(String(agenda.counts.total))} items</span>
    </div>
    <div class="agenda-groups">
      ${renderAgendaGroup('Ongoing', agenda.ongoing, 'Nothing is in progress right now.')}
      ${renderAgendaGroup('Upcoming', agenda.upcoming, 'No scheduled items are queued next.')}
      ${renderAgendaGroup('Timeless', agenda.timeless, 'No timeless tasks are waiting.')}
    </div>
  `;
}

function renderInboxPanel() {
  const inboxState = getInboxStateSummary(appData);
  const items = inboxState.items.length
    ? inboxState.items.map((item) => `
        <article class="inbox-item ${item.read ? '' : 'unread'}">
          <div class="inbox-item-head">
            <div>
              <div class="inbox-item-title">${escapeHtml(item.title)}</div>
              <div class="inbox-item-subtitle">${escapeHtml(item.targetSubtitle || item.sourceLabel)}</div>
            </div>
            <div class="inbox-item-time">${escapeHtml(formatCompactDate(item.createdTime))}</div>
          </div>
          <p class="inbox-item-note">${escapeHtml(item.description || 'No additional details are available yet.')}</p>
          <div class="inbox-item-foot">
            <div class="inbox-pill-row">
              <span class="inbox-pill">${escapeHtml(item.sourceLabel)}</span>
              <span class="inbox-pill">${escapeHtml(item.actionLabel)}</span>
            </div>
            <div class="inbox-item-time">${escapeHtml(item.targetTitle || 'Inbox item')}</div>
          </div>
        </article>
      `).join('')
    : `<p class="muted">${escapeHtml(inboxState.emptyState)}</p>`;

  inboxPanelEl.innerHTML = `
    <div class="rail-header">
      <strong>Inbox</strong>
      <span class="rail-count">${escapeHtml(String(inboxState.unreadCount))} unread</span>
    </div>
    <p class="rail-note">${escapeHtml(String(inboxState.needsActionCount))} item(s) still need action across ${escapeHtml(String(inboxState.sourceCount))} source(s).</p>
    <div class="inbox-list">${items}</div>
  `;
}

function renderTasks(plannerState, shellState) {
  const {
    visibleTasks,
    overlaps,
    blockedTaskIds,
    calendarConflictTaskIds,
    conflictTaskIds,
    unschedulableTaskIds,
    pendingTaskIds,
    taskSemantics
  } = plannerState;
  const meta = plannerState.viewState.meta;
  const calendarConflictTaskSet = new Set(calendarConflictTaskIds);
  const conflictTaskSet = new Set(conflictTaskIds);
  const unschedulableTaskSet = new Set(unschedulableTaskIds);
  const pendingTaskSet = new Set(pendingTaskIds);
  const taskTitleById = new Map(appData.tasks.map((task) => [task.id, task.title]));
  taskListEl.innerHTML = '';
  surfaceCountEl.textContent = `${visibleTasks.length} visible`;
  surfaceCaptionEl.textContent = activePlanWindow === 'today'
    ? 'Scheduled for today.'
    : activePlanWindow === 'week'
      ? 'Scheduled for the next seven days.'
      : `${meta.description}${meta.filterSummary.length ? ` Filters: ${meta.filterSummary.join(', ')}.` : ''}`;

  if (!visibleTasks.length) {
    taskListEl.innerHTML = `<p class="muted">${escapeHtml(meta.emptyState)}</p>`;
    return;
  }

  visibleTasks.forEach((task) => {
    const semantics = taskSemantics[task.id] || {};
    const conflictIds = semantics.overlapTaskIds?.length ? semantics.overlapTaskIds : overlaps[task.id] || [];
    const schedule = getTaskScheduleSummary(task);
    const conflictLabels = conflictIds.map((taskId) => taskTitleById.get(taskId) || taskId);
    const blockerLabels = (semantics.blockedByOpenTaskIds || []).map((taskId) => taskTitleById.get(taskId) || taskId);
    const alerts = [
      blockerLabels.length
        ? `<div class="task-alert warning">Blocked by: ${escapeHtml(blockerLabels.join(', '))}</div>`
        : '',
      conflictTaskSet.has(task.id) && conflictLabels.length
        ? `<div class="task-alert error">Overlap with: ${escapeHtml(conflictLabels.join(', '))}</div>`
        : '',
      calendarConflictTaskSet.has(task.id)
        ? '<div class="task-alert error">Busy time conflict.</div>'
        : '',
      pendingTaskSet.has(task.id)
        ? '<div class="task-alert warning">Needs a new schedule.</div>'
        : '',
      unschedulableTaskSet.has(task.id)
        ? '<div class="task-alert error">Does not fit in this planning window.</div>'
        : ''
    ].filter(Boolean).join('');
    const item = document.createElement('article');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="task-main">
        <div class="task-meta-row">
          <span class="project-chip">${escapeHtml(task.projectName || 'Inbox')}</span>
          ${task.status === 'done' ? '<span class="status-chip">Done</span>' : ''}
          ${schedule.shouldDisplay ? `<span class="status-chip tone-${escapeHtml(schedule.tone)}">${escapeHtml(schedule.shortLabel)}</span>` : ''}
        </div>
        <div class="task-title ${task.status === 'done' ? 'done' : ''}">${escapeHtml(task.title)}</div>
        <div class="task-note">${escapeHtml(task.description || 'No notes')}</div>
        <div class="task-foot">
          <span>Due ${escapeHtml(formatDisplayDateTime(task.dueAt))}</span>
          <span>${escapeHtml(String(task.durationMinutes))} min</span>
          <span>${escapeHtml(task.recurrence.pattern)}</span>
          ${schedule.shouldDisplay ? `<span>${escapeHtml(schedule.label)}</span>` : ''}
        </div>
        ${alerts}
      </div>
      <div class="task-side">
        <div class="task-time">${escapeHtml(formatCompactDate(task.startAt || task.dueAt))}</div>
        <div class="task-actions">
          <button data-action="complete" data-id="${escapeHtml(task.id)}" ${canMutate ? '' : 'disabled'}>${task.status === 'done' ? 'Undo' : 'Done'}</button>
          <button data-action="delete" data-id="${escapeHtml(task.id)}" ${canMutate ? '' : 'disabled'}>Delete</button>
        </div>
      </div>
    `;
    taskListEl.appendChild(item);
  });
}

function setActiveShellTab(tabId: string) {
  appData = {
    ...appData,
    shell: activateShellTab(appData.shell || {}, tabId)
  };
}

function setActiveShellView(viewId: string) {
  appData = {
    ...appData,
    shell: activateShellView(appData.shell || {}, viewId)
  };
}

function addDesktopShellTab(viewId = '') {
  appData = {
    ...appData,
    shell: addShellViewTab(appData.shell || {}, viewId)
  };
}

function moveDesktopShellTab(tabId: string, toIndex: number) {
  appData = {
    ...appData,
    shell: moveShellTab(appData.shell || {}, tabId, toIndex)
  };
}

function removeDesktopShellTab(tabId: string) {
  appData = {
    ...appData,
    shell: removeShellTab(appData.shell || {}, tabId)
  };
}

function navigateDesktopShellTabs(direction: 'forward' | 'backward') {
  appData = {
    ...appData,
    shell: navigateShellTabs(appData.shell || {}, direction)
  };
}

function getActiveDesktopTab() {
  const shellState = getShellState(appData);
  return shellState.activeTab || null;
}

function resolveTaskIdFromUrl(taskUrl = '') {
  const normalizedUrl = sanitizeText(taskUrl);
  if (!normalizedUrl) {
    return '';
  }

  try {
    const parsed = new URL(normalizedUrl, 'https://app.rabbit.local');
    const taskIdFromQuery = sanitizeText(parsed.searchParams.get('taskId'));
    if (taskIdFromQuery && tasks.some((task) => task.id === taskIdFromQuery)) {
      return taskIdFromQuery;
    }
  } catch {
    // Fall through to substring matching.
  }

  return tasks.find((task) => normalizedUrl.includes(task.id))?.id || '';
}

function createQuickMeetingEvent(payload = { conferenceProvider: 'GOOGLE_MEET', addNotetaker: false }) {
  const now = new Date();
  const start = new Date(now.valueOf() + 15 * 60 * 1000);
  const end = new Date(start.valueOf() + 30 * 60 * 1000);
  const eventId = `quick_meeting_${now.valueOf()}`;
  const provider = sanitizeText(payload.conferenceProvider, 'GOOGLE_MEET').toUpperCase();
  const conferenceHost = provider === 'ZOOM'
    ? 'https://zoom.us/j/'
    : provider === 'MICROSOFT_TEAMS'
      ? 'https://teams.microsoft.com/l/meetup-join/'
      : 'https://meet.google.com/';
  const normalizedEvent = normalizeCalendarEvent({
    id: eventId,
    externalId: eventId,
    providerId: eventId,
    title: 'Quick Meeting',
    provider: 'google',
    providerType: 'GOOGLE',
    calendarId: 'team-primary',
    email: DEFAULT_CURRENT_USER_EMAIL,
    status: 'busy',
    start: start.toISOString(),
    end: end.toISOString(),
    createdTime: now.toISOString(),
    updatedTime: now.toISOString(),
    type: 'NORMAL',
    visibility: 'DEFAULT',
    conferenceLink: `${conferenceHost}${eventId}`,
    conferenceType: provider.toLowerCase(),
    organizer: {
      displayName: DEFAULT_CURRENT_USER_NAME,
      email: DEFAULT_CURRENT_USER_EMAIL
    },
    attendees: [
      {
        displayName: DEFAULT_CURRENT_USER_NAME,
        email: DEFAULT_CURRENT_USER_EMAIL,
        isOptional: false,
        isOrganizer: true,
        status: 'accepted'
      }
    ],
    notes: payload.addNotetaker ? 'Quick meeting with note taker requested.' : 'Quick meeting created from desktop shell.'
  });

  if (!normalizedEvent) {
    throw new Error('Quick meeting payload could not be normalized into a calendar event.');
  }

  return {
    eventId,
    event: normalizedEvent
  };
}

function handleQuickMeetingCreate(payload = { conferenceProvider: 'GOOGLE_MEET', addNotetaker: false }) {
  try {
    const { eventId, event } = createQuickMeetingEvent(payload);
    appData = {
      ...appData,
      calendarOverlay: {
        ...(appData.calendarOverlay || {}),
        importedEvents: (appData.calendarOverlay?.importedEvents || []).concat(event),
        refreshedAt: new Date().toISOString(),
        permissionStatus: appData.calendarOverlay?.permissionStatus || 'granted'
      }
    };
    desktopShellBridge.send('appBar:quickMeeting:created', { eventId });
    desktopShellBridge.emit('main:quickMeeting:created', { eventId });
    showEditorMessage(`Quick meeting created for ${formatCompactDate(event.startAt)} using ${payload.conferenceProvider}.`, 'success');
    renderAll();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Quick meeting creation failed.';
    desktopShellBridge.send('appBar:quickMeeting:error', { error: message });
    desktopShellBridge.emit('main:quickMeeting:error', { error: message });
    showError(message);
  }
}

function persistAppData() {
  const saved = saveStoredData(appData);
  if (saved) {
    appData = saved;
    tasks = appData.tasks.slice();
  }
}

function renderWorkspace() {
  const platformProfile = getDesktopPlatformProfileState();
  const shellState = getShellState(appData);
  const plannerState = buildPlannerState(shellState);
  taskForm = createProjectAwareTaskFormState(taskForm);

  shell.className = `desktop-shell ${getShellThemeClassName(shellState.theme)}`;
  shell.dataset.theme = shellState.theme.dataTheme;
  renderDesktopPlatformChrome(platformProfile);
  searchEl.value = search;
  renderSidebar(shellState);
  renderTabStrip(shellState);
  renderViewHeader(shellState, plannerState);
  updateSummary(plannerState, shellState);
  renderTaskForm();
  renderTasks(plannerState, shellState);
  renderAgenda(shellState);
  renderInboxPanel();
  syncDesktopShell(shellState);
}

function renderAll() {
  refreshEntitlementState();
  persistAppData();
  updateSyncStatus();
  renderWorkspace();
}

taskFormPanelEl.addEventListener('input', (event) => {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    handleTaskFormFieldChange(target);
  }
});

taskFormPanelEl.addEventListener('change', (event) => {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    handleTaskFormFieldChange(target);
  }
});

taskFormPanelEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (target.id === 'task-form-reset') {
    resetTaskForm();
    if (getDesktopPlatformProfileState().optionSpace.usesDedicatedWindow) {
      desktopShellBridge.send('closeOptionSpace');
    }
    showError('');
    return;
  }

  if (target.id !== 'task-form-submit') {
    return;
  }

  if (!canMutate) {
    showError('This install is currently read-only due to entitlement status.');
    return;
  }

  const draft = buildTaskDraftFromFormState(taskForm);
  const result = upsertTask(tasks, draft);
  if (!result.ok) {
    showError(result.error);
    return;
  }

  appData = applyTaskMutation(appData, result);
  tasks = appData.tasks.slice();
  resetTaskForm();
  if (getDesktopPlatformProfileState().optionSpace.usesDedicatedWindow) {
    desktopShellBridge.send('closeOptionSpace');
  }
  showError('');
  renderAll();
});

searchEl.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    search = target.value.trim();
    renderWorkspace();
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
  renderWorkspace();
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
  renderWorkspace();
});

sidebarNavEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const button = target.closest('button[data-kind]');
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const kind = button.dataset.kind;
  const viewId = button.dataset.viewId;
  const route = button.dataset.route;

  if (kind === 'view' && viewId) {
    setActiveShellView(viewId);
    renderAll();
    return;
  }

  if (kind === 'route' && route === '/web/calendar') {
    desktopShellBridge.emit('tabs:select', 'tab_calendar');
  }
});

tabStripEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const addButton = target.closest('button[data-tab-command="add"]');
  if (addButton instanceof HTMLButtonElement) {
    desktopShellBridge.emit('tabs:add');
    return;
  }

  const closeButton = target.closest('button[data-tab-close]');
  if (closeButton instanceof HTMLButtonElement) {
    const tabId = closeButton.dataset.tabClose;
    if (tabId) {
      desktopShellBridge.emit('tabs:remove', tabId);
    }
    return;
  }

  const button = target.closest('button[data-tab-id]');
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const tabId = button.dataset.tabId;
  if (!tabId) {
    return;
  }

  desktopShellBridge.emit('tabs:select', tabId);
});

shellActionsEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const button = target.closest('button[data-shell-command]');
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const command = button.dataset.shellCommand;
  if (command === 'search') {
    requestShellSearch();
    return;
  }

  if (command === 'new-task') {
    requestShellNewTask();
    return;
  }

  if (command === 'quick-meeting') {
    requestQuickMeeting();
    return;
  }

  if (command === 'menu') {
    requestShellMenu();
  }
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
  performTaskAction(id, action);
});

syncPanelEl.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.id === 'backend-base-url') {
    backendBaseUrlInput = target.value;
    return;
  }

  if (target.id === 'backend-auth-token') {
    backendAuthTokenInput = target.value;
  }
});

syncPanelEl.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.dataset.backendAction;
  if (!action) {
    return;
  }

  if (action === 'save') {
    const next = setBackendState({
      status: hasBackendConfiguration({
        baseUrl: backendBaseUrlInput,
        authToken: backendAuthTokenInput
      })
        ? 'idle'
        : 'unconfigured'
    });
    renderAll();
    showEditorMessage(
      next.baseUrl
        ? `Saved backend settings for ${next.baseUrl}.`
        : 'Cleared the backend settings. Rabbit is local-only again.',
      'success'
    );
    return;
  }

  if (isBackendBusy) {
    return;
  }

  if (action === 'connect') {
    await handleBackendConnect();
    return;
  }

  if (action === 'refresh') {
    await handleBackendRefresh();
    return;
  }

  if (action === 'push') {
    await handleBackendPush();
  }
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
    const backend = getBackendState();
    const useLiveAuthority = hasBackendConfiguration(backend);
    const snapshot = await refreshEntitlementSnapshot(useLiveAuthority
      ? {
          scenario: 'active',
          transport: createBackendEntitlementTransport(backend),
          source: 'backend-authority'
        }
      : {
          scenario: entitlementRefreshMode
        });
    if (useLiveAuthority) {
      setBackendState({
        status: snapshot.authority?.status === 'fresh' ? 'online' : 'error',
        lastEntitlementRefreshAt: new Date().toISOString(),
        lastRequestAt: new Date().toISOString(),
        lastError: snapshot.authority?.status === 'fresh'
          ? null
          : snapshot.authority?.reason || 'Entitlement refresh did not confirm authority state.'
      });
    }
    showError('');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Entitlement refresh failed.';
    showError(message);
  } finally {
    isRefreshingEntitlement = false;
    renderAll();
  }
});

installDesktopShellBridgeHandlers();

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event) => {
    const platformProfile = getDesktopPlatformProfileState();
    const command = getShellCommandForKeyboardEvent(platformProfile, event);
    if (!command) {
      return;
    }

    event.preventDefault();

    if (command === 'search') {
      requestShellSearch();
      return;
    }

    if (command === 'new-task') {
      requestShellNewTask();
      return;
    }

    if (command === 'open-calendar') {
      requestOpenCalendarSurface();
      return;
    }

    if (command === 'open-project-manager') {
      requestOpenProjectManagerSurface();
      return;
    }

    if (command === 'open-scheduler') {
      requestOpenSchedulerSurface();
      return;
    }

    if (command === 'quick-meeting') {
      requestQuickMeeting();
      return;
    }

    if (command === 'close-tab') {
      const activeTab = getActiveDesktopTab();
      if (activeTab?.closable) {
        desktopShellBridge.emit('tabs:remove', activeTab.id);
      }
      return;
    }

    if (command === 'move-tab-left' || command === 'move-tab-right') {
      const shellState = getShellState(appData);
      const activeTab = getActiveDesktopTab();
      const currentIndex = shellState.tabs.findIndex((tab) => tab.id === activeTab?.id);
      if (currentIndex < 0 || !activeTab?.id) {
        return;
      }
      const nextIndex = command === 'move-tab-left'
        ? Math.max(0, currentIndex - 1)
        : Math.min(shellState.tabs.length - 1, currentIndex + 1);
      desktopShellBridge.emit('tabs:move', activeTab.id, nextIndex);
      return;
    }

    if (command === 'navigate-backward') {
      desktopShellBridge.emit('tabs:navigate', { direction: 'backward' });
      return;
    }

    if (command === 'navigate-forward') {
      desktopShellBridge.emit('tabs:navigate', { direction: 'forward' });
      return;
    }

    if (command === 'menu') {
      requestShellMenu();
    }
  });

  window.addEventListener('online', () => renderAll());
  window.addEventListener('offline', () => renderAll());
}

function run() {
  setFilter('all');
  setPlanWindowFilter('all');
  renderAll();
}

run();
