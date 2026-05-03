import { type RecurringTaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import { isAutoScheduledStatus } from '@motion/shared/common'

import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

/**
 * @deprecated Use `getTaskStatusChangedFields` with the new schema
 */
export function getStatusChangedFields(
  task: PMTaskType | RecurringTask,
  options: Pick<TaskFormChangedFieldOptions, 'statuses'>
) {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskStatusChangedFields(
    convertedTask as unknown as UpdatableTaskSchema,
    options
  ) as Partial<PMTaskType & RecurringTask>
}

export function getTaskStatusChangedFields(
  task: UpdatableTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'statuses'>
): TaskUpdateFields
export function getTaskStatusChangedFields(
  task: RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'statuses'>
): RecurringTaskUpdateFields
export function getTaskStatusChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'statuses'>
): TaskUpdateFields | RecurringTaskUpdateFields {
  const { statuses } = options

  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  // Reset auto-schedule if it's not enabled for that specific status
  if (task.isAutoScheduled) {
    const status = statuses.find((s) => s.id === task.statusId)

    if (status && !isAutoScheduledStatus(status)) {
      updates.isAutoScheduled = false
    }
  }

  return updates
}
