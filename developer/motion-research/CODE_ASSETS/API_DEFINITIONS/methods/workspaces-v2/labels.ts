import { defineMutation } from '@motion/rpc'
import { type WorkspaceSchema } from '@motion/zod/client'

import { type RouteTypes } from '../types'

type CreateLabel = RouteTypes<'LabelsController_create'>
export const createLabel = defineMutation<
  CreateLabel['request'],
  CreateLabel['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/labels`,
  body: ({ workspaceId, ...args }) => args,
})

type UpdateLabel = RouteTypes<'LabelsController_update'>
export const updateLabel = defineMutation<
  UpdateLabel['request'] & { workspaceId: WorkspaceSchema['id'] },
  UpdateLabel['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/labels/${args.labelId}`,
  body: ({ workspaceId, labelId, ...args }) => args,
})

type DeleteLabel = RouteTypes<'LabelsController_delete'>
export const deleteLabel = defineMutation<
  DeleteLabel['request'] & { workspaceId: WorkspaceSchema['id'] },
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/labels/${args.labelId}`,
})
