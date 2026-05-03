import { COLORS } from '@motion/shared/common'

import { z } from 'zod/v4'

import { BaseSchema } from './base'

import { IsoDateTimeSchema } from '../common'

export const FolderTargetTypeSchema = z.enum([
  'FOLDER',
  'PROJECT',
  'TEAM',
  'USER',
  'VIEW',
  'WORKSPACE',
])

/**
 * USER - Any user-created folder
 * USER_WORKSPACES - The folder that houses the user's workspaces
 * WORKSPACE - The folder that houses the workspace's projects/notes
 * MEETING_INSIGHTS - The folder that houses the team/users's meeting insights notes
 */
export const FolderTypeSchema = z.enum([
  'FAVORITES',
  'USER',
  'USER_WORKSPACES',
  'WORKSPACE',
  'SHARED',
  'MEETING_INSIGHTS',
])

export const FolderItemTypeSchema = z.enum([
  'FOLDER',
  'PROJECT',
  'VIEW',
  'NOTE',
  'SHEET',
])

export const BaseFolderItemSchema = BaseSchema.extend({
  folderId: z.string().nullable(),
  itemId: z.string(),
  itemType: FolderItemTypeSchema,
  order: z.string(),
  originalFolderItemId: z.string().nullish(),
  parentFolderItemId: z.string().nullish(),
  name: z.string().nullish(),
  color: z.enum(COLORS).nullish(),

  deletedTime: IsoDateTimeSchema.nullish().default(null),

  folder: z
    .object({
      id: z.string(),
      targetType: FolderTargetTypeSchema,
      targetId: z.string(),
    })
    .optional(),
})

export const FolderSchema = BaseSchema.extend({
  name: z.string().nullable(), // Note: non-user folders do not have a name specified
  color: z.enum(COLORS),
  targetType: FolderTargetTypeSchema,
  targetId: z.string(),
  type: FolderTypeSchema,
})

export const ViewFolderItemMetadataSchema = z.object({
  workspaceId: z.string(),
  projectId: z.string().optional(),
  folderId: z.string().optional(),
})

export const ProjectFolderItemSchema = BaseFolderItemSchema.extend({
  itemType: z.literal('PROJECT'),
})

export const ViewFolderItemSchema = BaseFolderItemSchema.extend({
  itemType: z.literal('VIEW'),
  metadata: ViewFolderItemMetadataSchema.nullish(),
})

export const NoteFolderItemSchema = BaseFolderItemSchema.extend({
  itemType: z.literal('NOTE'),
})

export const FolderFolderItemSchema = BaseFolderItemSchema.extend({
  itemType: z.literal('FOLDER'),
})

export const SheetFolderItemSchema = BaseFolderItemSchema.extend({
  itemType: z.literal('SHEET'),
})

export const FolderItemSchema = z.discriminatedUnion('itemType', [
  ProjectFolderItemSchema,
  ViewFolderItemSchema,
  NoteFolderItemSchema,
  FolderFolderItemSchema,
  SheetFolderItemSchema,
])
