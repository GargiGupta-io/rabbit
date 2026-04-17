import { buildProjectSeedData, decorateTaskWithProject, getProjectById, getTaskFilters, getTaskStateSummary, resolveTaskAction, upsertTask, formatDisplayDateTime, generatePlanSlice } from './state.js';
import { loadStoredData, saveStoredData } from './storage.js';
import { getEntitlementSnapshot, resolveFeatureGate } from './entitlement.js';

const entitlement = getEntitlementSnapshot();
const appData = loadStoredData();
let tasks = appData.tasks.slice();
let activeFilter = 'all';
let search = '';

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
    <p>Phase 1 working prototype: tasks, recurrence, plan view, and entitlements.</p>
    <p class="entitlement">Plan: ${entitlement.plan} • AI: ${resolveFeatureGate('ai_suggest') ? 'enabled' : 'disabled'} • Calendar read: ${resolveFeatureGate('calendar_read') ? 'enabled' : 'disabled'}</p>
  </header>

  <section class="metrics" id="metrics"></section>

  <section class="toolbar">
    <input id="search" type="text" placeholder="Search tasks" />
    <div class="btn-group" id="filter-group">
      <button type="button" class="filter active" data-status="all">All</button>
      <button type="button" class="filter" data-status="todo">Todo</button>
      <button type="button" class="filter" data-status="done">Done</button>
      <button type="button" class="filter" data-status="overdue">Overdue</button>
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
  .task-list {
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
`;

document.head.appendChild(style);

const metricsEl = shell.querySelector('#metrics') as HTMLDivElement;
const searchEl = shell.querySelector('#search') as HTMLInputElement;
const filterContainer = shell.querySelector('#filter-group') as HTMLDivElement;
const titleEl = shell.querySelector('#title') as HTMLInputElement;
const projectEl = shell.querySelector('#project') as HTMLSelectElement;
const dueEl = shell.querySelector('#due') as HTMLInputElement;
const durationEl = shell.querySelector('#duration') as HTMLInputElement;
const recurrenceEl = shell.querySelector('#recurrence') as HTMLSelectElement;
const addBtn = shell.querySelector('#add') as HTMLButtonElement;
const editorEl = shell.querySelector('#editor') as HTMLElement;
const taskListEl = shell.querySelector('#task-list') as HTMLDivElement;

function hydrateProjects() {
  projectEl.innerHTML = '';
  buildProjectSeedData(appData.projects).forEach((project) => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    projectEl.appendChild(option);
  });
}

function updateSummary() {
  const summary = getTaskStateSummary(tasks);
  metricsEl.innerHTML = `
    <strong>Today:</strong> ${summary.today} 
    <strong>Upcoming:</strong> ${summary.upcoming} 
    <strong>Overdue:</strong> ${summary.overdue} 
    <strong>Done:</strong> ${summary.done}
  `;
}

function setFilter(filter) {
  activeFilter = filter;
  filterContainer.querySelectorAll('.filter').forEach((button) => {
    const buttonEl = button as HTMLButtonElement;
    buttonEl.classList.toggle('active', buttonEl.dataset.status === filter);
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

function renderTasks() {
  const filtered = getTaskFilters(tasks, { statusFilter: activeFilter, query: search }).map((task) => {
    return decorateTaskWithProject(task, appData.projects);
  });
  const { overlaps } = generatePlanSlice(filtered);
  taskListEl.innerHTML = '';

  if (!filtered.length) {
    taskListEl.innerHTML = '<p class="muted">No matching tasks.</p>';
    return;
  }

  filtered.forEach((task) => {
    const conflictIds = overlaps[task.id] || [];
    const item = document.createElement('article');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="muted">${task.projectName} • status: ${task.status}</div>
      <div class="task-title ${task.status === 'done' ? 'done' : ''}">${task.title}</div>
      <div class="muted">Due: ${formatDisplayDateTime(task.dueAt)} • Duration: ${task.durationMinutes} min • Recurrence: ${task.recurrence.pattern}</div>
      <div class="muted">${task.description ? task.description : 'No notes'}</div>
      ${conflictIds.length ? `<div class="conflict">Conflict with: ${conflictIds.join(', ')}</div>` : ''}
      <div class="task-actions">
        <button data-action="complete" data-id="${task.id}">${task.status === 'done' ? 'Undo' : 'Done'}</button>
        <button data-action="delete" data-id="${task.id}">Delete</button>
      </div>
    `;
    taskListEl.appendChild(item);
  });
}

function renderAll() {
  updateSummary();
  renderTasks();
  saveStoredData({ ...appData, tasks });
}

addBtn.addEventListener('click', () => {
  const draft = buildTaskDraft();
  const result = upsertTask(tasks, draft);
  if (!result.ok) {
    showError(result.error);
    return;
  }

  tasks = result.tasks;
  clearDraft();
  showError('');
  renderAll();
});

searchEl.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    search = target.value.trim();
    renderTasks();
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
  renderTasks();
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

  const result = resolveTaskAction(tasks, id, action);
  if (!result.ok) {
    showError(result.error);
    return;
  }
  tasks = result.tasks;
  showError('');
  renderAll();
});

function run() {
  hydrateProjects();
  renderAll();
}

run();
