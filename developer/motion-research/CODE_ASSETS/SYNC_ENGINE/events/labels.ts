import z from 'zod/v4'

import { ObjectIdSchema } from '../common'
import { LabelSchema } from '../models/label'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateLabelRequest = LabelSchema.partial().required({
  name: true,
  workspaceId: true,
})
export type CreateLabelRequest = z.output<typeof CreateLabelRequest>

export const PushCreateLabel = createPushEvent(
  'label.create',
  1,
  CreateLabelRequest
)
export type PushCreateLabel = z.output<typeof PushCreateLabel>

export const PushUpdateLabel = createPushEvent(
  'label.update',
  1,
  LabelSchema.pick({
    id: true,
  }).extend({
    name: LabelSchema.shape.name.optional(),
    color: LabelSchema.shape.color.optional(),
  })
)
export type PushUpdateLabel = z.output<typeof PushUpdateLabel>

export const PushDeleteLabel = createPushEvent(
  'label.delete',
  1,
  ObjectIdSchema
)
export type PushDeleteLabel = z.output<typeof PushDeleteLabel>

export const LabelCreated = createModelSyncEvent('label.created', 1, ['labels'])
export type LabelCreated = z.output<typeof LabelCreated>

export const LabelUpdated = createModelSyncEvent('label.updated', 1, ['labels'])
export type LabelUpdated = z.output<typeof LabelUpdated>

export const LabelDeleted = createModelSyncEvent('label.deleted', 1, ['labels'])
export type LabelDeleted = z.output<typeof LabelDeleted>
