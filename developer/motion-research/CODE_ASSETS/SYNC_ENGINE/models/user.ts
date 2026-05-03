import { z } from 'zod/v4'

import { BaseSchema } from './base'

export const UserSchema = BaseSchema.extend({
  name: z.string().min(1),
  email: z.string().min(1),
  picture: z.string().nullable(),

  isPlaceholder: z.boolean(),
  hasActiveSubscription: z.boolean(),

  onboardingComplete: z.boolean(),
})

export type UserSchema = z.infer<typeof UserSchema>
