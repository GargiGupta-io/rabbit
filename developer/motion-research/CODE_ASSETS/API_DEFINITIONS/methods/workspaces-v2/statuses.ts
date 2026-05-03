import { defineApi, defineMutation } from '@motion/rpc'
import { type WorkspaceSchema } from '@motion/zod/client'

import { type RouteTypes } from '../types'

type CreateStatus = RouteTypes<'StatusesController_create'>
export const createStatus = defineMutation<
  CreateStatus['request'],
  CreateStatus['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/statuses`,
  body: ({ workspaceId, ...args }) => args,
})

type UpdateStatus = RouteTypes<'StatusesController_update'>
export const updateStatus = defineMutation<
  UpdateStatus['request'] & { workspaceId: WorkspaceSchema['id'] },
  UpdateStatus['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/statuses/${args.statusId}`,
  body: ({ workspaceId, statusId, ...args }) => args,
})

type DeleteStatus = RouteTypes<'StatusesController_delete'>
export const deleteStatus = defineMutation<
  DeleteStatus['request'] & { workspaceId: WorkspaceSchema['id'] },
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/statuses/${args.statusId}`,
})

type GetAllForWorkspace = RouteTypes<'StatusesController_getStatues'>
export const getWorkspaceStatuses = defineApi<
  GetAllForWorkspace['request'],
  GetAllForWorkspace['response']
>().using({
  key: (args) => ['v2', 'workspaces', args.workspaceId, 'statuses'],
  uri: (args) => `/v2/workspaces/${args.workspaceId}/statuses`,
})
