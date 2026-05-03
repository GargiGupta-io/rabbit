import { type RecurringTaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import { SHORT_TASK_DURATION } from '@motion/shared/pm'
import { adjustStartDateBeforeEnd, parseDate } from '@motion/utils/dates'

import { isRecurringTaskParent } from '../../../task-utils'
import {
  type RecurringTaskUpdateFields,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

/**
 * @deprecated Use `getDeadlineDateChangedFields` with the new schema
 */
export function getDeadlineDateChangedFields(task: PMTaskType | RecurringTask) {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskDeadlineDateChangedFields(
    convertedTask as unknown as UpdatableTaskSchema
  ) as Partial<PMTaskType & RecurringTask>
}

export function getTaskDeadlineDateChangedFields(
  task: UpdatableTaskSchema
): TaskUpdateFields
export function getTaskDeadlineDateChangedFields(
  task: RecurringTaskSchema
): RecurringTaskUpdateFields
export function getTaskDeadlineDateChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema
): TaskUpdateFields | RecurringTaskUpdateFields {
  const deadlineDate = isRecurringTaskParent(task) ? null : task.dueDate
  const startDate = isRecurringTaskParent(task)
    ? task.startingOn
    : task.startDate

  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  if (startDate && deadlineDate) {
    const start = parseDate(startDate)
    const deadline = parseDate(deadlineDate)

    if (start > deadline) {
      updates.startDate = adjustStartDateBeforeEnd(start, deadline)
    }
  }

  // Reset `isAutoScheduled` if we're removing the deadline
  if (!deadlineDate && task.isAutoScheduled) {
    updates.isAutoScheduled = false
  }

  // When a short task, the start date must be forced to be the deadlineDate
  if (task.duration === SHORT_TASK_DURATION) {
    const startIsoDate = startDate ? parseDate(startDate).toISODate() : null
    const endIsoDate = deadlineDate ? parseDate(deadlineDate).toISODate() : null

    if (startIsoDate !== endIsoDate) {
      updates.startDate = endIsoDate
    }
  }

  return updates
}
