import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'guest-permissions']),
  projectGuestPermissions: (projectId: string) =>
    createKey(queryKeys.root, 'projects', projectId),
}

type GetGuestPermissions =
  RouteTypes<'ProjectGuestPermissionsController_getGuestPermissions'>
export const getGuestPermissions = defineApi<
  GetGuestPermissions['request'],
  GetGuestPermissions['response']
>().using({
  uri: (args) => `/v2/guest-permissions/projects/${args.projectId}`,
  method: 'GET',
  key: (args) => queryKeys.projectGuestPermissions(args.projectId),
})

type ChangeGuestPermissions =
  RouteTypes<'ProjectGuestPermissionsController_changeGuestPermissions'>
export const changeGuestPermissions = defineMutation<
  ChangeGuestPermissions['request'],
  ChangeGuestPermissions['response']
>().using({
  uri: (args) => `/v2/guest-permissions/projects/${args.projectId}`,
  method: 'POST',
  body: ({ projectId, ...args }) => args,
  invalidate: (args) => queryKeys.projectGuestPermissions(args.projectId),
})

type UnshareProject =
  RouteTypes<'ProjectGuestPermissionsController_unshareProject'>
export const unshareProject = defineMutation<
  UnshareProject['request'],
  UnshareProject['response']
>().using({
  uri: (args) => `/v2/guest-permissions/projects/${args.projectId}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.projectGuestPermissions(args.projectId),
})
