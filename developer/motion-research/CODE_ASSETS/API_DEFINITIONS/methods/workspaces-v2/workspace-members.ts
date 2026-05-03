import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

type CreateWorkspaceMember =
  RouteTypes<'WorkspaceMembersController_addUserToWorkspace'>
export const createWorkspaceMember = defineMutation<
  CreateWorkspaceMember['request'],
  CreateWorkspaceMember['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/members`,
  body: ({ workspaceId, ...args }) => args,
})

type CreateWorkspaceMembers =
  RouteTypes<'WorkspaceMembersController_createWorkspaceMembers'>
export const createWorkspaceMembers = defineMutation<
  CreateWorkspaceMembers['request'],
  CreateWorkspaceMembers['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/members/bulk-create`,
  body: ({ workspaceId, ...args }) => args,
})

type DeleteWorkspaceMember =
  RouteTypes<'WorkspaceMembersController_removeWorkspaceMemberFromWorkspace'>
export const deleteWorkspaceMember = defineMutation<
  DeleteWorkspaceMember['request'],
  DeleteWorkspaceMember['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/members/${args.memberId}`,
})

type DeleteWorkspaceMembers =
  RouteTypes<'WorkspaceMembersController_removeWorkspaceMembersFromWorkspace'>
export const deleteWorkspaceMembers = defineMutation<
  DeleteWorkspaceMembers['request'],
  DeleteWorkspaceMembers['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/members/bulk`,
  body: ({ workspaceId, ...args }) => args,
})
