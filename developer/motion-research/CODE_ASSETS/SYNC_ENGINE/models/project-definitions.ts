import { COLORS, DeadlineTypes } from '@motion/shared/common'
import { CustomFieldValuesSchema } from '@motion/shared/custom-fields'
import {
  ProjectDefinition,
  ProjectDefinitionStageDefinition,
  RelativeIntervalReferenceTypes,
  RelativeIntervalUnits,
  StageDefinition,
  TaskDefinition,
  VariableDefinition,
  VariableTypes,
} from '@motion/shared/flows'

import { z } from 'zod/v4'

import {
  IsoDateSchema,
  IsoDateTimeSchema,
  PriorityLevelSchema,
  ScheduledStatusSchema,
} from '../common'
import { ensureOutputType } from '../utils/zod'

export const VariableDefinitionType = z.enum(VariableTypes)

export const VariableDefinitionSchema = ensureOutputType<VariableDefinition>()(
  /** @sort-keys */
  z.object({
    color: z.enum(COLORS),
    id: z.string().min(1),
    key: z.string().min(1),
    name: z.string().min(1),
    type: VariableDefinitionType.default('text'),
    used: z.boolean().optional(),
  })
)

export const VariableInstanceSchema = z.object({
  variableId: z.string().min(1),
  value: z.string().nullable(),
})

export const RelativeIntervalDuration = z.object({
  unit: z.enum(RelativeIntervalUnits),
  value: z.number().int(),
})

export const TaskDefinitionRelativeInterval = z.object({
  referenceType: z.enum(RelativeIntervalReferenceTypes),
  referenceId: z.string().nullish(),

  duration: RelativeIntervalDuration,
})

export const TaskDefinitionSchema = ensureOutputType<TaskDefinition>()(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    statusId: z.string().min(1),
    assigneeUserId: z.string().min(1).nullable(),
    assigneeVariableKey: z.string().nullable(),
    duration: z.number().int().nullable(),
    minimumDuration: z.number().int().nullable(),
    priorityLevel: PriorityLevelSchema,
    isAutoScheduled: z.boolean(),
    blockedByTaskIds: z.string().array(),
    description: z.string(),
    labelIds: z.string().array(),
    customFieldValues: z.record(z.string(), CustomFieldValuesSchema).optional(),
    scheduleMeetingWithinDays: z.number().int().nullable(),
    deadlineType: z.enum(DeadlineTypes).optional(),
    startRelativeInterval: TaskDefinitionRelativeInterval,
    dueRelativeInterval: TaskDefinitionRelativeInterval,
  })
)
export type TaskDefinitionSchema = z.infer<typeof TaskDefinitionSchema>

export const StageDefinitionSchema = ensureOutputType<
  // TODO(flows-m5): remove after we remove rank from stage definition
  Omit<StageDefinition, 'rank'>
>()(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    color: z.enum(COLORS),
    duration: RelativeIntervalDuration,
    tasks: TaskDefinitionSchema.array().max(100),
    workspaceId: z.string(),
    variables: VariableDefinitionSchema.array().max(60).default([]),
  })
)
export type StageDefinitionSchema = z.infer<typeof StageDefinitionSchema>

export const ProjectDefinitionStageDefinitionSchema =
  ensureOutputType<ProjectDefinitionStageDefinition>()(
    z.object({
      id: z.string().min(1),
      rank: z.string().min(1),
      stageDefinitionId: z.string().min(1),
      projectDefinitionId: z.string().min(1),
    })
  )
export type ProjectDefinitionStageDefinitionSchema = z.infer<
  typeof ProjectDefinitionStageDefinitionSchema
>

export const ProjectDefinitionSchema = ensureOutputType<ProjectDefinition>()(
  z.object({
    id: z.string().min(1),
    workspaceId: z.string(),
    name: z.string().min(1),
    color: z.enum(COLORS),
    description: z.string(),
    definitionDescription: z.string().max(100).optional(),
    managerId: z.string().min(1).nullable(),
    createdByUserId: z.string(),
    priorityLevel: PriorityLevelSchema,
    labelIds: z.string().array(),
    stageDefinitionReferences:
      ProjectDefinitionStageDefinitionSchema.array().max(50),
    stages: StageDefinitionSchema.array().max(50),
    variables: VariableDefinitionSchema.array().max(60),
    customFieldValues: z.record(z.string(), CustomFieldValuesSchema).optional(),
    folderId: z.string().nullish(),
  })
)
export type ProjectDefinitionSchema = z.infer<typeof ProjectDefinitionSchema>

export const StageSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.enum(COLORS),
  rank: z.string(),
  dueDate: IsoDateSchema,
  visited: z.boolean(),
  canceledTime: IsoDateTimeSchema.nullable(),
  completedTime: IsoDateTimeSchema.nullable(),
  stageDefinitionId: z.string(),
  completedDuration: z
    .number()
    .nullable()
    .transform((d) => d ?? 0),
  completedTaskCount: z.number(),
  canceledDuration: z
    .number()
    .nullable()
    .transform((d) => d ?? 0),
  canceledTaskCount: z.number(),
  duration: z
    .number()
    .nullable()
    .transform((d) => d ?? 0),
  taskCount: z.number(),
  // deadlineStatus: DeadlineStatusSchema.default('none'),
  scheduledStatus: ScheduledStatusSchema.nullable(),
  estimatedCompletionTime: IsoDateTimeSchema.nullable(),
})
export type StageSchema = z.infer<typeof StageSchema>
