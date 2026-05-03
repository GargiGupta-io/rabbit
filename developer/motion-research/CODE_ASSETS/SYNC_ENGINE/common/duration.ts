import { Duration } from 'luxon'
import { z } from 'zod/v4'

export const ISODurationSchema = z.string().superRefine((value, ctx) => {
  try {
    Duration.fromISO(value)
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'duration must be a valid ISO 8601 Duration',
    })
  }
})
