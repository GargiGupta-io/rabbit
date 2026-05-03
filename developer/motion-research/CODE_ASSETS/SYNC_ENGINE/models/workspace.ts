import { z } from 'zod/v4'

import { BaseSchema } from './base'

/**
 * Workspace schema stuff
 */
export const WorkspaceSchema = BaseSchema.extend({
  uniquenessId: z.string().min(1),
  name: z.string().min(1),
  teamId: z.string().nullable(),
  type: z.enum(['INDIVIDUAL', 'TEAM']),
  systemType: z.enum(['sales']).nullable(),
})
export type WorkspaceSchema = z.output<typeof WorkspaceSchema>
