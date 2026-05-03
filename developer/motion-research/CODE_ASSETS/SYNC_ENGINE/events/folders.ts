import { COLORS } from '@motion/shared/common'

import z from 'zod/v4'

import { AllModelsSchema } from '../models/all'
import {
  FolderItemTypeSchema,
  ViewFolderItemMetadataSchema,
} from '../models/folders'
import { createPushEvent, createSyncEvent } from '../utils/create-events'

export const FolderCreated = createSyncEvent(
  'folder.created',
  1,
  z.object({ models: AllModelsSchema.pick({ folders: true }) })
)

export const FolderUpdated = createSyncEvent(
  'folder.updated',
  1,
  z.object({ models: AllModelsSchema.pick({ folders: true }) })
)

// need to include the changes to the other changes
export const FolderDeleted = createSyncEvent(
  'folder.deleted',
  1,
  z.object({
    models: AllModelsSchema.pick({ folders: true }),
  })
)

export const FolderItemCreated = createSyncEvent(
  'folder-item.created',
  1,
  z.object({ models: AllModelsSchema.pick({ folderItems: true }) })
)

export const FolderItemUpdated = createSyncEvent(
  'folder-item.updated',
  1,
  z.object({ models: AllModelsSchema.pick({ folderItems: true }) })
)

export const FolderItemDeleted = createSyncEvent(
  'folder-item.deleted',
  1,
  z.object({
    models: AllModelsSchema.pick({ folderItems: true }),
  })
)

// #region push events
export const PushFolderCreate = createPushEvent(
  'folder.create',
  1,
  z.object({
    name: z.string(),
    color: z.enum(COLORS).optional(),
    parentFolderId: z.string(),
    order: z.string().optional(),
  })
)
export type PushFolderCreate = z.output<typeof PushFolderCreate>

export const PushFolderUpdate = createPushEvent(
  'folder.update',
  1,
  z
    .object({
      id: z.string(),
      name: z.string().optional(),
      color: z.enum(COLORS).optional(),
    })
    .refine((data) => {
      return Object.keys(data).length > 0
    }, 'At least one field is required')
)
export type PushFolderUpdate = z.output<typeof PushFolderUpdate>

export const PushFolderDelete = createPushEvent(
  'folder.delete',
  1,
  z.object({ id: z.string() })
)
export type PushFolderDelete = z.output<typeof PushFolderDelete>

export const PushFolderItemCreate = createPushEvent(
  'folder-item.create',
  1,
  z.object({
    folderId: z.string(),
    itemId: z.string(),
    itemType: FolderItemTypeSchema,
    order: z.string().optional(),
    metadata: ViewFolderItemMetadataSchema.optional(),
  })
)
export type PushFolderItemCreate = z.output<typeof PushFolderItemCreate>

export const PushFolderItemUpdate = createPushEvent(
  'folder-item.update',
  1,
  z
    .object({
      id: z.string(),
      parentFolderId: z.string().optional(),
      parentFolderItemId: z.string().optional(),
      order: z.string().optional(),
    })
    .refine((data) => {
      return Object.keys(data).length > 0
    }, 'At least one field is required')
)
export type PushFolderItemUpdate = z.output<typeof PushFolderItemUpdate>

export const PushFolderItemDelete = createPushEvent(
  'folder-item.delete',
  1,
  z.object({
    id: z.string(),
  })
)
export type PushFolderItemDelete = z.output<typeof PushFolderItemDelete>

export const PushFolderItemFavorite = createPushEvent(
  'folder-item.favorite',
  1,
  z.object({
    id: z.string(),
  })
)
export type PushFolderItemFavorite = z.output<typeof PushFolderItemFavorite>
// #endregion
