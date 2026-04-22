import {
  activateShellTab,
  activateShellView,
  applyTaskMutation,
  buildProjectSeedData,
  decorateTaskWithProject,
  formatDisplayDateTime,
  getProjectById,
  getShellState,
  getShellThemeClassName,
  getSyncStateSummary,
  getTaskFilters,
  getTaskStateSummary,
  getViewStateSummary,
  resolveTaskAction,
  upsertTask
} from './state.js';
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
shell.className = 'desktop-shell';
root.appendChild(shell);

shell.innerHTML = `
  <aside class="shell-sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark">R</div>
      <div class="brand-copy">
        <strong>Rabbit</strong>
        <p>Reverse-engineered desktop shell baseline</p>
      </div>
    </div>

    <div id="sidebar-nav" class="sidebar-nav"></div>

    <div class="sidebar-footer">
      <span class="sidebar-foot-label">Phase 4</span>
      <strong>Shell parity in progress</strong>
    </div>
  </aside>

  <section class="shell-workspace">
    <header class="workspace-header">
      <div class="workspace-heading">
        <span class="workspace-kicker">Desktop shell</span>
        <h1>Motion-style planner shell</h1>
      </div>
      <p class="workspace-status" id="entitlement-status"></p>
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

        <section class="panel composer-panel">
          <div class="composer-header">
            <div>
              <strong>Quick add</strong>
              <p>Capture a task into the current planning surface.</p>
            </div>
          </div>

          <div class="form-row">
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
            <button id="add" type="button">Add task</button>
          </div>
        </section>

        <section class="panel editor-panel" id="editor" aria-live="polite"></section>

        <section class="panel task-surface">
          <div class="surface-header">
            <div>
              <strong>Task surface</strong>
              <p id="surface-caption" class="surface-caption">Current planner output</p>
            </div>
            <span id="surface-count" class="surface-count"></span>
          </div>
          <section id="task-list" class="task-list"></section>
        </section>
      </section>

      <aside class="shell-rail">
        <section class="panel agenda-panel" id="agenda-panel"></section>
        <section class="panel sync-panel" id="sync-panel" aria-live="polite"></section>
        <section class="panel entitlement-panel" id="entitlement-panel" aria-live="polite"></section>
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
    max-width: 360px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
    text-align: right;
  }

  .tab-strip {
    display: flex;
    gap: 10px;
    padding: 0 24px 18px;
    overflow: auto;
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
  .form-row input::placeholder {
    color: rgba(148, 163, 184, 0.72);
  }

  .toolbar-search input:focus,
  .form-row input:focus,
  .form-row select:focus,
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

  .form-row {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    align-items: end;
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
    padding: 14px;
    display: grid;
    gap: 14px;
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
    width: 190px;
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

  .conflict,
  .error {
    margin-top: 10px;
    color: #b42318;
    font-size: 12px;
    line-height: 1.5;
  }

  .agenda-panel,
  .sync-panel,
  .entitlement-panel {
    display: grid;
    gap: 14px;
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
  .sync-pill {
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
  .sync-pill.local-only {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-muted);
  }

  .sync-pill.pending,
  .sync-pill.offline {
    background: #fff2d8;
    color: #9a6700;
  }

  .sync-pill.healthy {
    background: #dcfae6;
    color: #067647;
  }

  .sync-pill.degraded {
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
  if (!message) {
    return;
  }

  const line = document.createElement('p');
  line.className = 'error';
  line.textContent = message;
  editorEl.appendChild(line);
}

function updateEntitlementPanel() {
  const summary = getEntitlementStateSummary(entitlement);
  const presentation = getEntitlementPresentation(summary);
  const refreshOptions = ENTITLEMENT_REFRESH_SCENARIOS.map(({ id, label }) => {
    const selected = id === entitlementRefreshMode ? 'selected' : '';
    return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(label)}</option>`;
  }).join('');
  const refreshButtonLabel = isRefreshingEntitlement ? 'Refreshing...' : 'Refresh entitlement';

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
      <label class="field-label">
        Mock authority response
        <select id="entitlement-refresh-mode">
          ${refreshOptions}
        </select>
      </label>
      <button id="entitlement-refresh-btn" type="button" ${isRefreshingEntitlement ? 'disabled' : ''}>${escapeHtml(refreshButtonLabel)}</button>
    </div>
    <p class="sync-note">${escapeHtml(presentation.detail)}</p>
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

  return {
    viewState,
    planWindow,
    visibleTasks,
    overlaps,
    blockedTaskIds
  };
}

