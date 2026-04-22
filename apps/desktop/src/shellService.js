const DEFAULT_THEME_MODE = 'dark';
const ALLOWED_THEME_MODES = new Set(['light', 'dark']);
const DEFAULT_ACCENT = 'motion';
const DEFAULT_DENSITY = 'comfortable';
const DEFAULT_TAB_ID = 'tab_calendar';
const DEFAULT_VIEW_ID = 'view_my_tasks';

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
    }
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
    }
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
    }
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
    }
  }
];

function createDefaultTabs() {
  return [
    {
      id: 'tab_calendar',
      title: 'Calendar',
      route: '/web/calendar',
      itemType: 'route',
      itemId: 'calendar',
      closable: false,
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

  return {
    theme: createDefaultShellTheme(),
    tabs,
    savedViews,
    activeTabId: tabs.find((tab) => tab.active)?.id || DEFAULT_TAB_ID,
    activeViewId: DEFAULT_VIEW_ID
  };
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

  return {
    id,
    name,
    route: sanitizeText(raw.route, sanitizeText(fallback.route, `/web/views/${id}`)),
    type: sanitizeText(raw.type, sanitizeText(fallback.type, 'projects-and-tasks')),
    layout: sanitizeText(raw.layout, sanitizeText(fallback.layout, 'kanban')),
    isPrivate: raw.isPrivate == null ? Boolean(fallback.isPrivate) : Boolean(raw.isPrivate),
    section: sanitizeText(raw.section, sanitizeText(fallback.section, 'views')),
    groupBy: cloneGroupBy(raw.groupBy || fallback.groupBy),
    sort: {
      field: sanitizeText(raw.sort?.field, sanitizeText(fallback.sort?.field, 'estimatedCompletionTime')),
      direction: sanitizeText(raw.sort?.direction, sanitizeText(fallback.sort?.direction, 'asc')).toLowerCase() === 'desc' ? 'desc' : 'asc'
    }
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

export function buildSidebarSections(input = {}) {
  const savedViews = normalizeSavedViews(input.savedViews);
  const projects = Array.isArray(input.projects) ? input.projects : [];

  return [
    {
      id: 'workspace',
      title: 'Workspace',
      items: [
        {
          id: 'nav_calendar',
          label: 'Calendar',
          kind: 'route',
          route: '/web/calendar'
        },
        ...savedViews.map((view) => ({
          id: view.id,
          label: view.name,
          kind: 'view',
          route: view.route,
          layout: view.layout,
          viewId: view.id
        }))
      ]
    },
    {
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
    }
  ];
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
  const activeView = getSavedViewById(savedViews, sanitizeText(rawShell.activeViewId, activeTab?.itemType === 'view' ? activeTab.itemId : DEFAULT_VIEW_ID));
  const theme = normalizeShellTheme(rawShell.theme);
  const sidebarSections = buildSidebarSections({
    savedViews,
    projects: Array.isArray(appData.projects) ? appData.projects : []
  });
  // Motion persists agenda snapshots in desktop state; for now we derive them from current tasks and calendar data.
  const agenda = buildAgendaSnapshot(Array.isArray(appData.tasks) ? appData.tasks : [], {
    projects: Array.isArray(appData.projects) ? appData.projects : [],
    calendarOverlay: appData.calendarOverlay || {},
    now: options.now
  });

  return {
    theme,
    tabs,
    activeTabId: activeTab?.id || DEFAULT_TAB_ID,
    activeTab,
    savedViews,
    activeViewId: activeView?.id || DEFAULT_VIEW_ID,
    activeView,
    sidebarSections,
    agenda
  };
}

export function getShellThemeClassName(theme = {}) {
  const normalized = normalizeShellTheme(theme);
  return `theme-${normalized.mode}`;
}
