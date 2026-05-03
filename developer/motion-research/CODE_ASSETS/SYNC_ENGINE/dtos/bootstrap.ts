import z from 'zod/v4'

import { createZodDto } from './create-zod-dto'

import { RevisionOutSchema } from '../common'
import { AllModelsSchema } from '../models'

export const BootstrapIncludesSchema = z.enum([
  'labels',
  'statuses',
  'workspaces',
  'users',
  'teams',
  'teamMembers',
  'workspaceMembers',
  'tasks',
  'chunks',
  'notes',
  'projects',
  'stageDefinitions',
  'uploadedFiles',
  'customFields',
  'folders',
  'folderItems',
  'projectDefinitions',
])
export type BootstrapIncludesSchema = z.infer<typeof BootstrapIncludesSchema>

export const BootstrapSnapshotStrategySchema = z.enum(['save', 'skip', 'merge'])
export type BootstrapSnapshotStrategySchema = z.infer<
  typeof BootstrapSnapshotStrategySchema
>

export const BootstrapStrategySchema = z.enum([
  'eager',
  'lazy',
  'workspace',
  'refresh',
])
export type BootstrapStrategySchema = z.infer<typeof BootstrapStrategySchema>

export const BootstrapRequestSchema = z.object({
  workspaceIds: z.string().array().optional(),
  include: BootstrapIncludesSchema.array().optional().default([]),
  snapshotStrategy: BootstrapSnapshotStrategySchema.optional(),
  strategy: BootstrapStrategySchema.optional().default('eager'),
})
export type BootstrapRequestSchema = z.infer<typeof BootstrapRequestSchema>

export const BootstrapResponseSchema = z.object({
  meta: z.object({
    position: RevisionOutSchema,
  }),
  models: AllModelsSchema.partial(),
})
export type BootstrapResponseSchema = z.infer<typeof BootstrapResponseSchema>

export class BootstrapResponse extends createZodDto(BootstrapResponseSchema) {}
