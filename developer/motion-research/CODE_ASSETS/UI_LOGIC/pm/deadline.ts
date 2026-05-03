import { templateStr } from '@motion/react-core/strings'
import {
  type NormalTaskSchema,
  type RecurringInstanceSchema,
  type TaskSchema,
} from '@motion/rpc-types'
import { type PMTaskType, type RecurringTask } from '@motion/rpc-types/legacy'
import { parseDate } from '@motion/utils/dates'

import { DateTime } from 'luxon'

import { prettyDateDay } from '../utils'

export const pmComputeDeadlineDiff = (
  dueDate: string,
  scheduledStart: string
) => {
  const dueDateLuxon = DateTime.fromISO(dueDate)
  const scheduledStartLuxon = DateTime.fromISO(scheduledStart)
  const minuteDiff = dueDateLuxon.diff(scheduledStartLuxon, 'minutes').minutes
  return minuteDiff
}

// Sort the chunks by the scheduled end of each chunk, with the earliest task being first.
export const sortTaskChunksByScheduledEnd = (
  chunkA: PMTaskType | Pick<TaskSchema, 'scheduledEnd'>,
  chunkB: PMTaskType | Pick<TaskSchema, 'scheduledEnd'>
) => {
  if (chunkA.scheduledEnd == null) {
    return 1 // chunkA is after chunkB
  } else if (chunkB.scheduledEnd == null) {
    return -1 // chunkA is before chunkB
  }

  if (chunkA.scheduledEnd < chunkB.scheduledEnd) {
    return -1 // chunkA is before chunkB
  } else if (chunkA.scheduledEnd > chunkB.scheduledEnd) {
    return 1 // chunkA is after chunkB
  }

  return 0
}

export const getLastScheduledEndFromTaskV2 = (
  task: Pick<TaskSchema, 'scheduledEnd'>,
  chunks: Pick<
    TaskSchema,
    'completedTime' | 'scheduledStart' | 'scheduledEnd'
  >[]
): string | null => {
  if (chunks.length > 0) {
    const incompleteChunks = chunks
      .filter((chunk) => chunk.completedTime == null && chunk.scheduledStart)
      .sort(sortTaskChunksByScheduledEnd)
    if (!incompleteChunks.length) {
      return null
    }
    return incompleteChunks[incompleteChunks.length - 1].scheduledEnd || null
  }

  return task.scheduledEnd || DateTime.now().toISO()
}

export type GetTaskScheduledDateStringOptions = {
  skipTime?: boolean
}
export const getTaskScheduledDateString = (
  task: TaskSchema,
  opts?: GetTaskScheduledDateStringOptions
): string => {
  if ('scheduledStatus' in task && task.scheduledStatus === 'UNFIT_PAST_DUE') {
    return 'Could not fit task'
  }

  if (opts?.skipTime) {
    return 'estimatedCompletionTime' in task && task.estimatedCompletionTime
      ? templateStr('{{date}}', {
          date: prettyDateDay(task.estimatedCompletionTime),
        })
      : 'Pending'
  }

  return 'estimatedCompletionTime' in task && task.estimatedCompletionTime
    ? templateStr('{{date}} at {{time}}', {
        date: prettyDateDay(task.estimatedCompletionTime),
        time: DateTime.fromISO(task.estimatedCompletionTime).toFormat('h:mma'),
      })
    : 'Pending'
}

export const isTaskScheduled = (task?: PMTaskType) => {
  return Boolean(task != null && (task.scheduledStart || task.chunks?.length))
}

type IsTaskPastDueFields =
  | 'priorityLevel'
  | 'needsReschedule'
  | 'scheduledStatus'

type NullableUndefinedFields<T> = {
  [K in keyof T]: undefined extends T[K] ? T[K] | null : T[K]
}
type TaskWithPastDue = NullableUndefinedFields<
  Pick<PMTaskType, IsTaskPastDueFields>
>

type NormalTaskSchemaWithPastDue = NullableUndefinedFields<
  Pick<NormalTaskSchema, IsTaskPastDueFields>
>
type RecurringTaskSchemaWithPastDue = NullableUndefinedFields<
  Pick<RecurringInstanceSchema, IsTaskPastDueFields>
>

type TaskV2WithPastDue =
  | NormalTaskSchemaWithPastDue
  | RecurringTaskSchemaWithPastDue

export function isTaskPastDue(task: TaskWithPastDue | TaskV2WithPastDue) {
  if (task.priorityLevel === 'ASAP' || task.needsReschedule) {
    return false
  }

  return (
    task.scheduledStatus === 'PAST_DUE' ||
    task.scheduledStatus === 'UNFIT_PAST_DUE'
  )
}

function isDeadlineInFuture(task: Pick<PMTaskType, 'dueDate'>) {
  const { dueDate: dueDateString } = task
  if (!dueDateString) return true

  const now = DateTime.now()
  const dueDate = parseDate(dueDateString)

  return dueDate > now
}

export function shouldAllowPromoteToHardDeadline(
  task: Pick<PMTaskType, 'dueDate' | 'deadlineType' | 'type'>
) {
  return (
    isDeadlineInFuture(task) &&
    task.deadlineType !== 'HARD' &&
    task.type !== 'RECURRING_INSTANCE'
  )
}

export function shouldAllowASAP(task: Pick<PMTaskType, 'type'> | TaskSchema) {
  return task.type !== 'RECURRING_INSTANCE'
}

export type RecurrenceInfo = {
  frequency: RecurringTask['frequency']
  days: RecurringTask['days']
}

export function getStartDateOrToday(
  startDate: PMTaskType['startDate']
): DateTime {
  return startDate
    ? parseDate(startDate).startOf('day')
    : DateTime.now().startOf('day')
}
