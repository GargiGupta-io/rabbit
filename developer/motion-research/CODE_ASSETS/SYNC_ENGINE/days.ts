import z from 'zod/v4'

/**
 * Days of the week
 */
export const DaysOfWeekSchema = z.enum([
  'MO',
  'TU',
  'WE',
  'TH',
  'FR',
  'SA',
  'SU',
])
