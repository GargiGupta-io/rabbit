import { z } from 'zod/v4'

import {
  ISODurationSchema,
  PriorityLevels,
  ShortTextSchema,
  StringDateSchema,
} from '../../common'
import { BulkOpsCustomFieldsSchema } from '../../custom-fields'

export const ProjectServiceBulkFieldUpdate = z.object({
  type: z.literal('bulk-project-field-update'),
  priorityLevel: z.enum(PriorityLevels).optional(),
  dueDate: z
    .union([
      StringDateSchema,
      z.object({
        relative: ISODurationSchema,
      }),
    ])
    .optional(),
  statusId: z.string().optional(),
  color: z.string().optional(),
  managerId: z.string().nullish(),
  isAutoScheduled: z.boolean().optional(),
  labels: z
    .object({
      id: z.string(),
      operation: z.enum(['add', 'remove']),
    })
    .array()
    .optional(),
  customFieldValues: z.record(z.string(), BulkOpsCustomFieldsSchema).optional(),
})

export type ProjectServiceBulkFieldUpdate = z.infer<
  typeof ProjectServiceBulkFieldUpdate
>

export const ProjectServiceBulkLocationUpdate = z.object({
  type: z.literal('bulk-project-location-update'),
  folderId: ShortTextSchema.nullish(),
  workspaceId: ShortTextSchema.optional(),
})

export type ProjectServiceBulkLocationUpdate = z.infer<
  typeof ProjectServiceBulkLocationUpdate
>

export const ProjectServiceBulkShiftUpdate = z.object({
  type: z.literal('bulk-project-shift-project'),
  startDate: z.union([
    StringDateSchema,
    z.object({
      relative: ISODurationSchema,
    }),
  ]),
})

export type ProjectServiceBulkShiftUpdate = z.infer<
  typeof ProjectServiceBulkShiftUpdate
>

export const ProjectServiceBulkStageUpdate = z.object({
  type: z.literal('bulk-project-stage-update'),
  stageDefinitionId: ShortTextSchema,
})

export type ProjectServiceBulkStageUpdate = z.infer<
  typeof ProjectServiceBulkStageUpdate
>

export const BulkProjectUpdateSchema = z.discriminatedUnion('type', [
  ProjectServiceBulkLocationUpdate,
  ProjectServiceBulkFieldUpdate,
  ProjectServiceBulkShiftUpdate,
  ProjectServiceBulkStageUpdate,
])

export type BulkProjectUpdateSchema = z.infer<typeof BulkProjectUpdateSchema>
