import { DEFAULT_CURRENT_USER_ID } from './identityDefaults.js';

const DEFAULT_THEME_MODE = 'dark';
const ALLOWED_THEME_MODES = new Set(['light', 'dark']);
const DEFAULT_ACCENT = 'rabbit';
const DEFAULT_DENSITY = 'comfortable';
const DEFAULT_TAB_ID = 'tab_calendar';
const DEFAULT_VIEW_ID = 'view_my_tasks';
const VIEW_SECTION_TITLES = {
  views: 'My Views',
  team: 'Team Views'
};

const SHELL_VIEW_META = {
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    layout: 'schedule',
    surfaceKind: 'calendar',
    collectionLabel: 'Full schedule',
    description: 'Everything with scheduling context appears in one timeline-oriented surface.',
    emptyState: 'Nothing is scheduled here right now.'
  },
  agenda: {
    id: 'agenda',
    title: 'Agenda',
    layout: 'agenda',
    surfaceKind: 'agenda',
    collectionLabel: 'Current flow',
    description: 'See what is happening now, next, and soon across tasks and meetings.',
    emptyState: 'Nothing is active in the agenda right now.'
  },
  inbox: {
    id: 'inbox',
    title: 'Inbox',
    layout: 'list',
    surfaceKind: 'inbox',
    collectionLabel: 'Incoming work',
    description: 'Incoming items that still need attention live here.',
    emptyState: 'Inbox is clear.'
  },
  workspace: {
    id: 'workspace',
    title: 'Workspace',
    layout: 'status',
    surfaceKind: 'workspace',
    collectionLabel: 'Workspace status',
    description: 'Connection, save state, and backend health belong here instead of living on every route.',
    emptyState: 'Workspace status is ready.'
  },
  view_my_deadlines: {
    id: 'view_my_deadlines',
    title: 'My Deadlines',
    layout: 'kanban',
    surfaceKind: 'deadlines',
    collectionLabel: 'Deadline pressure',
    description: 'Tasks are ordered by due date so urgent work rises to the top.',
    emptyState: 'No deadlines are pressing right now.'
  },
  view_my_tasks: {
    id: 'view_my_tasks',
    title: 'My Tasks',
    layout: 'kanban',
    surfaceKind: 'tasks',
    collectionLabel: 'Personal queue',
    description: 'This view keeps the current task queue visible across scheduled and unscheduled work.',
    emptyState: 'Nothing is waiting in this view.'
  },
  view_project_timelines: {
    id: 'view_project_timelines',
    title: 'Project Timelines',
    layout: 'gantt',
    surfaceKind: 'project-timelines',
    collectionLabel: 'Project sequence',
    description: 'Project work is ordered to emphasize timeline flow instead of the raw inbox.',
    emptyState: 'No project work is ready yet.'
  },
  view_team_schedule: {
    id: 'view_team_schedule',
    title: 'Team Schedule',
    layout: 'kanban',
    surfaceKind: 'team-schedule',
    collectionLabel: 'Scheduled work',
    description: 'Scheduled tasks are prioritized so the shell reads like a planning surface.',
    emptyState: 'No team work is scheduled here yet.'
  }
};

const SHELL_ROUTE_DEFINITIONS = {
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    route: '/web/calendar',
    tabId: 'tab_calendar',
    closable: false,
    section: 'workspace'
  },
  agenda: {
    id: 'agenda',
    title: 'Agenda',
    route: '/web/agenda',
    tabId: 'tab_agenda',
    closable: true,
    section: 'workspace'
  },
  inbox: {
    id: 'inbox',
    title: 'Inbox',
    route: '/web/inbox',
    tabId: 'tab_inbox',
    closable: true,
    section: 'workspace'
  },
  workspace: {
    id: 'workspace',
    title: 'Workspace',
    route: '/web/workspace',
    tabId: 'tab_workspace',
    closable: true,
    section: 'workspace'
  }
};

const VIEW_DEFINITION_PRESETS = {
  view_my_deadlines: {
    type: 'projects-and-tasks',
    itemType: 'tasks',
    visibility: 'private',
    layout: 'kanban',
    groups: [
      { field: 'deadline', by: 'day' }
    ],
    sort: [
      { field: 'estimatedCompletionTime', direction: 'asc' }
    ],
    dateRange: { mode: 'quarter', value: 'current' },
    columns: [
      { id: 'name', label: 'Task', field: 'title', visible: true },
      { id: 'deadline', label: 'Deadline', field: 'dueDate', visible: true },
      { id: 'project', label: 'Project', field: 'projectName', visible: true },
      { id: 'priority', label: 'Priority', field: 'priorityLevel', visible: true }
    ],
    filters: {
      tasks: {
        assignee: '@me',
        completed: 'exclude',
        canceled: 'exclude',
        archived: 'exclude',
        isAutoScheduled: true,
        typeIn: ['NORMAL'],
        dueDate: {
          mode: 'on-or-after',
          value: 'now'
        },
        estimatedCompletionTime: null
      },
      projects: {
        completed: 'exclude',
        archived: 'exclude'
      }
    }
  },
  view_my_tasks: {
    type: 'projects-and-tasks',
    itemType: 'tasks',
    visibility: 'private',
    layout: 'kanban',
    groups: [
      { field: 'deadline', by: 'week' }
    ],
    sort: [
      { field: 'scheduledStart', direction: 'asc' }
    ],
    dateRange: null,
    columns: [
      { id: 'name', label: 'Task', field: 'title', visible: true },
      { id: 'project', label: 'Project', field: 'projectName', visible: true },
      { id: 'scheduledStart', label: 'Scheduled', field: 'scheduledStart', visible: true },
      { id: 'status', label: 'Status', field: 'status', visible: true }
    ],
    filters: {
      tasks: {
        assignee: '@me',
        completed: 'include',
        canceled: 'include',
        archived: 'exclude',
        isAutoScheduled: null,
        typeIn: [],
        dueDate: null,
        estimatedCompletionTime: null
      },
      projects: {
        completed: 'include',
        archived: 'exclude'
      }
    }
  },
  view_project_timelines: {
    type: 'projects-and-tasks',
    itemType: 'projects',
    visibility: 'team',
    layout: 'gantt',
    groups: [
      { field: 'workspace', by: null }
    ],
    sort: [
      { field: 'startDate', direction: 'asc' }
    ],
    dateRange: null,
    columns: [
      { id: 'name', label: 'Project', field: 'projectName', visible: true },
      { id: 'workspace', label: 'Workspace', field: 'workspaceName', visible: true },
      { id: 'startDate', label: 'Start', field: 'startOn', visible: true },
      { id: 'deadline', label: 'Due', field: 'dueDate', visible: true }
    ],
    filters: {
      tasks: {
        assignee: null,
        completed: 'include',
        canceled: 'include',
        archived: 'exclude',
        isAutoScheduled: null,
        typeIn: [],
        dueDate: null,
        estimatedCompletionTime: null
      },
      projects: {
        completed: 'include',
        archived: 'exclude'
      }
    }
  },
  view_team_schedule: {
    type: 'projects-and-tasks',
    itemType: 'tasks',
    visibility: 'team',
    layout: 'kanban',
    groups: [
      { field: 'scheduledDate', by: 'day' },
      { field: 'user', by: null }
    ],
    sort: [
      { field: 'estimatedCompletionTime', direction: 'asc' }
    ],
    dateRange: {
      mode: 'defined-relative',
      value: 'next-7-days'
    },
    columns: [
      { id: 'name', label: 'Task', field: 'title', visible: true },
      { id: 'scheduledDate', label: 'Scheduled', field: 'estimatedCompletionTime', visible: true },
      { id: 'user', label: 'Assignee', field: 'assigneeUserId', visible: true },
      { id: 'workspace', label: 'Workspace', field: 'workspaceName', visible: true }
    ],
    filters: {
      tasks: {
        assignee: null,
        completed: 'include',
        canceled: 'include',
        archived: 'exclude',
        isAutoScheduled: null,
        typeIn: [],
        dueDate: null,
        estimatedCompletionTime: {
          mode: 'defined-relative',
          value: 'next-7-days'
        }
      },
      projects: {
        completed: 'include',
        archived: 'exclude'
      }
    }
  }
};

