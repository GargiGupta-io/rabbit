import { createNoneId } from '@motion/shared/identifiers'
import { cloneDeep } from '@motion/utils/core'
import {
  type BooleanFilterSchema,
  type CustomFieldValueFilterSchema,
  type GetTasksV2FilterWithOperatorsSchema,
  type IdFilterSchema,
  type IdNullableFilterSchema,
  type ScheduledStatusFilterSchema,
  type ScheduledStatusSchema,
  type TaskSchema,
  type TasksV2QuerySchema,
} from '@motion/zod/client'

import { excludeByCustomField } from './custom-fields'
import { excludeDate, excludeInclusion, excludeLabels } from './helpers'
import { getCanceledIdFilter, getCompletedFilter } from './utils'

type TaskFilterContext = {
  userId: string | null
  canceledStatusIds: string[]
}

export function createTaskFilterFn(
  filterArg:
    | TasksV2QuerySchema
    | GetTasksV2FilterWithOperatorsSchema
    | GetTasksV2FilterWithOperatorsSchema[],
  ctx: TaskFilterContext
) {
  const filters =
    '$version' in filterArg
      ? (filterArg.filters as GetTasksV2FilterWithOperatorsSchema[])
      : Array.isArray(filterArg)
        ? filterArg
        : [filterArg]
  const filterFns = filters.map((filter) =>
    createSingleLocalTaskFilterFn(
      filter as GetTasksV2FilterWithOperatorsSchema,
      ctx
    )
  )

  return (task: TaskSchema) => filterFns.some((fn) => fn(task))
}

function createSingleLocalTaskFilterFn(
  rawFilter: GetTasksV2FilterWithOperatorsSchema,
  ctx: TaskFilterContext
) {
  const filters = preprocessFilter(rawFilter, ctx.userId)
  const completedFilter = getCompletedFilter(filters, 'exclude')
  const canceledFilter = getCanceledIdFilter(filters, ctx.canceledStatusIds)

  return (task: TaskSchema): boolean => {
    if (exclude(filters.ids, task.id)) return false
    if (exclude(filters.workspaceIds, task.workspaceId)) return false
    if (exclude(filters.type, task.type)) return false
    if (excludeId(filters.assigneeUserIds, task.assigneeUserId)) return false
    if (excludeId(filters.createdByUserIds, task.createdByUserId)) return false

    if (excludeId(filters.statusIds, task.statusId)) return false
    if (excludeProjects(filters.projectIds, task)) return false

    if (excludeInclusion(completedFilter, task.completedTime)) return false
    if (excludeId(canceledFilter, task.statusId)) return false
    if (excludeInclusion(filters.archived, task.archivedTime)) return false

    if (excludeBoolean(filters.isAutoScheduled, task.isAutoScheduled))
      return false

    if (excludeId(filters.priorities, task.priorityLevel)) return false

    if (excludeDate(filters.completedTime, task.completedTime)) return false
    if (excludeDate(filters.createdTime, task.createdTime)) return false
    if (excludeDate(filters.updatedTime, task.updatedTime)) return false
    if (excludeDate(filters.lastInteractedTime, task.lastInteractedTime))
      return false
    if (excludeDate(filters.dueDate, task.dueDate)) return false
    if (
      'estimatedCompletionTime' in task &&
      excludeDate(filters.estimatedCompletionTime, task.estimatedCompletionTime)
    )
      return false

    if (excludeByCustomField(filters.customFields, task)) return false

    if (task.type === 'NORMAL') {
      if (excludeId(filters.stageDefinitionIds, task.stageDefinitionId))
        return false
      if (excludeScheduledStatus(filters.scheduledStatus, task.scheduledStatus))
        return false
      if (excludeInclusion(filters.isUnvisitedStage, task.isUnvisitedStage))
        return false
      if (excludeBoolean(filters.isBlocked, !!task.blockedByTaskIds.length))
        return false
      if (excludeBoolean(filters.isBlocking, !!task.blockingTaskIds.length))
        return false
      if (
        excludeBoolean(filters.hasAttachments, !!task.uploadedFileIds?.length)
      ) {
        return false
      }
    }

    if (task.type === 'RECURRING_INSTANCE') {
      if (excludeDate(filters.endDate, task.endDate)) return false
      if (excludeDate(filters.startDate, task.startDate)) return false
      if (
        excludeBoolean(filters.hasAttachments, !!task.uploadedFileIds?.length)
      ) {
        return false
      }
    }
    if (excludeDate(filters.scheduledEnd, task.scheduledEnd)) return false
    if (excludeDate(filters.scheduledStart, task.scheduledStart)) return false

    if (excludeLabels(filters.labelIds, task)) return false

    return true
  }
}

function excludeId(
  filter: IdFilterSchema | IdNullableFilterSchema | undefined,
  value: string | null
) {
  if (filter == null) return false
  const matches = exclude(filter.value, value)
  return filter.inverse ? !matches : matches
}

function exclude(filter: (string | null)[] | undefined, value: string | null) {
  if (filter == null) return false
  return !filter.includes(value)
}

function excludeBoolean(
  filter: BooleanFilterSchema | undefined,
  value: boolean
) {
  if (filter == null) return false
  const matches = filter.value !== value
  return filter.inverse ? !matches : matches
}

function excludeProjects(
  filter: IdNullableFilterSchema | undefined,
  task: TaskSchema
) {
  if (filter == null) return false
  const excluded = excludeProjectsCore(filter, task)
  return filter.inverse ? !excluded : excluded
}

function excludeProjectsCore(
  filter: IdNullableFilterSchema,
  task: TaskSchema
): boolean {
  const idToCheck = task.projectId ?? createNoneId(task.workspaceId)
  return !filter.value.some((x) => x === idToCheck)
}

function excludeScheduledStatus(
  filter: ScheduledStatusFilterSchema | undefined,
  scheduledStatus: ScheduledStatusSchema | null
) {
  if (filter == null) return false
  const matches = exclude(filter.value, scheduledStatus)
  return filter.inverse ? !matches : matches
}

type FilterContext = {
  user: { id: string }
}

function preprocessFilter(
  filter: GetTasksV2FilterWithOperatorsSchema,
  userId: string | null
) {
  if (userId == null) return filter
  const cloned = cloneDeep(filter)
  preprocessQueryFilter({ user: { id: userId } }, cloned)
  return cloned
}

function preprocessQueryFilter(
  ctx: FilterContext,
  filter: GetTasksV2FilterWithOperatorsSchema
) {
  preprocessAtMe(ctx, filter.assigneeUserIds)
  preprocessAtMe(ctx, filter.createdByUserIds)
  if (filter.customFields) {
    filter.customFields.forEach((x) => preprocessCustomFieldsAtMe(ctx, x))
  }

  return filter
}

function preprocessAtMe(
  ctx: FilterContext,
  filter: IdNullableFilterSchema | undefined
) {
  if (filter == null) return
  filter.value = filter.value.map((x) => (x === '@me' ? ctx.user.id : x))
}

function preprocessCustomFieldsAtMe(
  ctx: FilterContext,
  fields: Record<string, CustomFieldValueFilterSchema>
) {
  if (fields == null) return
  Object.keys(fields).forEach((key) => {
    const filter = fields[key]
    if (filter.operator === 'in') {
      preprocessAtMe(ctx, filter)
    }
  })
}
