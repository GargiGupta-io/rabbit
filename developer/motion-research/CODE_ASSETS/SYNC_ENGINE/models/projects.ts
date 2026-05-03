import { COLORS } from '@motion/shared/common'
import { CustomFieldValuesSchema } from '@motion/shared/custom-fields'

import z from 'zod/v4'

import { BaseSchema } from './base'
import { StageSchema, VariableInstanceSchema } from './project-definitions'

import {
  IsoDateSchema,
  IsoDateTimeSchema,
  PriorityLevelSchema,
  ScheduledStatusSchema,
} from '../common'

export const ProjectTypeSchema = z.enum(['NORMAL'])

/** @sort-keys */
export const ProjectSchema = BaseSchema.extend({
  activeStageDefinitionId: z.string().nullable(),
  canceledDuration: z.number(),
  canceledTaskCount: z.number(),
  color: z.enum(COLORS).default('gray'),
  completedDuration: z.number(),
  completedTaskCount: z.number(),
  createdByUserId: z.string(),

  customFieldValues: z.record(z.string(), CustomFieldValuesSchema).default({}),
  description: z
    .string()
    .nullable()
    .transform((d) => d ?? ''),

  dueDate: IsoDateSchema.nullable(),
  duration: z.number(),
  estimatedCompletionTime: IsoDateTimeSchema.nullable(),
  folderId: z.string().nullable(),
  labelIds: z.string().array(),
  managerId: z.string().nullable(),
  name: z.string().min(1),
  priorityLevel: PriorityLevelSchema,
  projectDefinitionId: z.string().nullable(),
  scheduledStatus: ScheduledStatusSchema.nullable(),

  stages: StageSchema.array().default([]),
  startDate: IsoDateSchema.nullable(),
  statusId: z.string(),

  taskCount: z.number(),
  type: ProjectTypeSchema,

  uploadedFileIds: z.string().array().default([]),

  variableInstances: VariableInstanceSchema.array().default([]),
  workspaceId: z.string().min(1),
})
export type ProjectSchema = z.infer<typeof ProjectSchema>
