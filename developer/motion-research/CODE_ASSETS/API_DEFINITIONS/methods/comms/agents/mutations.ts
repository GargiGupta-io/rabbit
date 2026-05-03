import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../../types'

type CreateAgent = RouteTypes<'CommsAgent_CreateCommsAgent'>
export const createAgent = defineMutation<
  CreateAgent['request'],
  CreateAgent['response']
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/communications/comms-agents`,
  invalidate: () => [queryKeys.agentListing()],
})

type SaveAgent = RouteTypes<'CommsAgent_UpdateCommsAgent'>
export const saveAgent = defineMutation<
  SaveAgent['request'],
  SaveAgent['response']
>().using({
  method: 'PUT',
  uri: (args) => `${__NET_HOST__}/v1/communications/comms-agents/${args.id}`,
  invalidate: (args) => [queryKeys.agentListing()],
})

type DeleteAgent = RouteTypes<'CommsAgent_DeleteCommsAgent'>
export const deleteAgent = defineMutation<
  DeleteAgent['request'],
  DeleteAgent['response']
>().using({
  method: 'DELETE',
  uri: (args) => `${__NET_HOST__}/v1/communications/comms-agents/${args.id}`,
  invalidate: (args) => [queryKeys.agentListing()],
})

type PublishPhoneAgent = RouteTypes<'CommsAgent_PublishCommsAgent'>
export const publishPhoneAgent = defineMutation<
  PublishPhoneAgent['request'],
  PublishPhoneAgent['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `${__NET_HOST__}/v1/communications/comms-agents/${args.id}/publish`,
  invalidate: (args) => [queryKeys.agentListing()],
})

type ActivatePhoneAgent = RouteTypes<'CommsAgent_ActivateCommsAgent'>
export const activatePhoneAgent = defineMutation<
  ActivatePhoneAgent['request'],
  ActivatePhoneAgent['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `${__NET_HOST__}/v1/communications/comms-agents/${args.id}/activate`,
  invalidate: (args) => [queryKeys.agentListing()],
})
