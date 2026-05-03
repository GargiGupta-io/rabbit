import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

type GetIntegrationGroups =
  RouteTypes<'IntegrationsController_getIntegrationGroups'>
export const getIntegrationGroups = defineApi<
  GetIntegrationGroups['request'],
  GetIntegrationGroups['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.groups(),
  uri: () => `/integrations/platforms`,
})

type GetIntegrationCountsByUserId =
  RouteTypes<'IntegrationsController_getIntegrationCountsByUser'>
export const getIntegrationCountsByUser = defineApi<
  GetIntegrationCountsByUserId['request'],
  GetIntegrationCountsByUserId['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.countsByUser(),
  uri: () => `/integrations/counts-by-user`,
})

type GetIntegrations = RouteTypes<'IntegrationsController_getIntegrations'>
export const getIntegrationConnections = defineApi<
  GetIntegrations['request'],
  GetIntegrations['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.connections(args?.platform),
  uri: (args) =>
    args?.platform
      ? `/integrations?platform=${encodeURIComponent(args.platform)}`
      : '/integrations',
})

export type GetIntegrationPayloads =
  RouteTypes<'IntegrationsController_getPayloadList'>
export const getIntegrationPayloads = defineApi<
  GetIntegrationPayloads['request'],
  GetIntegrationPayloads['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.payloads(args),
  uri: (args) =>
    `/integrations/payload-list?${new URLSearchParams({
      integrationConfigId: args.integrationConfigId,
      platform: args.platform,
      modifiedAfter: args.modifiedAfter,
    }).toString()}`,
})
