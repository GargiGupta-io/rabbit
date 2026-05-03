import {
  type CustomFieldFilters,
  type EntityFilterState,
  type ProjectFilter,
  type TaskFilter,
  type WorkspaceFilter,
} from './types'

/** Keep in sync with packages/motion-extension/src/areas/project-management/pages/pm-v3/routes/types.ts */
type PageType =
  | 'team-schedule'
  | 'workspace'
  | 'folder'
  | 'project'
  | 'projects-and-tasks'

/* c8 ignore next */
export function getDefaultFilterState(type: PageType): EntityFilterState {
  if (type === 'project') return DEFAULT_PROJECT_FILTER_STATE
  return DEFAULT_FILTER_STATE
}

export const DEFAULT_CUSTOM_FIELD_FILTERS: CustomFieldFilters = {
  text: {},
  multiSelect: {},
  select: {},
  number: {},
  date: {},
  url: {},
  person: {},
  multiPerson: {},
}

export const DEFAULT_TASK_FILTERS: TaskFilter = {
  statusIds: null,
  stageDefinitionIds: null,
  assigneeUserIds: null,
  priorities: null,
  deadlineStatuses: null,
  deadlineStatusWithReason: null,
  labelIds: null,
  createdByUserIds: null,
  estimatedCompletionTime: null,
  folderIds: null,

  recurring: null,
  autoScheduled: null,
  isBlocked: null,
  isBlocking: null,

  startDate: null,
  scheduledDate: null,
  dueDate: null,
  createdTime: null,
  updatedTime: null,
  completedTime: null,
  lastInteractedTime: null,
  type: null,

  completed: 'exclude',
  archived: 'exclude',
  canceled: 'exclude',

  scheduledStatus: null,
  scheduledEnd: null,
  scheduledStart: null,
  endDate: null,
  completedOrEstimatedTime: null,

  // Backend includes by default
  isUnvisitedStage: null,

  hasAttachments: null,

  ...DEFAULT_CUSTOM_FIELD_FILTERS,
}

export const DEFAULT_PROJECT_FILTERS: ProjectFilter = {
  ids: null,
  statusIds: null,
  stageDefinitionIds: null,
  projectDefinitionIds: null,
  managerIds: null,
  priorities: null,
  deadlineStatuses: null,
  color: null,
  labelIds: null,
  createdByUserIds: null,
  folderIds: null,

  dueDate: null,
  createdTime: null,
  updatedTime: null,
  startDate: null,

  completed: 'exclude',

  canceledDuration: null,
  canceledTaskCount: null,
  completedDuration: null,
  completedTime: null,
  estimatedCompletionTime: null,
  name: null,
  taskCount: null,

  hasAttachments: null,

  ...DEFAULT_CUSTOM_FIELD_FILTERS,
}
export const DEFAULT_WORKSPACE_FILTERS: WorkspaceFilter = {
  ids: null,
}

export const DEFAULT_FILTER_STATE: EntityFilterState = {
  $version: 9,
  target: 'tasks',
  tasks: {
    filters: DEFAULT_TASK_FILTERS,
    ordered: [],
  },
  projects: {
    filters: DEFAULT_PROJECT_FILTERS,
    ordered: [],
  },
  workspaces: {
    filters: DEFAULT_WORKSPACE_FILTERS,
    ordered: [],
  },
}

const DEFAULT_PROJECT_FILTER_STATE: EntityFilterState = {
  $version: 9,
  target: 'tasks',
  tasks: {
    filters: {
      ...DEFAULT_TASK_FILTERS,
      completed: 'include',
      canceled: 'include',
    },
    ordered: [],
  },
  projects: {
    filters: DEFAULT_PROJECT_FILTERS,
    ordered: [],
  },
  workspaces: {
    filters: DEFAULT_WORKSPACE_FILTERS,
    ordered: [],
  },
}
