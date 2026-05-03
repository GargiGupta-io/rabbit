import { templateStr } from '@motion/react-core/strings'
import {
  type DeadlineStatusWithReason,
  isCanceledStatus,
} from '@motion/shared/common'
import { groupByKey } from '@motion/utils/array'
import { formatToReadableWeekDayMonth } from '@motion/utils/dates'
import {
  type DeadlineStatusSchema,
  type StatusSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import {
  getEtaLabel,
  numDaysAndHoursBetweenDates,
  type PluralizeFunction,
} from './general'
import {
  getMissedDeadlineTooltip,
  getOnTrackTooltip,
  getScheduledPastDeadlineTooltip,
  type MaybeTooltipReturnObject,
} from './tooltip'

const UNFIT_RECURRING_INSTANCE_MESSAGE =
  'This recurring instance does not fit before the next instance is eligible to be scheduled'

export const normalizeTaskDeadlineStatus = (
  task: TaskSchema
): DeadlineStatusSchema => {
  return 'deadlineStatus' in task && task.deadlineStatus
    ? task.deadlineStatus
    : 'none'
}

export const taskScheduledStatus = (task: TaskSchema) => {
  return 'scheduledStatus' in task ? task.scheduledStatus : null
}

export const getTaskEtaTitle = (task: TaskSchema) => {
  const deadlineStatus = normalizeTaskDeadlineStatus(task)
  return getEtaLabel(deadlineStatus, 'task', taskScheduledStatus(task))
}

export const getTaskEtaReason = (
  task: TaskSchema,
  pluralize: (
    numDays: number,
    singular: string,
    plural: string
  ) => string | React.ReactNode,
  autoScheduleRange: number
) => {
  const deadlineStatus = normalizeTaskDeadlineStatus(task)

  const scheduledDate =
    task.type === 'NORMAL' && task.estimatedCompletionTime
      ? task.estimatedCompletionTime
      : (task.scheduledEnd ?? null)

  const dateDue = formatToReadableWeekDayMonth(task.dueDate ?? '')

  const { numDaysMissed, numHoursMissed } = numDaysAndHoursBetweenDates(
    task.dueDate,
    scheduledDate
  )

  switch (deadlineStatus) {
    case 'missed-deadline':
      return task.dueDate
        ? templateStr('Due {{dateDue}} ({{daysAgo}})', {
            dateDue,
            daysAgo: DateTime.fromISO(task.dueDate).toRelative(),
          })
        : ''
    case 'scheduled-past-deadline': {
      if (taskScheduledStatus(task) === 'UNFIT_SCHEDULABLE') {
        return `This is because this task can’t fit within Motion’s ${autoScheduleRange} day auto-schedule window.`
      }

      if (
        taskScheduledStatus(task) === 'UNFIT_PAST_DUE' &&
        task.type === 'RECURRING_INSTANCE'
      ) {
        return UNFIT_RECURRING_INSTANCE_MESSAGE
      }

      const shouldShowHours = numDaysMissed === 0 && numHoursMissed > 0

      return templateStr(
        'Due {{dateDue}}. Scheduled {{numMissed}} {{pluralizedText}} after',
        {
          dateDue,
          numMissed: shouldShowHours ? numHoursMissed : numDaysMissed,
          pluralizedText: shouldShowHours
            ? pluralize(numHoursMissed, 'hour', 'hours')
            : pluralize(numDaysMissed, 'day', 'days'),
        }
      )
    }

    case 'on-track':
      return scheduledDate
        ? templateStr('Due {{dateDue}} {{scheduledText}}', {
            dateDue,
            scheduledText:
              numDaysMissed > 0
                ? templateStr(
                    '({{daysDiff}} {{pluralizedText}} after scheduled date)',
                    {
                      numDaysMissed,
                      pluralizedText: pluralize(numDaysMissed, 'day', 'days'),
                    }
                  )
                : '(Scheduled on due date)',
          })
        : ''
    default:
      return ''
  }
}

export const getExtendedTaskDeadlineStatus = (
  task: TaskSchema | null,
  workspaceStatuses: StatusSchema[] = []
): DeadlineStatusWithReason => {
  if (task === null) return 'none'

  const deadlineStatus = normalizeTaskDeadlineStatus(task)

  if (deadlineStatus !== 'none') return deadlineStatus
  if (task.completedTime) return 'completed'

  const statusesMap = groupByKey(workspaceStatuses, 'id')
  const taskStatus = statusesMap[task.statusId]?.[0] ?? null

  if (taskStatus != null && isCanceledStatus(taskStatus)) return 'canceled'

  return 'none'
}

export const getTaskNoEtaReason = (
  task: TaskSchema,
  workspaceStatuses: StatusSchema[],
  autoScheduleRange: number
) => {
  const deadlineStatus = getExtendedTaskDeadlineStatus(task, workspaceStatuses)

  if (
    deadlineStatus !== 'none' &&
    deadlineStatus !== 'completed' &&
    deadlineStatus !== 'canceled'
  )
    return null

  const isUnfit = taskScheduledStatus(task) === 'UNFIT_SCHEDULABLE'

  if (deadlineStatus === 'completed') {
    return 'Task complete'
  } else if (deadlineStatus === 'canceled') {
    return 'Task canceled'
  } else if (isUnfit) {
    return `No ETA because Motion only schedules tasks for the next ${autoScheduleRange} days. Once this task can be fit within the next ${autoScheduleRange} day period, it will be auto-scheduled.`
  } else if (!task.isAutoScheduled) {
    return 'No ETA because this task is not auto-scheduled'
  }

  return 'No ETA'
}

/*
  Given a task, return the tooltip title, action, and ETA text
*/
export const getTaskEtaTooltip = (
  task: TaskSchema,
  workspaceStatuses: StatusSchema[] = [],
  pluralize: PluralizeFunction,
  autoScheduleRange: number
): MaybeTooltipReturnObject => {
  const deadlineStatus = normalizeTaskDeadlineStatus(task)

  const scheduledDate =
    task.type === 'NORMAL' && task.estimatedCompletionTime
      ? task.estimatedCompletionTime
      : (task.scheduledEnd ?? null)

  if (deadlineStatus === 'none') {
    return {
      title:
        getTaskNoEtaReason(task, workspaceStatuses, autoScheduleRange) ?? '',
      action: undefined,
      etaText: undefined,
    }
  } else if (deadlineStatus === 'missed-deadline') {
    return getMissedDeadlineTooltip(task.dueDate, scheduledDate, pluralize)
  } else if (deadlineStatus === 'scheduled-past-deadline') {
    if (taskScheduledStatus(task) === 'UNFIT_PAST_DUE') {
      if (task.type === 'RECURRING_INSTANCE') {
        return {
          title: "Task ETA can't be estimated",
          action: UNFIT_RECURRING_INSTANCE_MESSAGE,
          etaText: undefined,
        }
      }

      return {
        title: "Task ETA can't be estimated",
        action: `This is because this task can't fit within Motion's ${autoScheduleRange} days auto-schedule window`,
        etaText: undefined,
      }
    }

    return getScheduledPastDeadlineTooltip(
      task.dueDate,
      scheduledDate,
      pluralize
    )
  } else if (deadlineStatus === 'on-track') {
    return getOnTrackTooltip(task.dueDate, scheduledDate, pluralize)
  }
}
