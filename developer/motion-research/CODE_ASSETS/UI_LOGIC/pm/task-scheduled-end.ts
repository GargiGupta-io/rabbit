import {
  type RecurringInstanceSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { getCurrentRangeStart } from './range'
import { isReminderTask } from './task'

export type ScheduledType =
  | 'pending'
  | 'asap'
  | 'notScheduled'
  | 'recurringScheduled'
  | 'completed'
  | 'pastDue'
  | 'beforeDue'
  | 'reminder'
  | 'unfit'
  | 'unfitInstance'
  | 'unfitPastDue'
  | 'unfitSchedulable'
  | 'stale'

type TaskScheduleType = Pick<TaskSchema, 'isAutoScheduled' | 'priorityLevel'> &
  Partial<
    Pick<
      RecurringInstanceSchema,
      | 'needsReschedule'
      | 'isUnfit'
      | 'duration'
      | 'dueDate'
      | 'parentRecurringTaskId'
      | 'scheduledStatus'
    >
  >
export const calculateScheduledType = (
  task: TaskScheduleType | undefined,
  options: {
    scheduledDate: DateTime | null
    isAutoScheduled: boolean
    isCompleted: boolean
  }
): ScheduledType => {
  if (options.isAutoScheduled && !task?.isAutoScheduled) {
    return 'pending'
  }

  // Non autoscheduled tasks should only show not scheduled or completed
  if (!task || !options.isAutoScheduled) {
    return options.isCompleted ? 'completed' : 'notScheduled'
  }

  if (isReminderTask(task)) {
    return task.scheduledStatus === 'PAST_DUE' ? 'pastDue' : 'reminder'
  }

  if (task.needsReschedule) {
    return 'pending'
  }

  if (options.scheduledDate && task.priorityLevel === 'ASAP') {
    return 'asap'
  }

  if (task.scheduledStatus === 'UNFIT_PAST_DUE') {
    return task.parentRecurringTaskId ? 'unfitInstance' : 'unfitPastDue'
  } else if (task.scheduledStatus === 'UNFIT_SCHEDULABLE') {
    return 'unfitSchedulable'
  } else if (task.scheduledStatus === 'PAST_DUE') {
    return 'pastDue'
  } else if (task.scheduledStatus === 'ON_TRACK') {
    return 'beforeDue'
  }

  if (task.isUnfit) {
    return 'unfit'
  }

  if (
    task.dueDate &&
    DateTime.fromISO(task.dueDate) < getCurrentRangeStart(DateTime.now())
  ) {
    return 'stale'
  }

  return 'notScheduled'
}