function createDefaultViewDefinition(viewId = DEFAULT_VIEW_ID) {
  const preset = VIEW_DEFINITION_PRESETS[viewId] || VIEW_DEFINITION_PRESETS[DEFAULT_VIEW_ID];
  return {
    type: preset.type,
    itemType: preset.itemType,
    visibility: preset.visibility,
    layout: preset.layout,
    groups: preset.groups.map((group) => ({ ...group })),
    sort: preset.sort.map((rule) => ({ ...rule })),
    dateRange: preset.dateRange ? { ...preset.dateRange } : null,
    columns: preset.columns.map((column) => ({ ...column })),
    filters: {
      tasks: {
        ...preset.filters.tasks,
        typeIn: Array.isArray(preset.filters.tasks.typeIn) ? preset.filters.tasks.typeIn.slice() : [],
        dueDate: preset.filters.tasks.dueDate ? { ...preset.filters.tasks.dueDate } : null,
        estimatedCompletionTime: preset.filters.tasks.estimatedCompletionTime
          ? { ...preset.filters.tasks.estimatedCompletionTime }
          : null
      },
      projects: {
        ...preset.filters.projects
      }
    }
  };
}

const DEFAULT_SAVED_VIEWS = [
  {
    id: 'view_my_deadlines',
    name: 'My Deadlines',
    route: '/web/views/my-deadlines',
    type: 'projects-and-tasks',
    layout: 'kanban',
    isPrivate: true,
    section: 'views',
    groupBy: [
      { key: 'deadline', by: 'day' }
    ],
    sort: {
      field: 'estimatedCompletionTime',
      direction: 'asc'
    },
    definitionVersion: 3,
    definition: createDefaultViewDefinition('view_my_deadlines')
  },
  {
    id: 'view_my_tasks',
    name: 'My Tasks',
    route: '/web/views/my-tasks',
    type: 'projects-and-tasks',
    layout: 'kanban',
    isPrivate: true,
    section: 'views',
    groupBy: [
      { key: 'deadline', by: 'week' }
    ],
    sort: {
      field: 'scheduledStart',
      direction: 'asc'
    },
    definitionVersion: 3,
    definition: createDefaultViewDefinition('view_my_tasks')
  },
  {
    id: 'view_project_timelines',
    name: 'Project Timelines',
    route: '/web/views/project-timelines',
    type: 'projects-and-tasks',
    layout: 'gantt',
    isPrivate: false,
    section: 'team',
    groupBy: [
      { key: 'workspace', by: null }
    ],
    sort: {
      field: 'startDate',
      direction: 'asc'
    },
    definitionVersion: 3,
    definition: createDefaultViewDefinition('view_project_timelines')
  },
  {
    id: 'view_team_schedule',
    name: 'Team Schedule',
    route: '/web/views/team-schedule',
    type: 'projects-and-tasks',
    layout: 'kanban',
    isPrivate: false,
    section: 'team',
    groupBy: [
      { key: 'scheduledDate', by: 'day' },
      { key: 'user', by: null }
    ],
    sort: {
      field: 'estimatedCompletionTime',
      direction: 'asc'
    },
    definitionVersion: 3,
    definition: createDefaultViewDefinition('view_team_schedule')
  }
];

function createDefaultTabs() {
  return [
    {
      id: SHELL_ROUTE_DEFINITIONS.calendar.tabId,
      title: SHELL_ROUTE_DEFINITIONS.calendar.title,
      route: SHELL_ROUTE_DEFINITIONS.calendar.route,
      itemType: 'route',
      itemId: SHELL_ROUTE_DEFINITIONS.calendar.id,
      closable: SHELL_ROUTE_DEFINITIONS.calendar.closable,
      active: true
    },
    {
      id: 'tab_my_tasks',
      title: 'My Tasks',
      route: '/web/views/my-tasks',
      itemType: 'view',
      itemId: 'view_my_tasks',
      closable: true,
      active: false
    },
    {
      id: 'tab_project_timelines',
      title: 'Project Timelines',
      route: '/web/views/project-timelines',
      itemType: 'view',
      itemId: 'view_project_timelines',
      closable: true,
      active: false
    }
  ];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
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

function parseDate(value) {
  const iso = toIsoString(value);
  if (!iso) {
    return null;
  }

  return new Date(iso);
}

function cloneGroupBy(groupBy = []) {
  if (!Array.isArray(groupBy)) {
    return [];
  }

  return groupBy
    .map((entry) => {
      if (!isPlainObject(entry)) {
        return null;
      }

      return {
        key: sanitizeText(entry.key),
        by: entry.by == null ? null : sanitizeText(entry.by)
      };
    })
    .filter((entry) => entry && entry.key);
}

function normalizeStringArray(value, fallback = []) {
  const seen = new Set();
  const source = Array.isArray(value) ? value : fallback;
  return source
    .map((entry) => sanitizeText(entry).toUpperCase())
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false;
      }
      seen.add(entry);
      return true;
    });
}

function normalizeViewInclusion(value, fallback = 'include') {
  return sanitizeText(value, fallback).toLowerCase() === 'exclude' ? 'exclude' : 'include';
}

