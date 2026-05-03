import { type RecurringTaskSchema } from '@motion/rpc-types'

import { shouldWarnIfPastDueForRecurringFrequency } from '../../../task-utils'
import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

export function getTaskFrequencyChangedFields(
  task: UpdatableTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): TaskUpdateFields
export function getTaskFrequencyChangedFields(
  task: RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): RecurringTaskUpdateFields
export function getTaskFrequencyChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema,
  _options: Pick<TaskFormChangedFieldOptions, 'currentUserId'>
): TaskUpdateFields | RecurringTaskUpdateFields {
  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  if (task.type === 'RECURRING_TASK') {
    const warnIfPastDue = shouldWarnIfPastDueForRecurringFrequency(
      task.frequency
    )
    if (!warnIfPastDue) {
      updates.ignoreWarnOnPastDue = !warnIfPastDue
    }
  }

  return updates
}
