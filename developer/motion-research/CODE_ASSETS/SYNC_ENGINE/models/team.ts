import { z } from 'zod/v4'

import { BaseSchema } from './base'

export const TeamSchema = BaseSchema.extend({
  name: z.string(),
  customerId: z.string().nullable(),
  hasBucketPricing: z.boolean(),
  slug: z.string().min(1).nullable().default(null),
})
export type TeamSchema = z.output<typeof TeamSchema>
