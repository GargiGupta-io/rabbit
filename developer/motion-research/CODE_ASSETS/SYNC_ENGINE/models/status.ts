import { AutoScheduleSetting, StatusType } from '@motion/shared/common'

import { z } from 'zod/v4'

import { BaseSchema } from './base'

export const StatusSchema = BaseSchema.extend({
  name: z.string().min(1),
  color: z.string().min(1),
  workspaceId: z.string().min(1),
  sortPosition: z.string(),
  isSystemStatus: z.boolean(),
  type: z.enum(StatusType).nullable(),
  autoScheduleSetting: z.enum(AutoScheduleSetting),
})
export type StatusSchema = z.output<typeof StatusSchema>
