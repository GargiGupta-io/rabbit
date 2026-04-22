import { CURRENT_SCHEMA_VERSION } from './contracts.js';
import { buildProjectDomainSeedData } from './projectService.js';
import { buildAgendaSnapshot, buildSidebarSections, createDefaultShellState } from './shellService.js';

export const FIXTURE_NOW = '2026-04-17T12:00:00.000Z';

const FIXTURE_PROJECT_DOMAIN = buildProjectDomainSeedData();
export const FIXTURE_WORKSPACES = FIXTURE_PROJECT_DOMAIN.workspaces;
export const FIXTURE_PROJECT_DEFINITIONS = FIXTURE_PROJECT_DOMAIN.projectDefinitions;
export const FIXTURE_PROJECTS = FIXTURE_PROJECT_DOMAIN.projects;

export const FIXTURE_TASKS_RAW = [
  {
    id: 'f1',
    title: 'Draft weekly plan',
    projectId: 'work',
    projectName: 'Work',
    workspaceId: 'ws_motion_team',
    description: 'Prepare agenda for sprint planning.',
    status: 'todo',
    statusId: 'status_todo',
    priorityLevel: 'HIGH',
    deadlineType: 'HARD',
    dueAt: '2026-04-17T14:00:00.000Z',
    dueDate: '2026-04-17',
    startAt: '2026-04-17T13:30:00.000Z',
    startOn: '2026-04-17',
    scheduledStart: '2026-04-17T13:30:00.000Z',
    scheduledEnd: '2026-04-17T15:30:00.000Z',
    durationMinutes: 120,
    minimumDuration: 30,
    isAutoScheduled: true,
    isBusy: false,
    isFixedTimeTask: false,
    isUnfit: false,
    needsReschedule: false,
    scheduleId: 'schedule_work_default',
    scheduleOverridden: false,
    scheduledStatus: 'ON_TRACK',
    estimatedCompletionTime: '2026-04-17T15:30:00.000Z',
    blockingTaskIds: ['f4'],
    blockedByTaskIds: [],
    stageDefinitionId: 'stage_work_active',
    taskDefinitionId: 'taskdef_weekly_plan',
    assigneeUserId: 'user_gargi',
    createdByUserId: 'user_gargi',
    labelIds: ['planning', 'team'],
    isSyncingWithDefinition: true,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f2',
    title: 'Reply to team',
    projectId: 'inbox',
    projectName: 'Inbox',
    workspaceId: 'ws_private_my_tasks',
    description: 'Clear follow-ups from yesterday.',
    status: 'done',
    statusId: 'status_done',
    priorityLevel: 'MEDIUM',
    deadlineType: 'HARD',
    dueAt: '2026-04-17T09:00:00.000Z',
    dueDate: '2026-04-17',
    startAt: null,
    scheduledStart: '2026-04-17T08:45:00.000Z',
    scheduledEnd: '2026-04-17T09:00:00.000Z',
    durationMinutes: 15,
    minimumDuration: 15,
    completedTime: '2026-04-17T09:02:00.000Z',
    isAutoScheduled: false,
    isBusy: false,
    isFixedTimeTask: false,
    isUnfit: false,
    needsReschedule: false,
    scheduleId: null,
    scheduleOverridden: false,
    scheduledStatus: null,
    estimatedCompletionTime: '2026-04-17T09:00:00.000Z',
    blockingTaskIds: [],
    blockedByTaskIds: [],
    stageDefinitionId: 'stage_inbox_done',
    taskDefinitionId: 'taskdef_reply_team',
    assigneeUserId: 'user_gargi',
    createdByUserId: 'user_gargi',
    labelIds: ['inbox', 'follow-up'],
    isSyncingWithDefinition: false,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f3',
    title: 'Design review',
    projectId: 'personal',
    projectName: 'Personal',
    workspaceId: 'ws_private_my_tasks',
    status: 'todo',
    statusId: 'status_todo',
    priorityLevel: 'ASAP',
    deadlineType: 'HARD',
    dueAt: '2026-04-16T17:00:00.000Z',
    dueDate: '2026-04-16',
    startOn: '2026-04-16',
    durationMinutes: 30,
    minimumDuration: 15,
    isAutoScheduled: true,
    isBusy: false,
    isFixedTimeTask: false,
    isUnfit: false,
    needsReschedule: true,
    scheduleId: 'schedule_personal_default',
    scheduleOverridden: false,
    scheduledStatus: 'PAST_DUE',
    estimatedCompletionTime: null,
    blockingTaskIds: [],
    blockedByTaskIds: ['f4'],
    stageDefinitionId: 'stage_personal_review',
    taskDefinitionId: 'taskdef_design_review',
    assigneeUserId: 'user_gargi',
    createdByUserId: 'user_gargi',
    labelIds: ['design'],
    isSyncingWithDefinition: true,
    recurrence: { pattern: 'weekly', interval: 1 }
  },
  {
    id: 'f4',
    title: 'Overlapping call',
    projectId: 'work',
    projectName: 'Work',
    workspaceId: 'ws_motion_team',
    status: 'todo',
    statusId: 'status_todo',
    priorityLevel: 'HIGH',
    deadlineType: 'SOFT',
    startAt: '2026-04-17T13:00:00.000Z',
    dueAt: '2026-04-17T13:45:00.000Z',
    dueDate: '2026-04-17',
    startOn: '2026-04-17',
    scheduledStart: '2026-04-17T13:00:00.000Z',
    scheduledEnd: '2026-04-17T13:45:00.000Z',
    durationMinutes: 45,
    minimumDuration: 30,
    isAutoScheduled: false,
    isBusy: true,
    isFixedTimeTask: true,
    isUnfit: false,
    needsReschedule: false,
    scheduleId: 'schedule_work_meetings',
    scheduleOverridden: true,
    scheduledStatus: 'ON_TRACK',
    estimatedCompletionTime: '2026-04-17T13:45:00.000Z',
    blockingTaskIds: ['f3'],
    blockedByTaskIds: ['f1'],
    stageDefinitionId: 'stage_work_meetings',
    taskDefinitionId: 'taskdef_overlap_call',
    assigneeUserId: 'user_gargi',
    createdByUserId: 'user_gargi',
    labelIds: ['meetings'],
    isSyncingWithDefinition: false,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f5',
    title: 'No-date notes',
    projectId: 'inbox',
    projectName: 'Inbox',
    workspaceId: 'ws_private_my_tasks',
    status: 'todo',
    statusId: 'status_todo',
    priorityLevel: 'LOW',
    deadlineType: 'NONE',
    durationMinutes: 30,
    minimumDuration: null,
    isAutoScheduled: false,
    isBusy: false,
    isFixedTimeTask: false,
    isUnfit: false,
    needsReschedule: false,
    scheduleId: null,
    scheduleOverridden: false,
    scheduledStatus: null,
    estimatedCompletionTime: null,
    blockingTaskIds: [],
    blockedByTaskIds: [],
    stageDefinitionId: null,
    taskDefinitionId: null,
    assigneeUserId: 'user_gargi',
    createdByUserId: 'user_gargi',
    labelIds: ['notes'],
    isSyncingWithDefinition: false,
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

function cloneTaskDefinition(task = {}) {
  return {
    ...task,
    blockedByTaskIds: Array.isArray(task.blockedByTaskIds) ? task.blockedByTaskIds.slice() : [],
    labelIds: Array.isArray(task.labelIds) ? task.labelIds.slice() : [],
    customFieldValues: { ...(task.customFieldValues || {}) },
    startRelativeInterval: task.startRelativeInterval
      ? {
          ...task.startRelativeInterval,
          duration: { ...(task.startRelativeInterval.duration || {}) }
        }
      : null,
    dueRelativeInterval: task.dueRelativeInterval
      ? {
          ...task.dueRelativeInterval,
          duration: { ...(task.dueRelativeInterval.duration || {}) }
        }
      : null
  };
}

function cloneProjectDefinitions(projectDefinitions = []) {
  return projectDefinitions.map((definition) => ({
    ...definition,
    labelIds: Array.isArray(definition.labelIds) ? definition.labelIds.slice() : [],
    stageDefinitionReferences: Array.isArray(definition.stageDefinitionReferences)
      ? definition.stageDefinitionReferences.map((reference) => ({ ...reference }))
      : [],
    stages: Array.isArray(definition.stages)
      ? definition.stages.map((stage) => ({
          ...stage,
          duration: { ...(stage.duration || {}) },
          variables: Array.isArray(stage.variables) ? stage.variables.map((entry) => ({ ...entry })) : [],
          tasks: Array.isArray(stage.tasks) ? stage.tasks.map((task) => cloneTaskDefinition(task)) : []
        }))
      : [],
    variables: Array.isArray(definition.variables) ? definition.variables.map((entry) => ({ ...entry })) : [],
    customFieldValues: { ...(definition.customFieldValues || {}) }
  }));
}

function cloneProjectStages(stages = []) {
  return stages.map((stage) => ({ ...stage }));
}

function cloneProjects(projects = []) {
  return projects.map((project) => ({
    ...project,
    labelIds: Array.isArray(project.labelIds) ? project.labelIds.slice() : [],
    variableInstances: Array.isArray(project.variableInstances) ? project.variableInstances.map((entry) => ({ ...entry })) : [],
    customFieldValues: { ...(project.customFieldValues || {}) },
    stages: cloneProjectStages(project.stages || [])
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
  workspaces: FIXTURE_WORKSPACES,
  projectDefinitions: FIXTURE_PROJECT_DEFINITIONS,
  projects: FIXTURE_PROJECTS,
  tasks: FIXTURE_TASKS_RAW,
  calendarOverlay: FIXTURE_CALENDAR_OVERLAY,
  shell: FIXTURE_SHELL_STATE
};

export function getFixtureState() {
  return {
    ...FIXTURE_PAYLOAD,
    workspaces: FIXTURE_WORKSPACES.map((workspace) => ({ ...workspace })),
    projectDefinitions: cloneProjectDefinitions(FIXTURE_PROJECT_DEFINITIONS),
    projects: cloneProjects(FIXTURE_PROJECTS),
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