function normalizeBooleanOrNull(value, fallback = null) {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

function normalizeViewColumns(columns = [], fallback = []) {
  const source = Array.isArray(columns) && columns.length ? columns : fallback;
  return source
    .map((column) => {
      if (!isPlainObject(column)) {
        return null;
      }

      const id = sanitizeText(column.id);
      const label = sanitizeText(column.label);
      const field = sanitizeText(column.field);
      if (!id || !label || !field) {
        return null;
      }

      return {
        id,
        label,
        field,
        visible: column.visible == null ? true : Boolean(column.visible)
      };
    })
    .filter(Boolean);
}

function normalizeViewGroups(groups = [], fallback = []) {
  const normalized = cloneGroupBy(groups.map((group) => ({
    key: group?.field || group?.key,
    by: group?.by
  })));

  if (normalized.length) {
    return normalized.map((group) => ({
      field: group.key,
      by: group.by
    }));
  }

  return cloneGroupBy(fallback.map((group) => ({
    key: group?.field || group?.key,
    by: group?.by
  }))).map((group) => ({
    field: group.key,
    by: group.by
  }));
}

function normalizeViewSort(sort = [], fallback = []) {
  const source = Array.isArray(sort) ? sort : (isPlainObject(sort) ? [sort] : []);
  const defaultSource = Array.isArray(fallback) ? fallback : (isPlainObject(fallback) ? [fallback] : []);
  const candidates = source.length ? source : defaultSource;

  return candidates
    .map((rule) => {
      if (!isPlainObject(rule)) {
        return null;
      }
      const field = sanitizeText(rule.field);
      if (!field) {
        return null;
      }
      return {
        field,
        direction: sanitizeText(rule.direction, 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'
      };
    })
    .filter(Boolean);
}

function normalizeRelativeWindow(raw = null, fallback = null) {
  const source = isPlainObject(raw) ? raw : (isPlainObject(fallback) ? fallback : null);
  if (!source) {
    return null;
  }

  const mode = sanitizeText(source.mode);
  const value = sanitizeText(source.value);
  if (!mode || !value) {
    return null;
  }

  return {
    mode,
    value
  };
}

function normalizeViewFilters(filters = {}, fallback = {}) {
  const source = isPlainObject(filters) ? filters : {};
  const fallbackValue = isPlainObject(fallback) ? fallback : {};
  const taskFilters = isPlainObject(source.tasks) ? source.tasks : {};
  const fallbackTaskFilters = isPlainObject(fallbackValue.tasks) ? fallbackValue.tasks : {};
  const projectFilters = isPlainObject(source.projects) ? source.projects : {};
  const fallbackProjectFilters = isPlainObject(fallbackValue.projects) ? fallbackValue.projects : {};

  return {
    tasks: {
      assignee: sanitizeText(taskFilters.assignee, sanitizeText(fallbackTaskFilters.assignee)) || null,
      completed: normalizeViewInclusion(taskFilters.completed, normalizeViewInclusion(fallbackTaskFilters.completed, 'include')),
      canceled: normalizeViewInclusion(taskFilters.canceled, normalizeViewInclusion(fallbackTaskFilters.canceled, 'include')),
      archived: normalizeViewInclusion(taskFilters.archived, normalizeViewInclusion(fallbackTaskFilters.archived, 'exclude')),
      isAutoScheduled: normalizeBooleanOrNull(taskFilters.isAutoScheduled, normalizeBooleanOrNull(fallbackTaskFilters.isAutoScheduled)),
      typeIn: normalizeStringArray(taskFilters.typeIn, fallbackTaskFilters.typeIn),
      dueDate: normalizeRelativeWindow(taskFilters.dueDate, fallbackTaskFilters.dueDate),
      estimatedCompletionTime: normalizeRelativeWindow(taskFilters.estimatedCompletionTime, fallbackTaskFilters.estimatedCompletionTime)
    },
    projects: {
      completed: normalizeViewInclusion(projectFilters.completed, normalizeViewInclusion(fallbackProjectFilters.completed, 'include')),
      archived: normalizeViewInclusion(projectFilters.archived, normalizeViewInclusion(fallbackProjectFilters.archived, 'exclude'))
    }
  };
}

function normalizeViewDefinition(rawDefinition = {}, fallbackDefinition = {}) {
  const source = isPlainObject(rawDefinition) ? rawDefinition : {};
  const fallback = isPlainObject(fallbackDefinition) ? fallbackDefinition : createDefaultViewDefinition(DEFAULT_VIEW_ID);

  return {
    type: sanitizeText(source.type, sanitizeText(fallback.type, 'projects-and-tasks')),
    itemType: sanitizeText(source.itemType, sanitizeText(fallback.itemType, 'tasks')),
    visibility: sanitizeText(source.visibility, sanitizeText(fallback.visibility, 'private')),
    layout: sanitizeText(source.layout, sanitizeText(fallback.layout, 'kanban')),
    groups: normalizeViewGroups(source.groups, fallback.groups),
    sort: normalizeViewSort(source.sort, fallback.sort),
    dateRange: normalizeRelativeWindow(source.dateRange, fallback.dateRange),
    columns: normalizeViewColumns(source.columns, fallback.columns),
    filters: normalizeViewFilters(source.filters, fallback.filters)
  };
}

export function createDefaultShellTheme() {
  return {
    mode: DEFAULT_THEME_MODE,
    dataTheme: DEFAULT_THEME_MODE,
    accent: DEFAULT_ACCENT,
    density: DEFAULT_DENSITY,
    useSystem: false
  };
}

export function createDefaultSavedViews() {
  return DEFAULT_SAVED_VIEWS.map((view) => ({
    ...view,
    groupBy: cloneGroupBy(view.groupBy),
    sort: { ...view.sort }
  }));
}

export function createDefaultShellState() {
  const tabs = createDefaultTabs();
  const savedViews = createDefaultSavedViews();
  const activeTab = tabs.find((tab) => tab.active) || tabs[0] || null;

  return {
    theme: createDefaultShellTheme(),
    tabs,
    savedViews,
    activeTabId: activeTab?.id || DEFAULT_TAB_ID,
    activeViewId: activeTab?.itemType === 'view'
      ? sanitizeText(activeTab.itemId, DEFAULT_VIEW_ID)
      : sanitizeText(activeTab?.itemId, 'calendar')
  };
}

function getShellRouteDefinition(routeId = '') {
  const normalizedId = sanitizeText(routeId);
  return SHELL_ROUTE_DEFINITIONS[normalizedId] || null;
}

export function normalizeShellTheme(raw = {}) {
  const theme = isPlainObject(raw) ? raw : {};
  const mode = sanitizeText(theme.mode, DEFAULT_THEME_MODE).toLowerCase();
  const normalizedMode = ALLOWED_THEME_MODES.has(mode) ? mode : DEFAULT_THEME_MODE;

  return {
    mode: normalizedMode,
    dataTheme: sanitizeText(theme.dataTheme, normalizedMode).toLowerCase() === 'light' ? 'light' : normalizedMode,
    accent: sanitizeText(theme.accent, DEFAULT_ACCENT),
    density: sanitizeText(theme.density, DEFAULT_DENSITY),
    useSystem: Boolean(theme.useSystem)
  };
}

function normalizeSavedView(raw = {}, fallback = {}) {
  if (!isPlainObject(raw)) {
    return null;
  }

  const id = sanitizeText(raw.id, sanitizeText(fallback.id));
  const name = sanitizeText(raw.name, sanitizeText(fallback.name));
  if (!id || !name) {
    return null;
  }

  const fallbackDefinition = isPlainObject(fallback.definition)
    ? fallback.definition
    : createDefaultViewDefinition(id);
  const fallbackVisibility = fallbackDefinition.visibility || (fallback.isPrivate ? 'private' : 'team');
  const legacyVisibility = raw.isPrivate == null
    ? fallbackVisibility
    : (raw.isPrivate ? 'private' : 'team');
  const legacyDefinition = {
    type: sanitizeText(raw.type, sanitizeText(fallback.type, 'projects-and-tasks')),
    itemType: sanitizeText(raw.itemType, sanitizeText(fallback.itemType, id === 'view_project_timelines' ? 'projects' : 'tasks')),
    visibility: sanitizeText(legacyVisibility, sanitizeText(fallbackDefinition.visibility, 'private')),
    layout: sanitizeText(raw.layout, sanitizeText(fallback.layout, 'kanban')),
    groups: cloneGroupBy(raw.groupBy || fallback.groupBy).map((group) => ({
      field: group.key,
      by: group.by
    })),
    sort: normalizeViewSort(raw.sort, fallback.sort),
    dateRange: null,
    columns: Array.isArray(raw.columns) ? raw.columns : fallbackDefinition.columns,
    filters: isPlainObject(raw.filters) ? raw.filters : fallbackDefinition.filters
  };
  const definition = normalizeViewDefinition(raw.definition || legacyDefinition, fallbackDefinition);
  const primarySort = definition.sort[0] || { field: 'estimatedCompletionTime', direction: 'asc' };
  const groupBy = definition.groups.map((group) => ({
    key: group.field,
    by: group.by
  }));
  const isPrivate = definition.visibility === 'private';
  const sectionFallback = isPrivate ? 'views' : 'team';

  return {
    id,
    name,
    route: sanitizeText(raw.route, sanitizeText(fallback.route, `/web/views/${id}`)),
    type: definition.type,
    itemType: definition.itemType,
    layout: definition.layout,
    isPrivate,
    section: sanitizeText(raw.section, sanitizeText(fallback.section, sectionFallback)),
    groupBy,
    sort: {
      field: primarySort.field,
      direction: primarySort.direction
    },
    definitionVersion: Number.isInteger(raw.definitionVersion) ? raw.definitionVersion : Number.isInteger(fallback.definitionVersion) ? fallback.definitionVersion : 3,
    definition
  };
}

export function normalizeSavedViews(rawViews = []) {
  const fallbackViews = createDefaultSavedViews();
  const candidates = Array.isArray(rawViews) && rawViews.length > 0 ? rawViews : fallbackViews;
  const seen = new Set();

  const normalized = candidates
    .map((view, index) => normalizeSavedView(view, fallbackViews[index] || fallbackViews[0]))
    .filter(Boolean)
    .filter((view) => {
      if (seen.has(view.id)) {
        return false;
      }
      seen.add(view.id);
      return true;
    });

  if (normalized.length) {
    return normalized;
  }

  return fallbackViews;
}

function normalizeShellTab(raw = {}, fallback = {}) {
  if (!isPlainObject(raw)) {
    return null;
  }

  const id = sanitizeText(raw.id, sanitizeText(fallback.id));
  const title = sanitizeText(raw.title, sanitizeText(fallback.title));
  if (!id || !title) {
    return null;
  }

  return {
    id,
    title,
    route: sanitizeText(raw.route, sanitizeText(fallback.route, '/web/calendar')),
    itemType: sanitizeText(raw.itemType, sanitizeText(fallback.itemType, 'route')),
    itemId: sanitizeText(raw.itemId, sanitizeText(fallback.itemId, id)),
    closable: raw.closable == null ? Boolean(fallback.closable) : Boolean(raw.closable),
    active: Boolean(raw.active)
  };
}

export function normalizeShellTabs(rawTabs = []) {
  const fallbackTabs = createDefaultTabs();
  const candidates = Array.isArray(rawTabs) && rawTabs.length > 0 ? rawTabs : fallbackTabs;
  const seen = new Set();

  const normalized = candidates
    .map((tab, index) => normalizeShellTab(tab, fallbackTabs[index] || fallbackTabs[0]))
    .filter(Boolean)
    .filter((tab) => {
      if (seen.has(tab.id)) {
        return false;
      }
      seen.add(tab.id);
      return true;
    });

  const tabs = normalized.length ? normalized : fallbackTabs;
  const hasActive = tabs.some((tab) => tab.active);

  return tabs.map((tab, index) => ({
    ...tab,
    active: hasActive ? tab.active : index === 0
  }));
}

function getAgendaEntryTime(entry) {
  return entry.startAt || entry.sortAt || entry.dueAt || null;
}

function sortAgendaEntries(left, right) {
  const leftValue = parseDate(getAgendaEntryTime(left))?.valueOf() ?? Number.MAX_SAFE_INTEGER;
  const rightValue = parseDate(getAgendaEntryTime(right))?.valueOf() ?? Number.MAX_SAFE_INTEGER;

  if (leftValue !== rightValue) {
    return leftValue - rightValue;
  }

  return left.title.localeCompare(right.title);
}

function getTaskTimeValue(task = {}, key = 'startAt') {
  const parsed = parseDate(task?.[key]);
  return parsed?.valueOf() ?? Number.MAX_SAFE_INTEGER;
}

function getComparableValue(task = {}, field = 'scheduledStart') {
  switch (field) {
    case 'deadline':
    case 'dueDate':
      return parseDate(task.dueAt || task.dueDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
    case 'estimatedCompletionTime':
      return parseDate(task.estimatedCompletionTime || task.scheduledEnd)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
    case 'scheduledStart':
      return parseDate(task.scheduledStart || task.startAt)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
    case 'scheduledDate':
      return parseDate(task.estimatedCompletionTime || task.scheduledStart || task.startAt)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
    case 'startDate':
      return parseDate(task.scheduledStart || task.startAt || task.startOn || task.dueAt)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
    case 'workspace':
      return sanitizeText(task.workspaceName, sanitizeText(task.workspaceId));
    case 'user':
      return sanitizeText(task.assigneeUserId);
    case 'project':
      return sanitizeText(task.projectName, sanitizeText(task.projectId));
    case 'priorityLevel':
      return sanitizeText(task.priorityLevel);
    default:
      return sanitizeText(task[field]);
  }
}

function compareGenericValues(left, right, direction = 'asc') {
  if (typeof left === 'number' || typeof right === 'number') {
    const normalizedLeft = typeof left === 'number' ? left : Number.MAX_SAFE_INTEGER;
    const normalizedRight = typeof right === 'number' ? right : Number.MAX_SAFE_INTEGER;
    return direction === 'desc' ? normalizedRight - normalizedLeft : normalizedLeft - normalizedRight;
  }

  const leftValue = sanitizeText(left);
  const rightValue = sanitizeText(right);
  return direction === 'desc'
    ? rightValue.localeCompare(leftValue)
    : leftValue.localeCompare(rightValue);
}

function compareByViewDefinition(left = {}, right = {}, meta = {}) {
  const sortRules = Array.isArray(meta.sortRules) && meta.sortRules.length
    ? meta.sortRules
    : [{ field: meta.sort?.field || 'scheduledStart', direction: meta.sort?.direction || 'asc' }];

  for (const rule of sortRules) {
    const comparison = compareGenericValues(
      getComparableValue(left, rule.field),
      getComparableValue(right, rule.field),
      rule.direction
    );
    if (comparison !== 0) {
      return comparison;
    }
  }

  const leftDone = left.status === 'done';
  const rightDone = right.status === 'done';
  if (leftDone !== rightDone) {
    return leftDone ? 1 : -1;
  }

  const projectOrder = sanitizeText(left.projectId).localeCompare(sanitizeText(right.projectId));
  if (projectOrder !== 0) {
    return projectOrder;
  }

  return sanitizeText(left.title).localeCompare(sanitizeText(right.title));
}

function resolveShellScopeId(shellState = {}) {
  if (shellState?.activeTab?.itemType === 'route') {
    return sanitizeText(shellState.activeTab.itemId, 'calendar');
  }

  if (sanitizeText(shellState?.activeViewId, '') === 'calendar') {
    return sanitizeText(shellState?.activeTab?.itemId, 'calendar');
  }

  if (shellState?.activeView?.id) {
    return sanitizeText(shellState.activeView.id, DEFAULT_VIEW_ID);
  }

  if (shellState?.activeTab?.itemType === 'route') {
    return sanitizeText(shellState.activeTab.itemId, 'calendar');
  }

  return sanitizeText(shellState?.activeView?.id, sanitizeText(shellState?.activeTab?.itemId, DEFAULT_VIEW_ID));
}

function createRouteViewDefinition(scopeId = '', base = {}) {
  const itemType = scopeId === 'workspace'
    ? 'status'
    : scopeId === 'inbox'
      ? 'inbox'
      : scopeId === 'agenda'
        ? 'agenda'
        : 'tasks';

  return {
    type: 'route',
    itemType,
    visibility: 'private',
    layout: sanitizeText(base.layout, 'kanban'),
    groups: [],
    sort: [],
    dateRange: null,
    columns: [],
    filters: {
      tasks: {
        assignee: null,
        completed: 'include',
        canceled: 'include',
        archived: 'exclude',
        isAutoScheduled: null,
        typeIn: [],
        dueDate: null,
        estimatedCompletionTime: null
      },
      projects: {
        completed: 'include',
        archived: 'exclude'
      }
    }
  };
}

function mapTaskToAgendaEntry(task = {}, projectsById = new Map()) {
  if (!isPlainObject(task) || task.status === 'done' || task.status === 'deleted') {
    return null;
  }

  const start = toIsoString(task.startAt);
  const due = toIsoString(task.dueAt);
  const end = start
    ? new Date(new Date(start).valueOf() + (Number(task.durationMinutes) || 30) * 60 * 1000).toISOString()
    : null;
  const project = projectsById.get(task.projectId);

  return {
    id: `task:${sanitizeText(task.id)}`,
    entityId: sanitizeText(task.id),
    sourceType: 'task',
    title: sanitizeText(task.title, 'Untitled task'),
    subtitle: sanitizeText(project?.name, sanitizeText(task.projectName, 'Task')),
    status: sanitizeText(task.status, 'todo'),
    startAt: start,
    endAt: end,
    dueAt: due,
    sortAt: start || due,
    projectId: sanitizeText(task.projectId) || null
  };
}

function mapCalendarEventToAgendaEntry(event = {}) {
  if (!isPlainObject(event)) {
    return null;
  }

  const id = sanitizeText(event.id);
  if (!id) {
    return null;
  }

  return {
    id: `calendar:${id}`,
    entityId: id,
    sourceType: 'calendar',
    title: sanitizeText(event.title, 'Calendar event'),
    subtitle: sanitizeText(event.calendarId, sanitizeText(event.provider, 'Calendar')),
    status: sanitizeText(event.status, 'busy'),
    startAt: toIsoString(event.startAt),
    endAt: toIsoString(event.endAt),
    dueAt: null,
    sortAt: toIsoString(event.startAt),
    projectId: null
  };
}

export function buildAgendaSnapshot(tasks = [], options = {}) {
  const reference = parseDate(options.now) || new Date();
  const currentTime = reference.valueOf();
  const projects = Array.isArray(options.projects) ? options.projects : [];
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const overlayEvents = Array.isArray(options.calendarOverlay?.importedEvents)
    ? options.calendarOverlay.importedEvents
    : [];

  const entries = []
    .concat(Array.isArray(tasks) ? tasks.map((task) => mapTaskToAgendaEntry(task, projectsById)) : [])
    .concat(overlayEvents.map((event) => mapCalendarEventToAgendaEntry(event)))
    .filter(Boolean);

  const ongoing = [];
  const upcoming = [];
  const timeless = [];

  entries.forEach((entry) => {
    const startAt = parseDate(entry.startAt);
    const endAt = parseDate(entry.endAt);
    const sortAt = parseDate(entry.sortAt);

    if (startAt && endAt && startAt.valueOf() <= currentTime && endAt.valueOf() > currentTime) {
      ongoing.push(entry);
      return;
    }

    if (sortAt && sortAt.valueOf() >= currentTime) {
      upcoming.push(entry);
      return;
    }

    if (!entry.startAt && !entry.dueAt) {
      timeless.push(entry);
    }
  });

  ongoing.sort(sortAgendaEntries);
  upcoming.sort(sortAgendaEntries);
  timeless.sort((left, right) => left.title.localeCompare(right.title));

  return {
    generatedAt: reference.toISOString(),
    ongoing,
    upcoming,
    timeless,
    counts: {
      ongoing: ongoing.length,
      upcoming: upcoming.length,
      timeless: timeless.length,
      total: ongoing.length + upcoming.length + timeless.length
    }
  };
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isRelativeDateMatch(rawValue, rule, now = new Date()) {
  if (!rule || !rawValue) {
    return true;
  }

  const value = parseDate(rawValue);
  if (!value) {
    return false;
  }

  if (rule.mode === 'on-or-after' && rule.value === 'now') {
    return value.valueOf() >= now.valueOf();
  }

  if (rule.mode === 'defined-relative' && rule.value === 'next-7-days') {
    const start = startOfDay(now).valueOf();
    const end = start + 8 * 24 * 60 * 60 * 1000;
    const candidate = value.valueOf();
    return candidate >= start && candidate < end;
  }

  return true;
}

function matchesTaskAssignee(task = {}, assignee = null, currentUserId = DEFAULT_CURRENT_USER_ID) {
  if (!assignee) {
    return true;
  }

  if (assignee === '@me') {
    return sanitizeText(task.assigneeUserId) === sanitizeText(currentUserId);
  }

  return sanitizeText(task.assigneeUserId) === sanitizeText(assignee);
}

function matchesTaskFilters(task = {}, filters = {}, now = new Date(), currentUserId = DEFAULT_CURRENT_USER_ID) {
  if (!isPlainObject(task)) {
    return false;
  }

  if (sanitizeText(task.status) === 'deleted') {
    return false;
  }

  if (!matchesTaskAssignee(task, filters.assignee, currentUserId)) {
    return false;
  }

  if (filters.completed === 'exclude' && task.status === 'done') {
    return false;
  }

  if (filters.archived === 'exclude' && task.archivedTime) {
    return false;
  }

  if (typeof filters.isAutoScheduled === 'boolean' && Boolean(task.isAutoScheduled) !== filters.isAutoScheduled) {
    return false;
  }

  if (Array.isArray(filters.typeIn) && filters.typeIn.length > 0) {
    const taskType = sanitizeText(task.type, 'NORMAL').toUpperCase();
    if (!filters.typeIn.includes(taskType)) {
      return false;
    }
  }

  if (filters.dueDate && !isRelativeDateMatch(task.dueAt || task.dueDate, filters.dueDate, now)) {
    return false;
  }

  if (filters.estimatedCompletionTime && !isRelativeDateMatch(task.estimatedCompletionTime, filters.estimatedCompletionTime, now)) {
    return false;
  }

  return true;
}

function buildViewFilterSummary(definition = {}) {
  const summary = [];
  const taskFilters = definition?.filters?.tasks || {};

  if (definition.visibility === 'private') {
    summary.push('Private');
  } else {
    summary.push('Shared');
  }

  if (definition.itemType === 'projects') {
    summary.push('Projects');
  } else {
    summary.push('Tasks');
  }

  if (taskFilters.assignee === '@me') {
    summary.push('Assigned to me');
  }

  if (taskFilters.isAutoScheduled === true) {
    summary.push('Auto-scheduled');
  }

  if (taskFilters.completed === 'exclude') {
    summary.push('Hide completed');
  }

  if (taskFilters.dueDate?.value === 'now') {
    summary.push('Upcoming deadlines');
  }

  if (taskFilters.estimatedCompletionTime?.value === 'next-7-days') {
    summary.push('Next 7 days');
  }

  return summary;
}

export function buildSidebarSections(input = {}) {
  const savedViews = normalizeSavedViews(input.savedViews);
  const projects = Array.isArray(input.projects) ? input.projects : [];
  const privateViews = savedViews.filter((view) => view.definition?.visibility === 'private' || sanitizeText(view.section, 'views') === 'views');
  const teamViews = savedViews.filter((view) => !privateViews.some((candidate) => candidate.id === view.id));
  const sections = [
    {
      id: 'workspace',
      title: 'Workspace',
      items: Object.values(SHELL_ROUTE_DEFINITIONS).map((route) => ({
        id: `nav_${route.id}`,
        label: route.title,
        kind: 'route',
        route: route.route,
        routeId: route.id
      }))
    }
  ];

  if (privateViews.length) {
    sections.push({
      id: 'my-views',
      title: VIEW_SECTION_TITLES.views,
      items: privateViews.map((view) => ({
        id: view.id,
        label: view.name,
        kind: 'view',
        route: view.route,
        layout: view.layout,
        viewId: view.id,
        section: view.section
      }))
    });
  }

  if (teamViews.length) {
    sections.push({
      id: 'team-views',
      title: VIEW_SECTION_TITLES.team,
      items: teamViews.map((view) => ({
        id: view.id,
        label: view.name,
        kind: 'view',
        route: view.route,
        layout: view.layout,
        viewId: view.id,
        section: view.section
      }))
    });
  }

  sections.push({
    id: 'projects',
    title: 'Projects',
    items: projects
      .filter((project) => !project.archived)
      .map((project) => ({
        id: project.id,
        label: sanitizeText(project.name, 'Untitled project'),
        kind: 'project',
        color: sanitizeText(project.color, '#3b82f6'),
        projectId: project.id
      }))
  });

  return sections;
}

export function getSavedViewById(savedViews = [], viewId = DEFAULT_VIEW_ID) {
  const normalized = normalizeSavedViews(savedViews);
  return normalized.find((view) => view.id === viewId) || normalized[0] || null;
}

export function getActiveShellTab(tabs = [], activeTabId = '') {
  const normalized = normalizeShellTabs(tabs);
  return normalized.find((tab) => tab.id === activeTabId) || normalized.find((tab) => tab.active) || normalized[0] || null;
}

export function deriveShellStateSnapshot(appData = {}, options = {}) {
  const rawShell = isPlainObject(appData.shell) ? appData.shell : {};
  const savedViews = normalizeSavedViews(rawShell.savedViews);
  const tabs = normalizeShellTabs(rawShell.tabs);
  const activeTab = getActiveShellTab(tabs, sanitizeText(rawShell.activeTabId, DEFAULT_TAB_ID));
  const routeScopeId = activeTab?.itemType === 'route'
    ? sanitizeText(activeTab.itemId, 'calendar')
    : '';
  const explicitViewId = activeTab?.itemType === 'route'
    ? routeScopeId
    : sanitizeText(
      rawShell.activeViewId,
      activeTab?.itemType === 'view' ? activeTab.itemId : DEFAULT_VIEW_ID
    );
  const isRouteScope = activeTab?.itemType === 'route';
  const activeView = isRouteScope ? null : getSavedViewById(savedViews, explicitViewId || DEFAULT_VIEW_ID);
  const theme = normalizeShellTheme(rawShell.theme);
  const referenceNow = toIsoString(options.now || rawShell.agenda?.generatedAt) || toIsoString(new Date());
  const sidebarSections = buildSidebarSections({
    savedViews,
    projects: Array.isArray(appData.projects) ? appData.projects : []
  });
  // Motion persists agenda snapshots in desktop state; for now we derive them from current tasks and calendar data.
  const agenda = buildAgendaSnapshot(Array.isArray(appData.tasks) ? appData.tasks : [], {
    projects: Array.isArray(appData.projects) ? appData.projects : [],
    calendarOverlay: appData.calendarOverlay || {},
    now: referenceNow
  });

  return {
    theme,
    tabs,
    activeTabId: activeTab?.id || DEFAULT_TAB_ID,
    activeTab,
    savedViews,
    activeViewId: isRouteScope ? routeScopeId : activeView?.id || DEFAULT_VIEW_ID,
    activeView,
    referenceNow,
    sidebarSections,
    agenda
  };
}

export function getShellViewMeta(shellState = {}) {
  const scopeId = resolveShellScopeId(shellState);
  const fallback = SHELL_VIEW_META.view_my_tasks;
  const activeTab = shellState?.activeTab || null;
  const activeView = shellState?.activeView || null;
  const base = SHELL_VIEW_META[scopeId] || fallback;
  const isRouteScope = activeTab?.itemType === 'route' && !activeView;
  const fallbackDefinition = isRouteScope
    ? createRouteViewDefinition(scopeId, base)
    : createDefaultViewDefinition(scopeId);
  const definition = isRouteScope
    ? fallbackDefinition
    : normalizeViewDefinition(activeView?.definition, fallbackDefinition);
  const primarySort = definition.sort[0] || { field: 'estimatedCompletionTime', direction: 'asc' };
  const groups = definition.groups.map((group) => ({
    key: group.field,
    by: group.by
  }));

  return {
    ...base,
    id: scopeId,
    title: activeTab?.itemType === 'route'
      ? sanitizeText(activeTab.title, base.title)
      : sanitizeText(activeView?.name, sanitizeText(activeTab?.title, base.title)),
    layout: sanitizeText(definition.layout, sanitizeText(base.layout, 'kanban')),
    route: sanitizeText(activeTab?.route, sanitizeText(activeView?.route, '/web/calendar')),
    itemType: sanitizeText(definition.itemType, 'tasks'),
    viewType: sanitizeText(definition.type, 'projects-and-tasks'),
    visibility: sanitizeText(definition.visibility, activeView?.isPrivate ? 'private' : 'team'),
    columns: normalizeViewColumns(definition.columns, fallbackDefinition.columns),
    definitionVersion: Number.isInteger(activeView?.definitionVersion) ? activeView.definitionVersion : 3,
    groupBy: groups,
    filterSummary: isRouteScope ? [] : buildViewFilterSummary(definition),
    sortRules: definition.sort,
    dateRange: definition.dateRange,
    filters: definition.filters,
    sort: {
      field: primarySort.field,
      direction: primarySort.direction
    },
    definition
  };
}

export function selectTasksForShellView(tasks = [], shellState = {}, options = {}) {
  const meta = getShellViewMeta(shellState);
  const referenceNow = parseDate(options.now || shellState.referenceNow || shellState.agenda?.generatedAt) || new Date();
  const currentUserId = sanitizeText(options.currentUserId, DEFAULT_CURRENT_USER_ID);
  const candidates = Array.isArray(tasks)
    ? tasks.filter((task) => isPlainObject(task) && sanitizeText(task.status) !== 'deleted')
    : [];

  if (meta.id === 'calendar') {
    return candidates.sort((left, right) => compareByViewDefinition(left, right, {
      sortRules: [{ field: 'scheduledStart', direction: 'asc' }]
    }));
  }

  const filtered = candidates
    .filter((task) => matchesTaskFilters(task, meta.filters?.tasks || {}, referenceNow, currentUserId))
    .filter((task) => {
      if (meta.itemType === 'projects') {
        return Boolean(task.projectId && task.projectId !== 'inbox');
      }
      return true;
    });

  return filtered.sort((left, right) => compareByViewDefinition(left, right, meta));
}

export function activateShellTab(shell = {}, tabId = '') {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const activeTab = tabs.find((tab) => tab.id === tabId) || tabs.find((tab) => tab.active) || tabs[0] || null;
  const nextTabs = tabs.map((tab) => ({
    ...tab,
    active: tab.id === activeTab?.id
  }));

  return {
    ...shell,
    theme: normalizeShellTheme(shell.theme),
    tabs: nextTabs,
    savedViews,
    activeTabId: activeTab?.id || DEFAULT_TAB_ID,
    activeViewId: activeTab?.itemType === 'view'
      ? sanitizeText(activeTab.itemId, DEFAULT_VIEW_ID)
      : sanitizeText(activeTab?.itemId, 'calendar')
  };
}

function createShellTabForView(view = {}, tabs = []) {
  const viewId = sanitizeText(view.id);
  if (!viewId) {
    return null;
  }

  const existingIds = new Set((Array.isArray(tabs) ? tabs : []).map((tab) => sanitizeText(tab.id)));
  const baseId = `tab_${viewId.replace(/^view_/, '') || 'view'}`;
  let nextId = baseId;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}_${suffix}`;
    suffix += 1;
  }

  return {
    id: nextId,
    title: sanitizeText(view.name, 'View'),
    route: sanitizeText(view.route, '/web/calendar'),
    itemType: 'view',
    itemId: viewId,
    closable: true,
    active: false
  };
}

function createShellTabForRoute(routeId = '', tabs = []) {
  const route = getShellRouteDefinition(routeId);
  if (!route) {
    return null;
  }

  const existingIds = new Set((Array.isArray(tabs) ? tabs : []).map((tab) => sanitizeText(tab.id)));
  const baseId = sanitizeText(route.tabId, `tab_${route.id}`);
  let nextId = baseId;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}_${suffix}`;
    suffix += 1;
  }

  return {
    id: nextId,
    title: route.title,
    route: route.route,
    itemType: 'route',
    itemId: route.id,
    closable: route.closable,
    active: false
  };
}

function getShellTabCandidate(savedViews = [], tabs = [], requestedViewId = '') {
  const normalizedViews = normalizeSavedViews(savedViews);
  const normalizedTabs = normalizeShellTabs(tabs);
  const requestedId = sanitizeText(requestedViewId);
  const openViewIds = new Set(
    normalizedTabs
      .filter((tab) => tab.itemType === 'view')
      .map((tab) => sanitizeText(tab.itemId))
      .filter(Boolean)
  );

  if (requestedId) {
    return getSavedViewById(normalizedViews, requestedId);
  }

  return normalizedViews.find((view) => !openViewIds.has(view.id)) || normalizedViews[0] || null;
}

export function activateShellView(shell = {}, viewId = '') {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const activeView = getSavedViewById(savedViews, viewId);
  const matchingTab = tabs.find((tab) => tab.itemType === 'view' && tab.itemId === activeView?.id) || null;
  const insertedTab = !matchingTab && activeView
    ? createShellTabForView(activeView, tabs)
    : null;
  const nextTabs = (insertedTab ? tabs.concat(insertedTab) : tabs).map((tab) => ({
    ...tab,
    active: (matchingTab ? tab.id === matchingTab.id : tab.id === insertedTab?.id) || (!matchingTab && !insertedTab && tab.active)
  }));
  const activeTab = nextTabs.find((tab) => tab.active) || matchingTab || insertedTab || tabs.find((tab) => tab.active) || tabs[0] || null;

  return {
    ...shell,
    theme: normalizeShellTheme(shell.theme),
    tabs: nextTabs,
    savedViews,
    activeTabId: activeTab?.id || sanitizeText(shell.activeTabId, DEFAULT_TAB_ID),
    activeViewId: activeView?.id || DEFAULT_VIEW_ID
  };
}

export function activateShellRoute(shell = {}, routeId = '') {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const route = getShellRouteDefinition(routeId);
  if (!route) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: getActiveShellTab(tabs, shell.activeTabId)?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  const matchingTab = tabs.find((tab) => tab.itemType === 'route' && tab.itemId === route.id) || null;
  const insertedTab = !matchingTab ? createShellTabForRoute(route.id, tabs) : null;
  const nextTabs = (insertedTab ? tabs.concat(insertedTab) : tabs).map((tab) => ({
    ...tab,
    active: matchingTab ? tab.id === matchingTab.id : tab.id === insertedTab?.id
  }));
  const activeTab = nextTabs.find((tab) => tab.active) || matchingTab || insertedTab || tabs[0] || null;

  return {
    ...shell,
    theme: normalizeShellTheme(shell.theme),
    tabs: nextTabs,
    savedViews,
    activeTabId: activeTab?.id || DEFAULT_TAB_ID,
    activeViewId: route.id
  };
}

export function addShellViewTab(shell = {}, viewId = '') {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const candidateView = getShellTabCandidate(savedViews, tabs, viewId);
  if (!candidateView) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: getActiveShellTab(tabs, shell.activeTabId)?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  const existingTab = tabs.find((tab) => tab.itemType === 'view' && tab.itemId === candidateView.id);
  if (existingTab) {
    return activateShellTab({
      ...shell,
      tabs,
      savedViews
    }, existingTab.id);
  }

  const createdTab = createShellTabForView(candidateView, tabs);
  const nextTabs = tabs
    .map((tab) => ({
      ...tab,
      active: false
    }))
    .concat(createdTab ? [{ ...createdTab, active: true }] : []);

  return {
    ...shell,
    theme: normalizeShellTheme(shell.theme),
    tabs: nextTabs,
    savedViews,
    activeTabId: createdTab?.id || DEFAULT_TAB_ID,
    activeViewId: candidateView.id
  };
}

export function moveShellTab(shell = {}, tabId = '', toIndex = 0) {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const sourceIndex = tabs.findIndex((tab) => tab.id === tabId);
  if (sourceIndex < 0 || tabs.length <= 1) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: getActiveShellTab(tabs, shell.activeTabId)?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  const targetIndex = Math.max(0, Math.min(tabs.length - 1, Number.isFinite(toIndex) ? Math.trunc(toIndex) : sourceIndex));
  if (targetIndex === sourceIndex) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: getActiveShellTab(tabs, shell.activeTabId)?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  const reordered = tabs.slice();
  const [movedTab] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, movedTab);

  return {
    ...shell,
    theme: normalizeShellTheme(shell.theme),
    tabs: reordered.map((tab) => ({ ...tab })),
    savedViews,
    activeTabId: getActiveShellTab(reordered, shell.activeTabId)?.id || DEFAULT_TAB_ID,
    activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
  };
}

export function removeShellTab(shell = {}, tabId = '') {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const sourceIndex = tabs.findIndex((tab) => tab.id === tabId);
  const targetTab = sourceIndex >= 0 ? tabs[sourceIndex] : null;
  if (!targetTab || !targetTab.closable || tabs.length <= 1) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: getActiveShellTab(tabs, shell.activeTabId)?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  const nextTabsBase = tabs.filter((tab) => tab.id !== tabId);
  const fallbackIndex = Math.max(0, Math.min(sourceIndex, nextTabsBase.length - 1));
  const fallbackTab = nextTabsBase[fallbackIndex] || nextTabsBase[0] || null;
  const nextTabs = nextTabsBase.map((tab) => ({
    ...tab,
    active: tab.id === fallbackTab?.id
  }));

  return {
    ...shell,
    theme: normalizeShellTheme(shell.theme),
    tabs: nextTabs,
    savedViews,
    activeTabId: fallbackTab?.id || DEFAULT_TAB_ID,
    activeViewId: fallbackTab?.itemType === 'view'
      ? sanitizeText(fallbackTab.itemId, DEFAULT_VIEW_ID)
      : sanitizeText(fallbackTab?.itemId, 'calendar')
  };
}

export function navigateShellTabs(shell = {}, direction = 'forward') {
  const tabs = normalizeShellTabs(shell.tabs);
  const savedViews = normalizeSavedViews(shell.savedViews);
  const activeTab = getActiveShellTab(tabs, shell.activeTabId);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab?.id);
  if (activeIndex < 0 || tabs.length <= 1) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: activeTab?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  const delta = sanitizeText(direction, 'forward').toLowerCase() === 'backward' ? -1 : 1;
  const nextIndex = Math.max(0, Math.min(tabs.length - 1, activeIndex + delta));
  if (nextIndex === activeIndex) {
    return {
      ...shell,
      theme: normalizeShellTheme(shell.theme),
      tabs,
      savedViews,
      activeTabId: activeTab?.id || DEFAULT_TAB_ID,
      activeViewId: sanitizeText(shell.activeViewId, DEFAULT_VIEW_ID)
    };
  }

  return activateShellTab({
    ...shell,
    tabs,
    savedViews
  }, tabs[nextIndex].id);
}

export function getShellThemeClassName(theme = {}) {
  const normalized = normalizeShellTheme(theme);
  return `theme-${normalized.mode}`;
}
