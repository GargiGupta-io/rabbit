import { type RecurringTaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'

import {
  type RecurringTaskUpdateFields,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

/**
 * @deprecated Use `getTaskAssigneeChangedFields` with the new schema
 */
export function getAssigneeChangedFields(task: PMTaskType | RecurringTask) {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskAssigneeChangedFields(
    convertedTask as unknown as UpdatableTaskSchema
  ) as Partial<PMTaskType & RecurringTask>
}

export function getTaskAssigneeChangedFields(
  task: UpdatableTaskSchema
): TaskUpdateFields
export function getTaskAssigneeChangedFields(
  task: RecurringTaskSchema
): RecurringTaskUpdateFields
export function getTaskAssigneeChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema
): TaskUpdateFields | RecurringTaskUpdateFields {
  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  // An unassigned task cannot be autoscheduled
  if (task.isAutoScheduled && task.assigneeUserId == null) {
    updates.isAutoScheduled = false
  }

  return updates
}
