import { ShortTextSchema } from '@motion/shared/common'

import z from 'zod/v4'

import { BaseSchema } from './base'

export const UploadedFileTargetTypeSchema = z.enum([
  'TEAM_TASK',
  'PROJECT',
  'TASK_DEFINITION',
  'PROJECT_DEFINITION',
  'NOTE',
  'CONTACT',
  'COMPANY',
  'DEAL',
])

export const UploadedFileTypeSchema = z.enum([
  'attachment',
  'description-image',
])

export const UploadedFileSchema = BaseSchema.extend({
  id: ShortTextSchema,
  type: UploadedFileTypeSchema,
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: ShortTextSchema,

  createdByUserId: ShortTextSchema,
  workspaceId: ShortTextSchema.nullable(),
  targetType: UploadedFileTargetTypeSchema.nullable(),
  targetId: ShortTextSchema.nullable(),
}).omit({ deletedTime: true })
