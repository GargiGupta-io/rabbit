import z from 'zod/v4'

import { BaseSchema } from './base'

export const TeamMemberRoleSchema = z.enum(['ADMIN', 'MEMBER', 'GUEST'])

export const TeamMemberStatusSchema = z.enum(['Active', 'Inactive'])

export const TeamMemberSchema = BaseSchema.extend({
  userId: z.string(),
  role: TeamMemberRoleSchema,
  status: TeamMemberStatusSchema,
  allowOthersToAutoSchedule: z.boolean(),
  teamId: z.string(),
})
export type TeamMemberSchema = z.output<typeof TeamMemberSchema>
