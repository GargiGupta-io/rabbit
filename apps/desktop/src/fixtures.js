import { CURRENT_SCHEMA_VERSION } from './contracts.js';
import { buildAgendaSnapshot, buildSidebarSections, createDefaultShellState } from './shellService.js';

export const FIXTURE_NOW = '2026-04-17T12:00:00.000Z';

export const FIXTURE_PROJECTS = [
  { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false },
  { id: 'work', name: 'Work', color: '#10b981', archived: false },
  { id: 'personal', name: 'Personal', color: '#f59e0b', archived: false }
];

export const FIXTURE_TASKS_RAW = [
  {
    id: 'f1',
    title: 'Draft weekly plan',
    projectId: 'work',
    projectName: 'Work',
    description: 'Prepare agenda for sprint planning.',
    status: 'todo',
    dueAt: '2026-04-17T14:00:00.000Z',
    startAt: '2026-04-17T13:30:00.000Z',
    durationMinutes: 120,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f2',
    title: 'Reply to team',
    projectId: 'inbox',
    projectName: 'Inbox',
    description: 'Clear follow-ups from yesterday.',
    status: 'done',
    dueAt: '2026-04-17T09:00:00.000Z',
    startAt: null,
    durationMinutes: 15,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f3',
    title: 'Design review',
    projectId: 'personal',
    projectName: 'Personal',
    status: 'todo',
    dueAt: '2026-04-16T17:00:00.000Z',
    durationMinutes: 30,
    recurrence: { pattern: 'weekly', interval: 1 }
  },
  {
    id: 'f4',
    title: 'Overlapping call',
    projectId: 'work',
    projectName: 'Work',
    status: 'todo',
    startAt: '2026-04-17T13:00:00.000Z',
    dueAt: '2026-04-17T13:45:00.000Z',
    durationMinutes: 45,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f5',
    title: 'No-date notes',
    projectId: 'inbox',
    projectName: 'Inbox',
    status: 'todo',
    durationMinutes: 30,
    recurrence: { pattern: 'none', interval: 1 }
  }
];

export const FIXTURE_CALENDAR_EVENTS_RAW = [
  {
    id: 'cal_evt_1',
    externalId: 'google_evt_1',
    title: 'Customer kickoff',
    provider: 'google',
    calendarId: 'team-primary',
    status: 'busy',
    startAt: '2026-04-17T13:00:00.000Z',
    endAt: '2026-04-17T14:00:00.000Z',
    location: 'Meet',
    notes: 'Primary busy block from calendar'
  },
  {
    id: 'cal_evt_2',
    externalId: 'google_evt_2',
    title: 'Focus block',
    provider: 'google',
    calendarId: 'team-primary',
    status: 'busy',
    startAt: '2026-04-17T15:00:00.000Z',
    endAt: '2026-04-17T16:30:00.000Z'
  },
  {
    id: 'cal_evt_3',
    externalId: 'google_evt_3',
    title: 'Company holiday',
    provider: 'google',
    calendarId: 'company-shared',
    status: 'busy',
    startAt: '2026-04-18T00:00:00.000Z',
    allDay: true
  }
];

export const FIXTURE_CALENDAR_OVERLAY = {
  importedEvents: FIXTURE_CALENDAR_EVENTS_RAW,
  source: {
    provider: 'google',
    accountId: 'acct_team',
    calendarIds: ['team-primary', 'company-shared'],
    syncToken: 'sync_fixture_google'
  },
  refreshedAt: '2026-04-17T12:05:00.000Z',
  permissionStatus: 'granted'
};

function cloneGroupBy(groupBy = []) {
  return groupBy.map((entry) => ({ ...entry }));
}

function cloneSavedViews(savedViews = []) {
  return savedViews.map((view) => ({
    ...view,
    groupBy: cloneGroupBy(view.groupBy || []),
    sort: { ...view.sort }
  }));
}

function cloneSidebarSections(sidebarSections = []) {
  return sidebarSections.map((section) => ({
    ...section,
    items: Array.isArray(section.items) ? section.items.map((item) => ({ ...item })) : []
  }));
}

function cloneAgendaEntries(entries = []) {
  return entries.map((entry) => ({ ...entry }));
}

function cloneAgendaSnapshot(agenda = {}) {
  return {
    generatedAt: agenda.generatedAt || FIXTURE_NOW,
    ongoing: cloneAgendaEntries(agenda.ongoing || []),
    upcoming: cloneAgendaEntries(agenda.upcoming || []),
    timeless: cloneAgendaEntries(agenda.timeless || []),
    counts: {
      ...agenda.counts
    }
  };
}

function createFixtureShellState() {
  const base = createDefaultShellState();

  return {
    ...base,
    theme: {
      ...base.theme,
      mode: 'dark',
      dataTheme: 'dark',
      accent: 'motion',
      density: 'comfortable',
      useSystem: false
    },
    tabs: base.tabs.map((tab) => ({ ...tab })),
    savedViews: cloneSavedViews(base.savedViews),
    activeTabId: 'tab_calendar',
    activeViewId: 'view_my_tasks',
    sidebarSections: buildSidebarSections({
      savedViews: base.savedViews,
      projects: FIXTURE_PROJECTS
    }),
    agenda: buildAgendaSnapshot(FIXTURE_TASKS_RAW, {
      projects: FIXTURE_PROJECTS,
      calendarOverlay: FIXTURE_CALENDAR_OVERLAY,
      now: FIXTURE_NOW
    })
  };
}

export const FIXTURE_SHELL_STATE = createFixtureShellState();

export const FIXTURE_PAYLOAD = {
  version: '1.0.0',
  schemaVersion: CURRENT_SCHEMA_VERSION,
  projects: FIXTURE_PROJECTS,
  tasks: FIXTURE_TASKS_RAW,
  calendarOverlay: FIXTURE_CALENDAR_OVERLAY,
  shell: FIXTURE_SHELL_STATE
};

export function getFixtureState() {
  return {
    ...FIXTURE_PAYLOAD,
    projects: FIXTURE_PROJECTS.map((project) => ({ ...project })),
    tasks: FIXTURE_TASKS_RAW.map((task) => ({ ...task })),
    calendarOverlay: {
      ...FIXTURE_CALENDAR_OVERLAY,
      source: {
        ...FIXTURE_CALENDAR_OVERLAY.source,
        calendarIds: FIXTURE_CALENDAR_OVERLAY.source.calendarIds.slice()
      },
      importedEvents: FIXTURE_CALENDAR_EVENTS_RAW.map((event) => ({ ...event }))
    },
    shell: {
      ...FIXTURE_SHELL_STATE,
      theme: { ...FIXTURE_SHELL_STATE.theme },
      tabs: FIXTURE_SHELL_STATE.tabs.map((tab) => ({ ...tab })),
      savedViews: cloneSavedViews(FIXTURE_SHELL_STATE.savedViews),
      sidebarSections: cloneSidebarSections(FIXTURE_SHELL_STATE.sidebarSections),
      agenda: cloneAgendaSnapshot(FIXTURE_SHELL_STATE.agenda)
    }
  };
}
