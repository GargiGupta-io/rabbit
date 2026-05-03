export const ScheduledStatus = {
  ON_TRACK: 'ON_TRACK',
  PAST_DUE: 'PAST_DUE',
  UNFIT_SCHEDULABLE: 'UNFIT_SCHEDULABLE',
  UNFIT_PAST_DUE: 'UNFIT_PAST_DUE',
} as const

export type ScheduledStatus =
  (typeof ScheduledStatus)[keyof typeof ScheduledStatus]

export const isScheduledStatus = (value: unknown): value is ScheduledStatus =>
  typeof value === 'string' && value in ScheduledStatus
