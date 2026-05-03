import { type RecurringTaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import { SHORT_TASK_DURATION } from '@motion/shared/pm'

import {
  type RecurringTaskUpdateFields,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

/**
 * @deprecated Use `getTaskCompletedDurationChangedFields` with the new schema
 */
export function getCompletedDurationChangedFields(
  task: PMTaskType | RecurringTask
): Partial<PMTaskType & RecurringTask> {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskCompletedDurationChangedFields(
    convertedTask as unknown as UpdatableTaskSchema
  ) as Partial<PMTaskType & RecurringTask>
}

export function getTaskCompletedDurationChangedFields(
  task: UpdatableTaskSchema
): TaskUpdateFields
export function getTaskCompletedDurationChangedFields(
  task: RecurringTaskSchema
): RecurringTaskUpdateFields
export function getTaskCompletedDurationChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema
): TaskUpdateFields | RecurringTaskUpdateFields {
  if (task.type === 'RECURRING_TASK' || task.type === 'CHUNK') return {}

  const updates: TaskUpdateFields = {}

  if (
    task.duration != null &&
    task.duration > SHORT_TASK_DURATION &&
    task.completedDuration >= task.duration
  ) {
    updates.isAutoScheduled = false
  }

  return updates
}
