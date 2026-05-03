import { z } from 'zod/v4'

import { BaseSchema } from './base'

export const LabelSchema = BaseSchema.extend({
  name: z.string().min(1),
  color: z.string().min(1),
  sortPosition: z.string(),
  workspaceId: z.string().min(1),
})
export type LabelSchema = z.output<typeof LabelSchema>
