import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../../types'

// Routing Rules
type CreateRoutingRule = RouteTypes<'InboxRoutingRule_CreateRule'>
export const createRoutingRule = defineMutation<
  CreateRoutingRule['request'],
  CreateRoutingRule['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `${__NET_HOST__}/v1/api/comms/sources/${args.sourceId}/routing-rules`,
  body: ({ sourceId, ...rest }) => rest,
  invalidate: () => [queryKeys.routingRules()],
})

type UpdateRoutingRule = RouteTypes<'InboxRoutingRule_UpdateRule'>
export const updateRoutingRule = defineMutation<
  UpdateRoutingRule['request'],
  UpdateRoutingRule['response']
>().using({
  method: 'PATCH',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/routing-rules/${args.ruleId}`,
  body: ({ ruleId, ...rest }) => rest,
  invalidate: () => [queryKeys.routingRules()],
})

type DeleteRoutingRule = RouteTypes<'InboxRoutingRule_DeleteRule'>
export const deleteRoutingRule = defineMutation<
  DeleteRoutingRule['request'],
  DeleteRoutingRule['response']
>().using({
  method: 'DELETE',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/routing-rules/${args.ruleId}`,
  invalidate: () => [queryKeys.routingRules()],
})

type ReorderRoutingRules = RouteTypes<'InboxRoutingRule_ReorderRules'>
export const reorderRoutingRules = defineMutation<
  ReorderRoutingRules['request'],
  ReorderRoutingRules['response']
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/api/comms/routing-rules/reorder`,
  invalidate: () => [queryKeys.routingRules()],
})
