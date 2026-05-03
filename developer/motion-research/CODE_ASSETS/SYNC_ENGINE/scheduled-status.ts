import { z } from 'zod/v4'

export const ScheduledStatusSchema = z.enum([
  'ON_TRACK',
  'PAST_DUE',
  'UNFIT_SCHEDULABLE',
  'UNFIT_PAST_DUE',
])
export type ScheduledStatusSchema = z.infer<typeof ScheduledStatusSchema>
