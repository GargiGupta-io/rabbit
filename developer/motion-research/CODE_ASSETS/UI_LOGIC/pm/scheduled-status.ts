import { type ScheduledStatusSchema } from '@motion/rpc-types'

export const scheduledStatusLabels = new Map<
  ScheduledStatusSchema | null,
  string
>([
  [null, 'Not scheduled'],
  ['ON_TRACK', 'On track'],
  ['PAST_DUE', 'Past deadline'],
  ['UNFIT_PAST_DUE', 'Unfit past due'],
  ['UNFIT_SCHEDULABLE', 'Scheduled past deadline'],
])
