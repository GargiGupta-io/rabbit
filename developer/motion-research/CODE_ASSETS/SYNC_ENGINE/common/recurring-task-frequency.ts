import z from 'zod/v4'

export const RecurringTaskFrequencySchema = z.enum([
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
])
