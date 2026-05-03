import z from 'zod/v4'

import { ObjectIdSchema } from '../common'
import { WorkspaceMemberSchema } from '../models/workspace-member'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateWorkspaceMemberRequest =
  WorkspaceMemberSchema.partial().required({
    userId: true,
    role: true,
    workspaceId: true,
  })
export type CreateWorkspaceMemberRequest = z.output<
  typeof CreateWorkspaceMemberRequest
>

export const PushCreateWorkspaceMember = createPushEvent(
  'workspace-member.create',
  1,
  CreateWorkspaceMemberRequest
)
export type PushCreateWorkspaceMember = z.output<
  typeof PushCreateWorkspaceMember
>

export const PushUpdateWorkspaceMember = createPushEvent(
  'workspace-member.update',
  1,
  WorkspaceMemberSchema.pick({
    userId: true,
    workspaceId: true,
  })
)
export type PushUpdateWorkspaceMember = z.output<
  typeof PushUpdateWorkspaceMember
>

export const PushDeleteWorkspaceMember = createPushEvent(
  'workspace-member.delete',
  1,
  ObjectIdSchema.extend({
    workspaceId: z.string(),
  })
)
export type PushDeleteWorkspaceMember = z.output<
  typeof PushDeleteWorkspaceMember
>

export const WorkspaceMemberCreated = createModelSyncEvent(
  'workspace-member.created',
  1,
  ['workspaceMembers']
)
export type WorkspaceMemberCreated = z.output<typeof WorkspaceMemberCreated>

export const WorkspaceMemberUpdated = createModelSyncEvent(
  'workspace-member.updated',
  1,
  ['workspaceMembers']
)

export const WorkspaceMemberDeleted = createModelSyncEvent(
  'workspace-member.deleted',
  1,
  ['workspaceMembers']
)
