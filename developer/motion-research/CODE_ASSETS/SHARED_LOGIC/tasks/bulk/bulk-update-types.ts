import { z } from 'zod/v4'

import { DeadlineTypes, PriorityLevels, StringDateSchema } from '../../common'
import { BulkOpsCustomFieldsSchema } from '../../custom-fields'

// at least one of these fields should be populated
// guarding against all of them being optional breaks the
// discriminated union logic...
export const BulkFieldUpdateSchema = z.object({
  type: z.literal('bulk-field-update'),
  assigneeUserId: z.string().nullish(),
  statusId: z.string().optional(),
  isAutoScheduled: z.boolean().optional(),
  priorityLevel: z.enum(PriorityLevels).optional(),
  startDate: StringDateSchema.nullish(),
  dueDate: StringDateSchema.nullish(),
  duration: z.number().int().nullish(),
  stageDefinitionId: z.string().nullish(),
  ignoreWarnOnPastDue: z.boolean().optional(),
  deadlineType: z.enum(DeadlineTypes).optional(),
  labels: z
    .object({
      id: z.string(),
      operation: z.enum(['add', 'remove']),
    })
    .array()
    .optional(),
  customFieldValues: z.record(z.string(), BulkOpsCustomFieldsSchema).optional(),
})

export const BulkArchiveSchema = z.object({
  type: z.literal('bulk-archive'),
})

export type BulkArchiveSchema = z.infer<typeof BulkArchiveSchema>

export const BulkDeleteSchema = z.object({
  type: z.literal('bulk-delete'),
})

export type BulkDeleteSchema = z.infer<typeof BulkDeleteSchema>

export type BulkFieldUpdateSchema = z.infer<typeof BulkFieldUpdateSchema>

export const BulkLocationUpdateSchema = z.object({
  type: z.literal('bulk-location-update'),
  workspaceId: z.string(),
  projectId: z.string().nullish(),
})

export type BulkLocationUpdateSchema = z.infer<typeof BulkLocationUpdateSchema>

export const BulkShiftSchema = z.object({
  type: z.literal('bulk-shift'),
  shift: z.object({
    start: z.number().default(0),
    due: z.number().default(0),
    dueBoundary: StringDateSchema.optional(),
  }),
})

export type BulkShiftSchema = z.infer<typeof BulkShiftSchema>

export const BulkUpdateSchema = z.discriminatedUnion('type', [
  BulkArchiveSchema,
  BulkDeleteSchema,
  BulkFieldUpdateSchema,
  BulkLocationUpdateSchema,
  BulkShiftSchema,
])

export type BulkUpdateSchema = z.infer<typeof BulkUpdateSchema>

export type StageStatusUpdate = {
  type: 'stage-status-updated'
}

export type ProjectStatusUpdate = {
  type: 'project-status-updated'
}

export type ProjectStageRemoved = {
  type: 'project-stage-removed'
}

export type ProjectStageChanged = {
  type: 'project-stage-changed'
}

// can add more types here
export type TriggerContext =
  | StageStatusUpdate
  | ProjectStatusUpdate
  | ProjectStageRemoved
  | ProjectStageChanged
