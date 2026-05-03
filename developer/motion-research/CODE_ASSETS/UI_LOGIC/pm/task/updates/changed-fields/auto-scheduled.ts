import { type RecurringTaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import {
  DEFAULT_DURATION,
  getDefaultChunkDuration,
  MIN_DURATION_DEFAULT_NO_CHUNKS_UNDER,
  NO_CHUNK_DURATION,
  NO_DURATION,
  SHORT_TASK_DURATION,
} from '@motion/shared/pm'
import { parseDate } from '@motion/utils/dates'

import { isRecurringTaskParent } from '../../../task-utils'
import { getTaskInitialStartDate } from '../../form'
import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

/**
 * @deprecated Use `getTaskAutoScheduledChangedFields` with the new schema
 */
export function getAutoScheduledChangedFields(
  task: PMTaskType | RecurringTask,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): Partial<PMTaskType & RecurringTask> {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskAutoScheduledChangedFields(
    convertedTask as unknown as UpdatableTaskSchema,
    options
  ) as Partial<PMTaskType & RecurringTask>
}

export function getTaskAutoScheduledChangedFields(
  task: UpdatableTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): TaskUpdateFields
export function getTaskAutoScheduledChangedFields(
  task: RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): RecurringTaskUpdateFields
export function getTaskAutoScheduledChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): TaskUpdateFields | RecurringTaskUpdateFields {
  const { currentUserId } = options

  if (task.type === 'CHUNK') return {}
  if (!task.isAutoScheduled) return {}

  const taskInitialStart =
    getTaskInitialStartDate(task) ?? getTaskInitialStartDate()
  const isShortTask = task.duration === SHORT_TASK_DURATION

  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  if (!task.assigneeUserId) {
    updates.assigneeUserId = currentUserId
  }

  if (task.duration === NO_DURATION) {
    updates.duration = DEFAULT_DURATION
  } else if (
    task.duration != null &&
    task.minimumDuration === NO_CHUNK_DURATION &&
    task.duration >= MIN_DURATION_DEFAULT_NO_CHUNKS_UNDER
  ) {
    updates.minimumDuration = getDefaultChunkDuration(task.duration)
  }

  if (isRecurringTaskParent(task)) {
    if (!task.startingOn) {
      updates.startingOn = parseDate(taskInitialStart).toISO() ?? undefined
    }

    return updates
  }

  if (!task.startDate) {
    updates.startDate = taskInitialStart
  }

  const parsedStart = parseDate(taskInitialStart)
  const parsedDeadline = task.dueDate != null && parseDate(task.dueDate)
  const shouldUpdateDueDate =
    task.dueDate == null || parsedDeadline < parsedStart

  if (shouldUpdateDueDate) {
    updates.dueDate = parseDate(taskInitialStart)
      .plus({ days: isShortTask ? 0 : 1 })
      .endOf('day')
      .toISO()
  }

  return updates
}
