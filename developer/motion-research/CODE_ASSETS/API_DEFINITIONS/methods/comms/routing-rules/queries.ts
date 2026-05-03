import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../../types'

// Routing Rules
type GetRoutingRules = RouteTypes<'InboxRoutingRule_GetRules'>
export const getRoutingRules = defineApi<
  GetRoutingRules['request'],
  GetRoutingRules['response']
>().using({
  key: (args) =>
    queryKeys.routingRules(args?.inboxSourceId, args?.targetInboxId),
  method: 'GET',
  uri: (args) => {
    const params = new URLSearchParams()
    if (args?.inboxSourceId) {
      params.append('inboxSourceId', args.inboxSourceId)
    }
    if (args?.targetInboxId) {
      params.append('targetInboxId', args.targetInboxId)
    }
    const queryString = params.toString()
    return `${__NET_HOST__}/v1/api/comms/routing-rules${
      queryString ? `?${queryString}` : ''
    }`
  },
})

type GetRoutingRule = RouteTypes<'InboxRoutingRule_GetRule'>
export const getRoutingRule = defineApi<
  GetRoutingRule['request'],
  GetRoutingRule['response']
>().using({
  key: (args) => queryKeys.routingRule(args.ruleId),
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/routing-rules/${args.ruleId}`,
  enabled: (args) => !!args?.ruleId,
})
