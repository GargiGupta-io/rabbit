import {
  type DeadlineStatusWithReason,
  type ScheduledStatus,
} from '@motion/shared/common'
import { daysBetweenDates } from '@motion/utils/dates'

import { DateTime } from 'luxon'

export const ETA_HOUR_ROUNDING_INTERVAL = 0.25

export type PluralizeFunction = (
  numDays: number,
  singular: string,
  plural: string
) => string | React.ReactNode

export const etaLabels = new Map<
  DeadlineStatusWithReason,
  (
    type?: 'project' | 'stage' | 'task',
    scheduledStatus?: ScheduledStatus | null
  ) => string
>([
  ['none', () => 'No ETA'],
  [
    'ahead-of-schedule',
    (type) => {
      switch (type) {
        case 'project':
          return 'Project is ahead of schedule'
        case 'stage':
          return 'Stage is ahead of schedule'
        case 'task':
          return 'Task is ahead of schedule'
        default:
          return 'Ahead of schedule'
      }
    },
  ],
  [
    'on-track',
    (type) => {
      switch (type) {
        case 'project':
          return 'Project is on track'
        case 'stage':
          return 'Stage is on track'
        case 'task':
          return 'Task is on track'
        default:
          return 'On track'
      }
    },
  ],
  // Need to add specific at-risk cases for project stages, etc.
  ['at-risk', () => 'Warnings'],
  [
    'scheduled-past-deadline',
    (type, scheduledStatus) => {
      switch (type) {
        case 'project':
          return scheduledStatus === 'UNFIT_PAST_DUE'
            ? "Project ETA can't be estimated"
            : 'Project is scheduled past deadline'
        case 'stage':
          return 'Scheduled past deadline'
        case 'task':
          return scheduledStatus === 'UNFIT_PAST_DUE'
            ? "Task ETA can't be estimated"
            : 'Task is scheduled past deadline'
        default:
          return 'Scheduled past deadline'
      }
    },
  ],
  [
    'missed-deadline',
    (type) => {
      switch (type) {
        case 'stage':
          return 'Stage missed deadline'
        default:
          return 'Missed deadline'
      }
    },
  ],
  [
    'canceled',
    (type) => {
      switch (type) {
        case 'project':
          return 'Project is canceled'
        case 'stage':
          return 'Stage is canceled'
        case 'task':
          return 'Task is canceled'
        default:
          return 'Canceled'
      }
    },
  ],
  [
    'completed',
    (type) => {
      switch (type) {
        case 'project':
          return 'Project is completed'
        case 'stage':
          return 'Stage is completed'
        case 'task':
          return 'Task is completed'
        default:
          return 'Completed'
      }
    },
  ],
  ['not-autoscheduled', () => 'Not autoscheduled'],
  ['future-schedulable', () => 'Future schedulable'],
  ['no-due-date', () => 'No due date'],
  ['archived', () => 'Archived'],
])

export const getEtaLabel = (
  status: DeadlineStatusWithReason,
  type?: 'project' | 'stage' | 'task',
  scheduledStatus?: ScheduledStatus | null
) => {
  return (
    etaLabels.get(status)?.(type, scheduledStatus) ??
    etaLabels.get('none')?.(type) ??
    ''
  )
}

export const safeDateDiff = (date1: string | null, date2: string | null) => {
  if (!date1 || !date2) return 0

  const parsedDate1 = DateTime.fromISO(date1).endOf('day')
  const parsedDate2 = DateTime.fromISO(date2).startOf('day')

  return Math.abs(daysBetweenDates(parsedDate1, parsedDate2))
}

export const numHoursBetweenDates = (
  date1: string | null,
  date2: string | null,
  roundingInterval: number = ETA_HOUR_ROUNDING_INTERVAL
) => {
  if (!date1 || !date2) return 0

  const diff = DateTime.fromISO(date1).diff(DateTime.fromISO(date2), 'hours')

  return Math.abs(Math.round(diff.hours / roundingInterval) * roundingInterval)
}

export const numDaysAndHoursBetweenDates = (
  date1: string | null,
  date2: string | null
) => {
  const numDaysMissed = safeDateDiff(date1, date2)

  return {
    numDaysMissed,
    numHoursMissed:
      numDaysMissed === 0 ? numHoursBetweenDates(date1, date2) : 0,
  }
}
