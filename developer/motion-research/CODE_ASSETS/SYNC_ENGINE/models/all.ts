import { CustomFieldSchema } from '@motion/shared/custom-fields'

import z from 'zod/v4'

import { CalendarEventSchema } from './calendar-events'
import { CalendarSchema } from './calendars'
import { BaseFolderItemSchema, FolderSchema } from './folders'
import { LabelSchema } from './label'
import { NoteSchema } from './notes'
import {
  ProjectDefinitionSchema,
  StageDefinitionSchema,
} from './project-definitions'
import { ProjectSchema } from './projects'
import { StatusSchema } from './status'
import { TaskScheduledEntitySchema, TaskSchema } from './task'
import { TeamSchema } from './team'
import { TeamMemberSchema } from './team-member'
import { UploadedFileSchema } from './uploaded-file'
import { UserSchema } from './user'
import { WorkspaceSchema } from './workspace'
import { WorkspaceMemberSchema } from './workspace-member'

/** @sort-keys */
export const AllModelsSchema = z.object({
  calendarEvents: z.record(z.string(), CalendarEventSchema),
  calendars: z.record(z.string(), CalendarSchema),
  chunks: z.record(z.string(), TaskScheduledEntitySchema),
  customFields: z.record(z.string(), CustomFieldSchema),
  folderItems: z.record(z.string(), BaseFolderItemSchema),
  folders: z.record(z.string(), FolderSchema),
  labels: z.record(z.string(), LabelSchema),
  notes: z.record(z.string(), NoteSchema),
  projectDefinitions: z.record(z.string(), ProjectDefinitionSchema),
  projects: z.record(z.string(), ProjectSchema),
  stageDefinitions: z.record(z.string(), StageDefinitionSchema),
  statuses: z.record(z.string(), StatusSchema),
  tasks: z.record(z.string(), TaskSchema),
  teamMembers: z.record(z.string(), TeamMemberSchema),
  teams: z.record(z.string(), TeamSchema),
  uploadedFiles: z.record(z.string(), UploadedFileSchema),
  users: z.record(z.string(), UserSchema),
  workspaceMembers: z.record(z.string(), WorkspaceMemberSchema),
  workspaces: z.record(z.string(), WorkspaceSchema),
})

export type AllModelsSchema = z.output<typeof AllModelsSchema>
export type AllModelsSchemaInput = z.input<typeof AllModelsSchema>

export const ModelNames = Object.keys(AllModelsSchema.shape) as ModelNames[]
export type ModelNames = keyof z.output<typeof AllModelsSchema>

export type ModelCollectionOf<T extends ModelNames> = AllModelsSchema[T]
export type ModelOf<T extends ModelNames> = ModelCollectionOf<T>[string]
export type SchemaOf<T extends ModelNames> =
  (typeof AllModelsSchema)['shape'][T]['valueType']

export type PartialAllModelsSchema<T extends ModelNames = ModelNames> = Partial<
  Record<T, ModelCollectionOf<T>>
>

/**
 * Schema for storing partial model updates (only changed fields + id)
 * Used when backend sends partial updates that need to be merged with existing data
 */
export type PartialModelsSchema<T extends ModelNames = ModelNames> = Partial<
  Record<T, Record<string, Partial<ModelOf<T>> & { id: string }>>
>
