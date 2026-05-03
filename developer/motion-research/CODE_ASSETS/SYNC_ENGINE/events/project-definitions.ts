import { COLORS } from '@motion/shared/common'
import { CustomFieldValuesSchema } from '@motion/shared/custom-fields'
import {
  CreateProjectDefinition,
  UpsertStageDefinition,
  UpsertTaskDefinition,
} from '@motion/shared/flows'

import z from 'zod/v4'

import { PriorityLevelSchema } from '../common'
import {
  StageDefinitionSchema,
  TaskDefinitionRelativeInterval,
  TaskDefinitionSchema,
  VariableDefinitionSchema,
} from '../models/project-definitions'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'
import { ensureOutputType } from '../utils/zod'

export const UpsertProjectDefinitionStageDefinitionSchema = z.object({
  id: z.string().optional(),
  stageDefinitionId: z.string().min(1),
})

export const UpsertTaskDefinitionSchema =
  ensureOutputType<UpsertTaskDefinition>()(
    TaskDefinitionSchema.omit({
      id: true,
      scheduleMeetingWithinDays: true,
      startRelativeInterval: true,
      dueRelativeInterval: true,
      // TODO: Remove when FE is always sending a blocked by array.
      blockedByTaskIds: true,
    }).extend({
      id: z.string().optional(),
      scheduleMeetingWithinDays: z.number().int().nullish(),
      startRelativeInterval: TaskDefinitionRelativeInterval.optional(),
      dueRelativeInterval: TaskDefinitionRelativeInterval.optional(),
      // TODO: Remove when FE is always sending a blocked by array.
      blockedByTaskIds: z.string().array().optional(),
    })
  )

export const UpsertVariableDefinitionSchema = VariableDefinitionSchema.omit({
  id: true,
  used: true,
}).extend({ id: z.string().optional() })

export const UpsertStageDefinitionSchema =
  ensureOutputType<UpsertStageDefinition>()(
    StageDefinitionSchema.omit({
      id: true,
      tasks: true,
      workspaceId: true,
      variables: true,
    }).extend({
      id: z.string().optional(),
      tasks: UpsertTaskDefinitionSchema.array().max(100),
      variables: UpsertVariableDefinitionSchema.array().max(60).default([]),
    })
  )

export const CreateProjectDefinitionSchema =
  ensureOutputType<CreateProjectDefinition>()(
    z.object({
      workspaceId: z.string(),
      name: z.string().min(1),
      definitionDescription: z.string().max(100).optional(),
      description: z.string(),
      color: z.enum(COLORS).optional(),
      managerId: z.string().min(1).nullable(),
      priorityLevel: PriorityLevelSchema,
      labelIds: z.string().array(),
      stageDefinitionReferences:
        UpsertProjectDefinitionStageDefinitionSchema.array()
          .max(50)
          .default([]),
      stages: UpsertStageDefinitionSchema.array().max(50),
      variables: UpsertVariableDefinitionSchema.array().max(60),
      customFieldValues: z
        .record(z.string(), CustomFieldValuesSchema)
        .optional(),
      uploadedFileIds: z.string().array().optional(),
      folderId: z.string().nullish(),
    })
  )

export const CreateProjectDefinitionRequestModeSchema = z.enum([
  'ai-generation',
  'user',
])

export const CreateProjectDefinitionRequestSchema = z.object({
  definition: CreateProjectDefinitionSchema,
  mode: CreateProjectDefinitionRequestModeSchema.optional(),
})

export const PushCreateProjectDefinition = createPushEvent(
  'project-definition.create',
  1,
  CreateProjectDefinitionRequestSchema
)

export type PushCreateProjectDefinition = z.output<
  typeof PushCreateProjectDefinition
>

export const PushUpdateProjectDefinition = createPushEvent(
  'project-definition.update',
  1,
  CreateProjectDefinitionRequestSchema.extend({
    id: z.string().min(1),
  })
)

export type PushUpdateProjectDefinition = z.output<
  typeof PushUpdateProjectDefinition
>

export const PushCopyProjectDefinition = createPushEvent(
  'project-definition.copy',
  1,
  z.object({
    workspaceId: z.string(),
    id: z.string(),
    destinationWorkspaceId: z.string(),
  })
)

export type PushCopyProjectDefinition = z.output<
  typeof PushCopyProjectDefinition
>

export const PushDeleteProjectDefinition = createPushEvent(
  'project-definition.delete',
  1,
  z.object({
    workspaceId: z.string(),
    id: z.string(),
  })
)

export type PushDeleteProjectDefinition = z.output<
  typeof PushDeleteProjectDefinition
>

export const ProjectDefinitionCreated = createModelSyncEvent(
  'project-definition.created',
  1,
  ['projectDefinitions']
)
export type ProjectDefinitionCreated = z.output<typeof ProjectDefinitionCreated>

export const ProjectDefinitionUpdated = createModelSyncEvent(
  'project-definition.updated',
  1,
  ['projectDefinitions']
)
export type ProjectDefinitionUpdated = z.output<typeof ProjectDefinitionUpdated>

export const ProjectDefinitionDeleted = createModelSyncEvent(
  'project-definition.hard-deleted',
  1,
  ['projectDefinitions']
)
export type ProjectDefinitionDeleted = z.output<typeof ProjectDefinitionDeleted>
