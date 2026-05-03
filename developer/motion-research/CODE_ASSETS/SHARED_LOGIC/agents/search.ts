import z from 'zod/v4'

export const AGENT_VARIABLE_INTERNAL_RESULTS_ID = '__internal_results_id'

export const AGENT_VARIABLE_INTERNAL_FOLDER_STRUCTURE =
  '__internal_folder_structure'

export const SupportedEntityTypes = [
  'task',
  'recurringTask',
  'project',
  'note',
  'event',
] as const
export type SupportedEntityType = (typeof SupportedEntityTypes)[number]

const InternalResultSchema = z.object({
  id: z.string(),
  type: z.enum(SupportedEntityTypes),
  // This is only set for events
  providerId: z.string().optional(),
})

export const InternalResultsSchema = z.array(InternalResultSchema)

export type InternalResults = z.infer<typeof InternalResultsSchema>
