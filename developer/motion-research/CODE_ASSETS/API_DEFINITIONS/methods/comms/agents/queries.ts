import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../../types'

type GetAgentListing = RouteTypes<'CommsAgent_GetCommsAgents'>
export const getAgentListing = defineApi<
  GetAgentListing['request'],
  GetAgentListing['response']
>().using({
  key: () => queryKeys.agentListing(),
  uri: () => `${__NET_HOST__}/v1/communications/comms-agents`,
})

type GetAgentById = RouteTypes<'CommsAgent_GetCommsAgentById'>
export const getAgentById = defineApi<
  GetAgentById['request'],
  GetAgentById['response']
>().using({
  key: (args) => queryKeys.agentById(args.id),
  uri: (args) => `${__NET_HOST__}/v1/communications/comms-agents/${args.id}`,
})

type GetPhoneNumbers =
  RouteTypes<'TwilioPhoneNumber_GetAvailableLocalPhoneNumbers'>
export const getPhoneNumbers = defineApi<
  GetPhoneNumbers['request'],
  GetPhoneNumbers['response']
>().using({
  key: (args) => [...queryKeys.phoneNumbers(), args],
  uri: (args) => {
    const uri = new URL(`${__NET_HOST__}/v1/communications/numbers/local`)
    if (args.countryCode) {
      uri.searchParams.set('countryCode', args.countryCode)
    }
    if (args.areaCode) {
      uri.searchParams.set('areaCode', args.areaCode.toString())
    }
    if (args.limit) {
      uri.searchParams.set('limit', args.limit.toString())
    }
    return uri.toString()
  },
})
