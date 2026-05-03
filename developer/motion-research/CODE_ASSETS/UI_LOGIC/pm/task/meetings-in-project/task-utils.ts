import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
  type TaskSchema,
} from '@motion/zod/client'

export function isMeetingTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema & {
  meetingEventId: NonNullable<NormalTaskSchema['meetingEventId']>
} {
  return task != null && task.type === 'NORMAL' && task.meetingEventId != null
}

export function isSchedulingTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema & {
  scheduleMeetingWithinDays: NonNullable<
    NormalTaskSchema['scheduleMeetingWithinDays']
  >
} {
  return (
    task != null &&
    task.type === 'NORMAL' &&
    task.scheduleMeetingWithinDays != null
  )
}

export function isUnscheduledSchedulingTask(
  task: TaskSchema | RecurringTaskSchema | undefined
): task is NormalTaskSchema & {
  scheduleMeetingWithinDays: NonNullable<
    NormalTaskSchema['scheduleMeetingWithinDays']
  >
} {
  return isSchedulingTask(task) && task.meetingTaskId == null
}

export function isScheduledSchedulingTask(
  task: TaskSchema | RecurringTaskSchema | undefined
): task is NormalTaskSchema & {
  scheduleMeetingWithinDays: NonNullable<
    NormalTaskSchema['scheduleMeetingWithinDays']
  >
} {
  return isSchedulingTask(task) && task.meetingTaskId != null
}
