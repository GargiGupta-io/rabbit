import {
  definedValueCount,
  sortAndDedupArrayValues,
  stripUndefined,
} from '@motion/utils/object'
import { type RequiredKeys } from '@motion/utils/types'
import { type GetTasksV2FilterWithOperatorsSchema } from '@motion/zod/client'

import { getCustomFieldFilters } from './custom-fields'
import { buildDateFilterQuery } from './date'
import {
  emptyInToUndefined,
  formatIdNullableFilter,
  formatInclusionFilterToBooleanFilter,
} from './helpers'
import { buildProjectFilterFrom } from './projects'
import { type DataFilters } from './types'
import { getCanceledFilter, getCompletedFilter } from './utils'

import { type AppDataContext } from '../../types'

export type TaskFilterOptions = {
  dontInferTaskType?: boolean
  userId?: string
}

export function buildTaskFilter(
  ctx: AppDataContext,
  filters: DataFilters,
  opts: TaskFilterOptions = {}
): GetTasksV2FilterWithOperatorsSchema[] | null {
  const workspaceIds =
    filters.workspaces.ids == null || filters.workspaces.ids.value.length === 0
      ? ctx.workspaces.all().map((x) => x.id)
      : filters.workspaces.ids.value

  if (
    definedValueCount(filters.tasks) === 0 &&
    definedValueCount(filters.projects) === 0
  ) {
    return [
      sortAndDedupArrayValues({
        workspaceIds,
      }),
    ]
  }

  const queryFilter = getTaskQueryFilter(ctx, filters, workspaceIds, opts)
  if (queryFilter == null) return null

  return [sortAndDedupArrayValues(stripUndefined(queryFilter))]
}

type ExactTaskQueryFilter = RequiredKeys<
  Omit<GetTasksV2FilterWithOperatorsSchema, 'ids' | 'projectIds'>
> &
  Pick<GetTasksV2FilterWithOperatorsSchema, 'projectIds'>

function getTaskQueryFilter(
  ctx: AppDataContext,
  filters: DataFilters,
  workspaceIds: string[],
  opts: TaskFilterOptions = {}
): ExactTaskQueryFilter | null {
  const taskFilters = filters.tasks

  const allProjects = ctx.projects.all()

  const projectFilter = buildProjectFilterFrom(
    ctx,
    filters,
    {
      completed: 'include',
    },
    opts.userId
  )

  const filteredProjects = allProjects.filter(projectFilter)

  // don't send a request if we know the result will be empty
  if (
    // if didn't match any project
    (allProjects.length !== 0 && filteredProjects.length === 0) ||
    // if there's a project id filter but it's empty
    (filters.projects.ids && filters.projects.ids.value.length === 0) ||
    // if there's a project id filter but that results in 0 matches
    (filters.projects.ids != null && filteredProjects.length === 0)
  ) {
    return null
  }

  const effectiveCompletedFilter = getCompletedFilter(filters.tasks, 'exclude')
  const effectiveCanceledFilter = getCanceledFilter(filters.tasks, 'exclude')

  const taskTypeFilter = opts.dontInferTaskType
    ? {
        type: taskFilters.type ?? undefined,
        recurring: taskFilters.recurring ?? undefined,
      }
    : ({
        recurring:
          !taskFilters.type || taskFilters.type.includes('RECURRING_INSTANCE')
            ? 'CURRENT'
            : undefined,
        type: taskFilters.type ?? ['NORMAL', 'RECURRING_INSTANCE'],
      } as const)

  return {
    // Optimization, if we know the query will include all projects, don't set the filter, reduces the query payload size
    ...(filteredProjects.length === allProjects.length &&
    filters.projects.ids == null
      ? undefined
      : {
          projectIds: {
            operator: 'in',
            value: filteredProjects.map((x) => x.id),
          },
        }),
    workspaceIds,
    statusIds: emptyInToUndefined(taskFilters.statusIds),
    labelIds: emptyInToUndefined(taskFilters.labelIds),
    priorities: emptyInToUndefined(taskFilters.priorities),
    deadlineStatuses: emptyInToUndefined(taskFilters.deadlineStatuses),
    deadlineStatusWithReason: emptyInToUndefined(
      taskFilters.deadlineStatusWithReason
    ),
    assigneeUserIds: formatIdNullableFilter(taskFilters.assigneeUserIds),
    createdByUserIds: emptyInToUndefined(taskFilters.createdByUserIds),
    createdTime: buildDateFilterQuery(taskFilters.createdTime ?? undefined),
    updatedTime: buildDateFilterQuery(taskFilters.updatedTime ?? undefined),
    completedTime: buildDateFilterQuery(taskFilters.completedTime ?? undefined),
    estimatedCompletionTime: buildDateFilterQuery(
      taskFilters.estimatedCompletionTime ?? undefined
    ),
    lastInteractedTime: buildDateFilterQuery(
      taskFilters.lastInteractedTime ?? undefined
    ),
    dueDate: buildDateFilterQuery(taskFilters.dueDate ?? undefined),
    customFields: getCustomFieldFilters(taskFilters),
    completed: effectiveCompletedFilter,
    canceled: effectiveCanceledFilter,
    archived: taskFilters.archived ?? undefined,
    stageDefinitionIds: formatIdNullableFilter(taskFilters.stageDefinitionIds),
    isAutoScheduled: formatInclusionFilterToBooleanFilter(
      taskFilters.autoScheduled
    ),
    isBlocked: formatInclusionFilterToBooleanFilter(taskFilters.isBlocked),
    isBlocking: formatInclusionFilterToBooleanFilter(taskFilters.isBlocking),
    scheduledStatus: emptyInToUndefined(taskFilters.scheduledStatus),

    isUnvisitedStage: taskFilters.isUnvisitedStage ?? undefined,
    folderIds: emptyInToUndefined(taskFilters.folderIds),
    scheduledStart: buildDateFilterQuery(taskFilters.scheduledStart),
    scheduledEnd: buildDateFilterQuery(taskFilters.scheduledEnd),
    startDate: buildDateFilterQuery(taskFilters.startDate),
    endDate: buildDateFilterQuery(taskFilters.endDate),
    completedOrEstimatedTime: buildDateFilterQuery(
      taskFilters.completedOrEstimatedTime
    ),

    hasAttachments: formatInclusionFilterToBooleanFilter(
      taskFilters.hasAttachments
    ),

    ...taskTypeFilter,
  }
}
