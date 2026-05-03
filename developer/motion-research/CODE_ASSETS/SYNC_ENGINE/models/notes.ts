import { COLORS } from '@motion/shared/common'

import { z } from 'zod/v4'

import { IsoDateTimeSchema } from '../common'

export const NoteTargetTypeSchema = z.enum([
  'WORKSPACE',
  'PROJECT',
  // Can be 'USER' if a note is a meeting insights note
  'USER',
])

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetId: z.string(),
  targetType: NoteTargetTypeSchema,
  createdTime: IsoDateTimeSchema,
  updatedTime: IsoDateTimeSchema.nullable(),
  deletedTime: IsoDateTimeSchema.nullable(),
  content: z.any().nullable().optional(),
  metadata: z
    .object({
      isOnboardingDoc: z.boolean().optional(),
    })
    .nullish(),
  createdByUserId: z.string().nullable(),
  color: z.enum(COLORS).default('gray'),
  workspaceId: z.string().nullish(),
  publishedTime: IsoDateTimeSchema.nullish(),
  publishedByUserId: z.string().nullish(),
  version: z.number().default(0),
  parentNoteId: z.string().nullish(),
})
export type NoteSchema = z.infer<typeof NoteSchema>
