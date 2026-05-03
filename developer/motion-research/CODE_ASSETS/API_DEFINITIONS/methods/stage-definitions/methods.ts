import { createKey, defineApi, defineMutation } from '@motion/rpc'
import { omit } from '@motion/utils/core'

import { type RouteTypes } from '../types'

type GetStageDefinitionByIdContext =
  RouteTypes<'DefinitionsController_getStageDefinitionById'>
export const queryKeys = {
  root: createKey(['v2', 'stageDefinitions']),
  query: (args: Pick<GetStageDefinitionByIdContext['request'], 'id'>) =>
    createKey(queryKeys.root, args.id),
}

export const getById = defineApi<
  GetStageDefinitionByIdContext['request'],
  GetStageDefinitionByIdContext['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.query(args),
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/stages/${args.id}`,
})

export const getLazyById = defineApi<
  GetStageDefinitionByIdContext['request'],
  GetStageDefinitionByIdContext['response']
>().using({
  key: (args) => ['lazy', ...queryKeys.query(args)],
  uri: getById.uri,
  queryOptions: {
    staleTime: 0,
    gcTime: 0,
  },
})

type CreateStageDefinitionContext =
  RouteTypes<'DefinitionsController_createStageDefinition'>
export const create = defineMutation<
  CreateStageDefinitionContext['request'],
  CreateStageDefinitionContext['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/definitions/stages`,
  body: (args) => omit(args, 'workspaceId'),
})

type UpdateStageDefinitionContext =
  RouteTypes<'DefinitionsController_updateStageDefinition'>
export const update = defineMutation<
  UpdateStageDefinitionContext['request'],
  UpdateStageDefinitionContext['response']
>().using({
  method: 'PUT',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/stages/${args.id}`,
  body: (args) => omit(args, ['workspaceId', 'id']),
})

type BulkUpdateStageDefinitionsContext =
  RouteTypes<'DefinitionsController_updateManyStageDefinitions'>
export const bulkUpdate = defineMutation<
  BulkUpdateStageDefinitionsContext['request'],
  BulkUpdateStageDefinitionsContext['response']
>().using({
  method: 'PUT',
  uri: (args) => `/v2/workspaces/${args.workspaceId}/definitions/stages`,
  body: (args) => omit(args, 'workspaceId'),
})

type DeleteStageDefinitionContext =
  RouteTypes<'DefinitionsController_deleteStageDefinition'>
export const deleteStageDefinition = defineMutation<
  DeleteStageDefinitionContext['request'],
  void
>().using({
  method: 'DELETE',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/stages/${args.id}`,
})

type CopyStageDefinitionContext =
  RouteTypes<'DefinitionsController_copyStageDefinition'>
export const copyStageDefinition = defineMutation<
  CopyStageDefinitionContext['request'],
  CopyStageDefinitionContext['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/definitions/stages/${args.id}/copy/${args.destinationWorkspaceId}`,
  body: (args) => undefined,
})
