import { createKey, defineApi, defineMutation } from '@motion/rpc'
import { omit } from '@motion/utils/core'

import { type RouteTypes } from '../types'

type GetProjectDefinitionByIdContext =
  RouteTypes<'DefinitionsController_getProjectDefinitionById'>
export const queryKeys = {
  root: createKey(['v2', 'projectDefinitions']),
  query: (args: Pick<GetProjectDefinitionByIdContext['request'], 'id'>) =>
    createKey(queryKeys.root, args.id),
  queryFullById: (
    args: Pick<GetProjectDefinitionFullContext['request'], 'id'>
  ) => createKey(queryKeys.root, 'full-definition', args.id),
}

export const getById = defineApi<
  GetProjectDefinitionByIdContext['request'],
  GetProjectDefinitionByIdContext['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.query(args),
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/projects/${args.id}`,
})

export const getLazyById = defineApi<
  GetProjectDefinitionByIdContext['request'],
  GetProjectDefinitionByIdContext['response']
>().using({
  key: (args) => ['lazy', ...queryKeys.query(args)],
  uri: getById.uri,
  queryOptions: {
    staleTime: 0,
    gcTime: 0,
  },
})

type CreateProjectDefinitionContext =
  RouteTypes<'DefinitionsController_createProjectDefinition'>
export const create = defineMutation<
  CreateProjectDefinitionContext['request'],
  CreateProjectDefinitionContext['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/definitions/projects`,
  body: (args) => omit(args, 'workspaceId'),
})

type UpdateProjectDefinitionContext =
  RouteTypes<'DefinitionsController_updateProjectDefinition'>
export const update = defineMutation<
  UpdateProjectDefinitionContext['request'],
  UpdateProjectDefinitionContext['response']
>().using({
  method: 'PUT',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/projects/${args.id}`,
  body: (args) => omit(args, ['workspaceId', 'id']),
})

type DeleteProjectDefinitionContext =
  RouteTypes<'DefinitionsController_deleteProjectDefinition'>
export const deleteProjectDefinition = defineMutation<
  DeleteProjectDefinitionContext['request'],
  void
>().using({
  method: 'DELETE',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/projects/${args.id}`,
})

type CopyProjectDefinitionContext =
  RouteTypes<'DefinitionsController_copyProjectDefinition'>
export const copyProjectDefinition = defineMutation<
  CopyProjectDefinitionContext['request'],
  CopyProjectDefinitionContext['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/projects/${args.id}/copy/${args.destinationWorkspaceId}`,
})

type CreateProjectDefinitionFullContext =
  RouteTypes<'DefinitionsController_createProjectDefinitionFull'>
export const createProjectDefinitionFull = defineMutation<
  CreateProjectDefinitionFullContext['request'],
  CreateProjectDefinitionFullContext['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/definitions/full`,
  body: (args) => omit(args, 'workspaceId'),
})

type UpdateProjectDefinitionFullContext =
  RouteTypes<'DefinitionsController_updateProjectDefinitionFull'>
export const updateProjectDefinitionFull = defineMutation<
  UpdateProjectDefinitionFullContext['request'],
  UpdateProjectDefinitionFullContext['response']
>().using({
  method: 'PUT',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/full/${args.id}`,
  body: (args) => omit(args, ['workspaceId', 'id']),
})

type GetProjectDefinitionFullContext =
  RouteTypes<'DefinitionsController_getProjectDefinitionsFullById'>
export const getProjectDefinitionFull = defineApi<
  GetProjectDefinitionFullContext['request'],
  GetProjectDefinitionFullContext['response']
>().using({
  method: 'GET',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/full/${args.id}`,
  key: (args) => queryKeys.queryFullById(args),
})
