import z from 'zod/v4'

import { ObjectIdSchema } from '../common'
import { WorkspaceSchema } from '../models/workspace'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateWorkspaceRequest = WorkspaceSchema.pick({
  name: true,
  type: true,
}).extend({
  workspaceIdToCopy: z.string().min(1).optional(),
  teamId: z.string().min(1).nullish(),
  userIds: z.string().array().optional(),
})
export type CreateWorkspaceRequest = z.output<typeof CreateWorkspaceRequest>

export const PushCreateWorkspace = createPushEvent(
  'workspace.create',
  1,
  CreateWorkspaceRequest
)
export type PushCreateWorkspace = z.output<typeof PushCreateWorkspace>

export const PushUpdateWorkspace = createPushEvent(
  'workspace.update',
  1,
  WorkspaceSchema.pick({
    id: true,
    name: true,
  }).partial({
    name: true,
  })
)
export type PushUpdateWorkspace = z.output<typeof PushUpdateWorkspace>

export const PushDeleteWorkspace = createPushEvent(
  'workspace.delete',
  1,
  ObjectIdSchema
)
export type PushDeleteWorkspace = z.output<typeof PushDeleteWorkspace>

export const WorkspaceCreated = createModelSyncEvent('workspace.created', 1, [
  'workspaces',
  'labels',
  'customFields',
  'statuses',
  'projectDefinitions',
  'workspaceMembers',
])
export type WorkspaceCreated = z.output<typeof WorkspaceCreated>

export const WorkspaceUpdated = createModelSyncEvent('workspace.updated', 1, [
  'workspaces',
])
export type WorkspaceUpdated = z.output<typeof WorkspaceUpdated>

export const WorkspaceDeleted = createModelSyncEvent(
  'workspace.hard-deleted',
  1,
  ['workspaces']
)
export type WorkspaceDeleted = z.output<typeof WorkspaceDeleted>