function updateSyncStatus() {
  const sync = getSyncStateSummary(appData);
  const presentation = getSyncPresentation(sync);

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
    <p class="sync-note">${escapeHtml(presentation.detail)}</p>
  `;
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
    ? `${plannerState.planWindow.busyBlocks.length} busy blocks active in ${activeLabel}`
    : `Calendar overlay ${overlay.permissionStatus}`;

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
        <strong>Blocked tasks</strong>
        <div class="metric-value">${escapeHtml(String(plannerState.blockedTaskIds.length))}</div>
      </div>
      <div class="metric-card">
        <strong>Available minutes</strong>
        <div class="metric-value">${escapeHtml(String(plannerState.planWindow.availableMinutes))}</div>
      </div>
    </div>
    <p class="metric-note">${escapeHtml(permissionLabel)} | Refreshed: ${escapeHtml(formatSyncDate(overlay.refreshedAt))}</p>
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
  tabStripEl.innerHTML = shellState.tabs.map((tab) => `
    <button type="button" class="tab-button ${shellState.activeTabId === tab.id ? 'active' : ''}" data-tab-id="${escapeHtml(tab.id)}">
      <span class="tab-label">${escapeHtml(tab.title)}</span>
      <span class="tab-kind">${escapeHtml(tab.itemType)}</span>
    </button>
  `).join('');
}

function renderViewHeader(shellState, plannerState) {
  const meta = plannerState.viewState.meta;
  const visibleColumns = Array.isArray(meta.columns) ? meta.columns.filter((column) => column.visible) : [];
  const chips = [
    `${meta.visibility} view`,
    `${meta.layout} layout`,
    `${meta.itemType} collection`,
    meta.collectionLabel,
    `${plannerState.visibleTasks.length} visible ${meta.itemType === 'projects' ? 'records' : 'tasks'}`,
    `${meta.sort.field} ${meta.sort.direction}`,
    `${visibleColumns.length} visible columns`
  ]
    .concat(Array.isArray(meta.groupBy) ? meta.groupBy.map((entry) => `${entry.key}${entry.by ? ` by ${entry.by}` : ''}`) : [])
    .concat(Array.isArray(meta.filterSummary) ? meta.filterSummary : [])
    .map((chip) => `<span class="view-chip">${escapeHtml(chip)}</span>`)
    .join('');

  viewHeaderEl.innerHTML = `
    <div class="view-copy">
      <div class="view-breadcrumb">Workspace / ${escapeHtml(meta.title)}</div>
      <h2>${escapeHtml(meta.title)}</h2>
      <p>${escapeHtml(meta.description)}</p>
      <div class="view-chip-row">${chips}</div>
    </div>
    <div class="view-stat-grid">
      <div class="view-stat">
        <strong>Visible</strong>
        <span>${escapeHtml(String(plannerState.visibleTasks.length))}</span>
      </div>
      <div class="view-stat">
        <strong>Columns</strong>
        <span>${escapeHtml(String(visibleColumns.length))}</span>
      </div>
      <div class="view-stat">
        <strong>Groups</strong>
        <span>${escapeHtml(String(meta.groupBy.length))}</span>
      </div>
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
      <strong>Agenda rail</strong>
      <span class="rail-count">${escapeHtml(String(agenda.counts.total))} items</span>
    </div>
    <div class="agenda-groups">
      ${renderAgendaGroup('Ongoing', agenda.ongoing, 'Nothing is in progress right now.')}
      ${renderAgendaGroup('Upcoming', agenda.upcoming, 'No scheduled items are queued next.')}
      ${renderAgendaGroup('Timeless', agenda.timeless, 'No timeless tasks are waiting.')}
    </div>
  `;
}

function renderTasks(plannerState, shellState) {
  const { visibleTasks, overlaps, blockedTaskIds } = plannerState;
  const meta = plannerState.viewState.meta;
  const blockedTaskSet = new Set(blockedTaskIds);
  taskListEl.innerHTML = '';
  surfaceCountEl.textContent = `${visibleTasks.length} visible`;
  surfaceCaptionEl.textContent = activePlanWindow === 'today'
    ? `${meta.collectionLabel} scoped to today.`
    : activePlanWindow === 'week'
      ? `${meta.collectionLabel} scoped to this week.`
      : `${meta.description} ${meta.filterSummary.length ? `Filters: ${meta.filterSummary.join(', ')}.` : ''}`;

  if (!visibleTasks.length) {
    taskListEl.innerHTML = `<p class="muted">${escapeHtml(meta.emptyState)}</p>`;
    return;
  }

  visibleTasks.forEach((task) => {
    const conflictIds = overlaps[task.id] || [];
    const isCalendarBlocked = blockedTaskSet.has(task.id);
    const item = document.createElement('article');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="task-main">
        <div class="task-meta-row">
          <span class="project-chip">${escapeHtml(task.projectName || 'Inbox')}</span>
          <span class="status-chip">${escapeHtml(task.status)}</span>
        </div>
        <div class="task-title ${task.status === 'done' ? 'done' : ''}">${escapeHtml(task.title)}</div>
        <div class="task-note">${escapeHtml(task.description || 'No notes')}</div>
        <div class="task-foot">
          <span>Due: ${escapeHtml(formatDisplayDateTime(task.dueAt))}</span>
          <span>Duration: ${escapeHtml(String(task.durationMinutes))} min</span>
          <span>Recurrence: ${escapeHtml(task.recurrence.pattern)}</span>
        </div>
        ${conflictIds.length ? `<div class="conflict">Task overlap with: ${escapeHtml(conflictIds.join(', '))}</div>` : ''}
        ${isCalendarBlocked ? '<div class="conflict">Calendar busy block overlaps this task.</div>' : ''}
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

function persistAppData() {
  const saved = saveStoredData(appData);
  if (saved) {
    appData = saved;
    tasks = appData.tasks.slice();
  }
}

function renderWorkspace() {
  const shellState = getShellState(appData);
  const plannerState = buildPlannerState(shellState);

  shell.className = `desktop-shell ${getShellThemeClassName(shellState.theme)}`;
  shell.dataset.theme = shellState.theme.dataTheme;
  renderSidebar(shellState);
  renderTabStrip(shellState);
  renderViewHeader(shellState, plannerState);
  updateSummary(plannerState, shellState);
  renderTasks(plannerState, shellState);
  renderAgenda(shellState);
}

function renderAll() {
  refreshEntitlementState();
  persistAppData();
  updateSyncStatus();
  renderWorkspace();
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
    setActiveShellTab('tab_calendar');
    renderAll();
  }
});

tabStripEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
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

  setActiveShellTab(tabId);
  renderAll();
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
  setFilter('all');
  setPlanWindowFilter('all');
  renderAll();
}

run();
