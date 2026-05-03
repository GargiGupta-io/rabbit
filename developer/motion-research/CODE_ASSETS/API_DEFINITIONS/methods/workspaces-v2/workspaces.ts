import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'workspaces']),
  summary: createKey(['v2', 'workspaces', 'summary']),
  query: (args: GetAppWorkspaceContext['request']) =>
    createKey(queryKeys.root, args as any),
}

type GetAppWorkspaceContext = RouteTypes<'WorkspacesController_getContexts'>
export const getWorkspaces = defineApi<
  GetAppWorkspaceContext['request'],
  GetAppWorkspaceContext['response']
>().using({
  key: (args) => {
    return queryKeys.query(args)
  },
  uri: `/v2/workspaces/query`,
  method: 'POST',
  queryOptions: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: Infinity,
  },
})

type GetWorkspaceSummary =
  RouteTypes<'WorkspacesController_getWorkspacesSummary'>
export const getWorkspaceSummary = defineApi<
  GetWorkspaceSummary['request'],
  GetWorkspaceSummary['response']
>().using({
  key: queryKeys.summary,
  uri: `/v2/workspaces/summary`,
  method: 'GET',
  queryOptions: {
    staleTime: 300_000,
  },
})

type CreateWorkspace = RouteTypes<'WorkspacesController_createWorkspace'>
export const createWorkspace = defineMutation<
  CreateWorkspace['request'],
  CreateWorkspace['response']
>().using({
  method: 'POST',
  uri: '/v2/workspaces',
})

type UpdateWorkspace = RouteTypes<'WorkspacesController_updateWorkspace'>
export const updateWorkspace = defineMutation<
  UpdateWorkspace['request'],
  UpdateWorkspace['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/workspaces/${args.workspaceId}`,
  body: ({ workspaceId, ...args }) => args,
})

type DeleteWorkspace = RouteTypes<'WorkspacesController_delete'>
export const deleteWorkspace = defineMutation<
  DeleteWorkspace['request'],
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/workspaces/${args.workspaceId}`,
})
