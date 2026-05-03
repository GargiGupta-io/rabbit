import { defineApi, defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type GetUserKnowledge = RouteTypes<'KnowledgeController_getUserKnowledge'>
export const getUserKnowledge = defineApi<
  GetUserKnowledge['request'],
  GetUserKnowledge['response']
>().using({
  method: 'GET',
  uri: '/v2/knowledge/user',
  key: () => queryKeys.entries(),
})

type GetKnowledgeById = RouteTypes<'KnowledgeController_getKnowledgeById'>
export const getKnowledgeById = defineApi<
  GetKnowledgeById['request'],
  GetKnowledgeById['response']
>().using({
  method: 'GET',
  uri: (args) => `/v2/knowledge/${args.id}`,
  key: (args) => queryKeys.byId(args.id),
})

type CreateKnowledge = RouteTypes<'KnowledgeController_createKnowledge'>
export const create = defineMutation<
  CreateKnowledge['request'],
  CreateKnowledge['response']
>().using({
  uri: '/v2/knowledge',
  method: 'POST',
  invalidate: queryKeys.root,
})

type UpdateKnowledge = RouteTypes<'KnowledgeController_updateKnowledge'>
export const update = defineMutation<
  UpdateKnowledge['request'],
  UpdateKnowledge['response']
>().using({
  uri: (req: UpdateKnowledge['request']) => `/v2/knowledge/${req.id}`,
  method: 'PUT',
  body: (req: UpdateKnowledge['request']) => ({
    id: req.id,
    displayName: req.displayName,
    data: req.data,
    shareWithTeam: req.shareWithTeam,
  }),
  invalidate: queryKeys.root,
})

type DeleteKnowledge = RouteTypes<'KnowledgeController_deleteKnowledge'>
export const deleteKnowledge = defineMutation<
  DeleteKnowledge['request'],
  DeleteKnowledge['response']
>().using({
  uri: (req: DeleteKnowledge['request']) => `/v2/knowledge/${req.id}`,
  method: 'DELETE',
  invalidate: queryKeys.root,
})
