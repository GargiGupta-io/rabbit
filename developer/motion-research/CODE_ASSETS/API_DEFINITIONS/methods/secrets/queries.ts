import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

export type GetSecrets = RouteTypes<'SecretsController_getSecrets'>
export const getSecrets = defineApi<
  GetSecrets['request'],
  GetSecrets['response']
>().using({
  method: 'GET',
  key: () => queryKeys.secrets(),
  uri: () => '/v2/secrets',
})

export type GetSecretById = RouteTypes<'SecretsController_getSecret'>
export const getSecretById = defineApi<
  GetSecretById['request'],
  GetSecretById['response']
>().using({
  method: 'GET',
  key: (args) => queryKeys.secret(args.id),
  uri: (args) => `/v2/secrets/${args.id}`,
})
