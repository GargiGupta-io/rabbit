import z from 'zod/v4'

export const ReconciliationTriggerTypes = [
  'project-definition-updated',
  'stage-definition-updated',
  'stage-definition-deleted',
  'project-created',
  'project-updated',
  'manual',
] as const

export type ReconciliationTriggerType =
  (typeof ReconciliationTriggerTypes)[number]

export const ReconcileByProjectDefinitionRequestSchema = z.object({
  type: z.literal('reconcile-by-project-definition'),
  projectDefinitionId: z.string(),
  trigger: z.enum(ReconciliationTriggerTypes).optional(),
})

export type ReconcileByProjectDefinitionRequest = z.infer<
  typeof ReconcileByProjectDefinitionRequestSchema
>

export const ReconcileByProjectRequestSchema = z.object({
  type: z.literal('reconcile-by-project'),
  projectId: z.string(),
  initialize: z.boolean().optional(),
  trigger: z.enum(ReconciliationTriggerTypes).optional(),
})

export type ReconcileByProjectRequest = z.infer<
  typeof ReconcileByProjectRequestSchema
>

export const ReconcileByStageDefinitionRequestSchema = z.object({
  type: z.literal('reconcile-by-stage-definition'),
  stageDefinitionId: z.string(),
  trigger: z.enum(ReconciliationTriggerTypes).optional(),
})

export type ReconcileByStageDefinitionRequest = z.infer<
  typeof ReconcileByStageDefinitionRequestSchema
>
