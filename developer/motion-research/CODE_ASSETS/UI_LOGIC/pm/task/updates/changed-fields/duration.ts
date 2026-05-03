import { type RecurringTaskSchema } from '@motion/rpc-types'
import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'
import {
  getDefaultChunkDuration,
  MIN_DURATION_WITH_CHUNKS,
  NO_CHUNK_DURATION,
  SHORT_TASK_DURATION,
} from '@motion/shared/pm'
import { parseDate } from '@motion/utils/dates'

import {
  type RecurringTaskUpdateFields,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

/**
 * @deprecated Use `getTaskDurationChangedFields` with the new schema
 */
export function getDurationChangedFields(
  task: PMTaskType | RecurringTask
): Partial<PMTaskType & RecurringTask> {
  const convertedTask = {
    ...task,
    type:
      task.itemType === PMItemType.recurringTask ? 'RECURRING_TASK' : 'NORMAL',
  }

  return getTaskDurationChangedFields(
    convertedTask as unknown as UpdatableTaskSchema
  ) as Partial<PMTaskType & RecurringTask>
}

export function getTaskDurationChangedFields(
  task: UpdatableTaskSchema
): TaskUpdateFields
export function getTaskDurationChangedFields(
  task: RecurringTaskSchema
): RecurringTaskUpdateFields
export function getTaskDurationChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema
): TaskUpdateFields | RecurringTaskUpdateFields {
  const taskDuration = task.duration

  const updates: TaskUpdateFields & RecurringTaskUpdateFields = {}

  if (task.type !== 'RECURRING_TASK') {
    // Make the start date the same as deadlineDate in short task
    if (task.duration === SHORT_TASK_DURATION) {
      updates.startDate = task.dueDate
        ? parseDate(task.dueDate).toISODate()
        : null
    }
  }

  // Make sure to update the minimum duration if needed based on the new duration value
  if (task.type !== 'CHUNK') {
    if (
      task.isAutoScheduled &&
      taskDuration != null &&
      taskDuration >= MIN_DURATION_WITH_CHUNKS
    ) {
      const newMinDuration = getDefaultChunkDuration(taskDuration)
      if (task.minimumDuration !== newMinDuration) {
        updates.minimumDuration = newMinDuration
      }
    } else if (task.minimumDuration !== NO_CHUNK_DURATION) {
      updates.minimumDuration = NO_CHUNK_DURATION
    }
  }

  if (task.type !== 'RECURRING_TASK' && task.type !== 'CHUNK') {
    const completedDuration = Math.min(
      taskDuration ?? 0,
      task.completedDuration ?? 0
    )

    if (completedDuration !== task.completedDuration) {
      updates.completedDuration = completedDuration
    }
  }

  return updates
}
