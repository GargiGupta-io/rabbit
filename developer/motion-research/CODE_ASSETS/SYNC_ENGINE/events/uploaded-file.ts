import z from 'zod/v4'

import { UploadedFileSchema } from '../models/uploaded-file'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const UpdateUploadedFileRequest = UploadedFileSchema.partial().required({
  id: true,
  fileName: true,
})
export type UpdateUploadedFileRequest = z.output<
  typeof UpdateUploadedFileRequest
>

export const PushUpdateUploadedFile = createPushEvent(
  'uploaded-file.update',
  1,
  UpdateUploadedFileRequest
)
export type PushUpdateUploadedFile = z.output<typeof PushUpdateUploadedFile>

export const DeleteUploadedFileRequest = UploadedFileSchema.partial().required({
  id: true,
})
export type DeleteUploadedFileRequest = z.output<
  typeof DeleteUploadedFileRequest
>

export const PushDeleteUploadedFile = createPushEvent(
  'uploaded-file.delete',
  1,
  DeleteUploadedFileRequest
)
export type PushDeleteUploadedFile = z.output<typeof PushDeleteUploadedFile>

export const UploadedFileCreated = createModelSyncEvent(
  'uploaded-file.created',
  1,
  ['uploadedFiles']
)

export const UploadedFileUpdated = createModelSyncEvent(
  'uploaded-file.updated',
  1,
  ['uploadedFiles']
)

export const UploadedFileDeleted = createModelSyncEvent(
  'uploaded-file.hard-deleted',
  1,
  ['uploadedFiles']
)
