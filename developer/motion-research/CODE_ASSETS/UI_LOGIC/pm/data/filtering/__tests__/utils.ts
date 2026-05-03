import { cloneDeep } from '@motion/utils/core'

import { type AppDataContext, type EntityCache } from '../../types'
import { type DataFilters } from '../query'
import { DEFAULT_CUSTOM_FIELD_FILTERS } from '../state'
import {
  type EntityFilterState,
  type ProjectFilter,
  type TaskFilter,
  type WorkspaceFilter,
} from '../state/types'

export type Data = {
  [K in keyof AppDataContext]?: AppDataContext[K] extends EntityCache<infer C>
    ? Partial<C>[]
    : never
}

export function createContext(data: Data): AppDataContext {
  return {
    loaded: true,
    // @ts-expect-error - testing
    workspaces: createCache(data.workspaces),
    // @ts-expect-error - testing
    projects: createCache(data.projects),
    // @ts-expect-error - testing
    statuses: createCache(data.statuses),
    // @ts-expect-error - testing
    users: createCache(data.users),
    // @ts-expect-error - testing
    labels: createCache(data.labels),
    // @ts-expect-error - testing
    customFields: createCache(data.customFields),
    // @ts-expect-error - testing
    priorities: createCache(data.priorities, (x) => x),
  }
}

export function createCache<T extends { id: string }>(
  items: T[]
): EntityCache<T>
export function createCache<T>(
  items: T[],
  keyAccessor: (item: T) => string
): EntityCache<T>
export function createCache<T>(
  items: T[],
  keyAccessor: (item: any) => string = (item) => item.id
): EntityCache<T> {
  return {
    all: () => items,
    byId(id: string) {
      return items.find((x) => keyAccessor(x) === id)
    },
  }
}

export function createDataFilters(
  tasks: Partial<TaskFilter>,
  projects?: Partial<ProjectFilter> | undefined,
  workspace?: Partial<WorkspaceFilter> | undefined
): DataFilters {
  return {
    tasks: createTaskFilter(tasks),
    projects: createProjectFilter(projects ?? {}),
    workspaces: createWorkspaceFilter(workspace ?? {}),
  }
}

export function createEntityFilterState(
  partialTaskFilter: Partial<TaskFilter>,
  partialProjectFilter?: Partial<ProjectFilter> | undefined,
  partialWorkspaceFilter?: Partial<WorkspaceFilter> | undefined
): EntityFilterState {
  const tasks = createTaskFilter(partialTaskFilter)
  const projects = createProjectFilter(partialProjectFilter ?? {})
  const workspaces = createWorkspaceFilter(partialWorkspaceFilter ?? {})

  return {
    $version: 9,
    target: 'tasks',
    tasks: {
      ordered: keysOf(partialTaskFilter),
      filters: tasks,
    },
    projects: {
      ordered: keysOf(partialProjectFilter),
      filters: projects,
    },
    workspaces: {
      ordered: keysOf(partialWorkspaceFilter),
      filters: workspaces,
    },
  }
}

function keysOf<T>(obj: Partial<T> | undefined): (keyof T)[] {
  if (obj == null) return []
  return Object.keys(obj).filter(
    (x) => x !== 'completed' && x !== 'archived'
  ) as (keyof T)[]
}

export function createTaskFilter(data: Partial<TaskFilter>): TaskFilter {
  return {
    statusIds: null,
    stageDefinitionIds: null,
    assigneeUserIds: null,
    priorities: null,
    deadlineStatuses: null,
    deadlineStatusWithReason: null,
    labelIds: null,
    createdByUserIds: null,
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
    estimatedCompletionTime: null,
    lastInteractedTime: null,
    completed: 'exclude',
    canceled: 'exclude',
    archived: 'exclude',
    isUnvisitedStage: null,
    type: null,

    scheduledStatus: null,
    scheduledEnd: null,
    scheduledStart: null,
    endDate: null,
    completedOrEstimatedTime: null,

    hasAttachments: null,

    ...cloneDeep(DEFAULT_CUSTOM_FIELD_FILTERS),

    ...data,
  }
}

export function createProjectFilter(
  data: Partial<ProjectFilter>
): ProjectFilter {
  return {
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
    completed: null,
    startDate: null,

    canceledDuration: null,
    canceledTaskCount: null,
    completedDuration: null,
    completedTime: null,
    estimatedCompletionTime: null,
    taskCount: null,
    name: null,

    hasAttachments: null,

    ...cloneDeep(DEFAULT_CUSTOM_FIELD_FILTERS),

    ...data,
  }
}

export function createWorkspaceFilter(
  data: Partial<WorkspaceFilter>
): WorkspaceFilter {
  return {
    ids: null,
    ...data,
  }
}

// Need to fix the logic for finding tests
describe('utils', () => it.skip('ignore', () => {}))
