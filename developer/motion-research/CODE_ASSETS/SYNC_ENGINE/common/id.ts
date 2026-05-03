import z from 'zod/v4'

export const WorkspaceItemIdSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
})
export const ObjectIdSchema = z.object({
  id: z.string(),
})
