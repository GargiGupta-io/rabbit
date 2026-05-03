import { COLORS } from '@motion/shared/common'

import { z } from 'zod/v4'

import { NoteSchema } from '../models/notes'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateNoteRequest = NoteSchema.extend({
  /**
   * @deprecated content cannot be provided in plaintext anymore.
   */
  content: z.string().optional(),
  metadata: z.object({}).optional(),
  folderId: z.string().optional(),
  parentNoteId: z.string().optional(),
  color: z.enum(COLORS).optional(),
})
  .partial()
  .required({
    title: true,
    targetId: true,
    targetType: true,
  })

export type CreateNoteRequest = z.output<typeof CreateNoteRequest>

export const PushCreateNote = createPushEvent(
  'note.create',
  1,
  CreateNoteRequest
)
export type PushCreateNote = z.output<typeof PushCreateNote>

export const UpdateNoteRequest = CreateNoteRequest.partial()
  .omit({
    parentNoteId: true,
  })
  .extend({
    // Encapsulates changing parentNoteId/projectId that doesn't require
    // a complicated lookup
    parentFolderItemId: z.string().optional(),
    order: z.string().optional(),
  })
  .required({
    id: true,
  })

export const PushUpdateNote = createPushEvent(
  'note.update',
  1,
  UpdateNoteRequest
)
export type PushUpdateNote = z.output<typeof PushUpdateNote>

export const PushDeleteNote = createPushEvent(
  'note.delete',
  1,
  NoteSchema.pick({ id: true })
)
export type PushDeleteNote = z.output<typeof PushDeleteNote>

export const NoteCreated = createModelSyncEvent(
  'note.created',
  1,
  ['notes'],
  ['folderItems']
)
export const NoteUpdated = createModelSyncEvent('note.updated', 1, ['notes'])
export const NoteDeleted = createModelSyncEvent('note.deleted', 1, ['notes'])
