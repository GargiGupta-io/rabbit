import z from 'zod/v4'

import { WorkspaceMemberSchema } from '../models'
import { AllModelsSchema } from '../models/all'
import { UserSchema } from '../models/user'
import { createModelSyncEvent, createSyncEvent } from '../utils/create-events'

export const UserCreated = createModelSyncEvent('user.created', 1, ['users'])
export type UserCreated = z.output<typeof UserCreated>

export const UserUpdated = createModelSyncEvent('user.updated', 1, ['users'])
export type UserUpdated = z.output<typeof UserUpdated>

export const UserDeleted = createSyncEvent(
  'user.deleted',
  1,
  z.object({
    models: AllModelsSchema.pick({ users: true }).default({
      users: {},
    }),
    partials: z
      .object({
        users: z.record(
          z.string(),
          UserSchema.partial().required({ id: true })
        ),
      })
      .default({ users: {} }),
  })
)
export type UserDeleted = z.output<typeof UserDeleted>

export const UserAddedToWorkspaceEventSchema = createSyncEvent(
  'user.added-to-workspace',
  1,
  WorkspaceMemberSchema
)

export const UserRemovedFromWorkspaceEventSchema = createSyncEvent(
  'user.removed-from-workspace',
  1,
  WorkspaceMemberSchema
)
