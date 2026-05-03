import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const queryKeys = {
  agenda: createKey('ai', 'agenda'),
}

type ParseCancellation = RouteTypes<'AiController_parseCancellation'>
export const parseCancellation = defineMutation<
  ParseCancellation['request'],
  { reason: string }
>().using({
  method: 'POST',
  uri: '/ai/cancellation',
  body: (args) => args,
})

type CreateFlows = RouteTypes<'AiController_createPwtArgs'>
export const createFlows = defineMutation<
  CreateFlows['request'],
  CreateFlows['response']
>().using({
  method: 'POST',
  uri: '/ai/pwt',
})

type CreateProject = RouteTypes<'AiController_inferProjectParameters'>
export const inferProjectParameters = defineMutation<
  CreateProject['request'],
  CreateProject['response']
>().using({
  method: 'POST',
  uri: '/ai/project/infer-parameters',
})

type GenerateSpeculativeProject = RouteTypes<'AiController_generateProject'>
export const generateSpeculativeProject = defineMutation<
  GenerateSpeculativeProject['request'],
  GenerateSpeculativeProject['response']
>().using({
  method: 'POST',
  uri: '/ai/project/generate',
})

type CommitProject = RouteTypes<'AiController_commitProject'>
export const commitProject = defineMutation<
  CommitProject['request'],
  CommitProject['response']
>().using({
  method: 'POST',
  uri: '/ai/project/commit',
})

type GetAgendaContext = RouteTypes<'AiController_getAgenda'>

export const getAgenda = defineApi<
  GetAgendaContext['request'],
  GetAgendaContext['response']
>().using({
  method: 'GET',
  key: queryKeys.agenda,
  uri: `/ai/agenda`,
})

type GenerateCode = RouteTypes<'AiController_generateCode'>
export const generateCode = defineMutation<
  GenerateCode['request'],
  GenerateCode['response']
>().using({
  method: 'POST',
  uri: `/ai/code-block`,
})
