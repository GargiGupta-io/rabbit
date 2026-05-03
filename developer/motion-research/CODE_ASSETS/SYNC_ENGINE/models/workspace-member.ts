import { z } from 'zod/v4'

import { BaseSchema } from './base'

export const WorkspaceMemberRoleSchema = z.enum(['ADMIN', 'MEMBER'])
export const WorkspaceMemberSchema = BaseSchema.extend({
  userId: z.string(),
  role: WorkspaceMemberRoleSchema,
  workspaceId: z.string(),
})
export type WorkspaceMemberSchema = z.output<typeof WorkspaceMemberSchema>
