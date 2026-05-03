import z from 'zod/v4'

import { ObjectIdSchema } from '../common'
import { StatusSchema } from '../models/status'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateStatusRequest = StatusSchema.partial().required({
  name: true,
  workspaceId: true,
})
export type CreateStatusRequest = z.output<typeof CreateStatusRequest>

export const PushCreateStatus = createPushEvent(
  'status.create',
  1,
  CreateStatusRequest
)
export type PushCreateStatus = z.output<typeof PushCreateStatus>

export const PushUpdateStatus = createPushEvent(
  'status.update',
  1,
  StatusSchema.partial()
    .omit({
      createdTime: true,
      updatedTime: true,
      deletedTime: true,
      autoScheduleSetting: true,
    })
    .required({
      id: true,
    })
    .extend({
      autoScheduleEnabled: z.boolean().optional(),
    })
)
export type PushUpdateStatus = z.output<typeof PushUpdateStatus>

export const PushDeleteStatus = createPushEvent(
  'status.delete',
  1,
  ObjectIdSchema
)
export type PushDeleteStatus = z.output<typeof PushDeleteStatus>

export const StatusCreated = createModelSyncEvent('status.created', 1, [
  'statuses',
])
export type StatusCreated = z.output<typeof StatusCreated>

export const StatusUpdated = createModelSyncEvent('status.updated', 1, [
  'statuses',
])
export const StatusDeleted = createModelSyncEvent('status.deleted', 1, [
  'statuses',
])
