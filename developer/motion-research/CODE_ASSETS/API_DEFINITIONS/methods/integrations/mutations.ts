import { defineMutation } from '@motion/rpc'
import { KnownIntegrationPlatforms } from '@motion/shared/integrations'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

type GetUserSessionToken =
  RouteTypes<'IntegrationsController_getUserSessionToken'>
export const createUserSessionToken = defineMutation<
  GetUserSessionToken['request'],
  GetUserSessionToken['response']
>().using({
  method: 'POST',
  uri: () => '/integrations/user/session',
  body: (data) => data,
})

type RegisterIntegration =
  RouteTypes<'IntegrationsController_registerIntegration'>
export const registerIntegration = defineMutation<
  RegisterIntegration['request'],
  RegisterIntegration['response']
>().using({
  method: 'POST',
  uri: () => `/integrations/register`,
  body: (data) => data,
  invalidate: (args) => [
    queryKeys.groups(),
    queryKeys.connections(args.platform),
    queryKeys.connections(),
  ],
})

type ReconnectIntegration =
  RouteTypes<'IntegrationsController_reconnectIntegration'>
export const reconnectIntegration = defineMutation<
  ReconnectIntegration['request'],
  ReconnectIntegration['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `/integrations/${args.integrationConfigId}/reconnect?connectionId=${encodeURIComponent(args.connectionId)}`,
  body: (data) => data,
  invalidate: () => [queryKeys.connectionsRoot()],
})

type RenameIntegrationConfig =
  RouteTypes<'IntegrationsController_renameIntegrationConfig'>
export const renameIntegrationConfig = defineMutation<
  RenameIntegrationConfig['request'],
  RenameIntegrationConfig['response']
>().using({
  method: 'PATCH',
  uri: (args) =>
    `/integrations/${args.integrationConfigId}/rename?displayName=${encodeURIComponent(args.displayName)}`,
  body: (data) => data,
  invalidate: () => [queryKeys.connectionsRoot()],
})

type DeleteIntegrationConfig =
  RouteTypes<'IntegrationsController_deleteIntegrationConfig'>
export const removeIntegrationConnection = defineMutation<
  DeleteIntegrationConfig['request'] & { platform: KnownIntegrationPlatforms },
  DeleteIntegrationConfig['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/integrations/${args.integrationConfigId}`,
  body: (data) => data,
  invalidate: () => [queryKeys.groups(), queryKeys.connectionsRoot()],
})
