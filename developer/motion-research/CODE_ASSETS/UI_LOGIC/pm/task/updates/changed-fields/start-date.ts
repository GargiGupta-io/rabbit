import { type RecurringTaskSchema, type TaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import { parseDate } from '@motion/utils/dates'

import { isRecurringTaskParent } from '../../../task-utils'
import { type RecurringTaskUpdateFields, type TaskUpdateFields } from '../types'

/**
 * @deprecated Use `getTaskStartDateChangedFields` with the new schema
 */
export function getStartDateChangedFields(task: PMTaskType | RecurringTask) {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskStartDateChangedFields(convertedTask as any) as Partial<
    PMTaskType & RecurringTask
  >
}

export function getTaskStartDateChangedFields(
  task: TaskSchema
): TaskUpdateFields
export function getTaskStartDateChangedFields(
  task: RecurringTaskSchema
): RecurringTaskUpdateFields
export function getTaskStartDateChangedFields(
  task: TaskSchema | RecurringTaskSchema
): TaskUpdateFields | RecurringTaskUpdateFields {
  if (isRecurringTaskParent(task)) return {}

  const deadlineDate = task.dueDate
  const startDate = task.startDate

  const updates: TaskUpdateFields = {}

  if (startDate && deadlineDate) {
    const start = parseDate(startDate)
    const deadline = parseDate(deadlineDate)

    if (start > deadline) {
      updates.dueDate = start.endOf('day').plus({ days: 1 }).toISO()
    }
  }

  return updates
}
