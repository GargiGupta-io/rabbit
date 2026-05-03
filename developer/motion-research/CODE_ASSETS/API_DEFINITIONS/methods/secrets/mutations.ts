import { defineMutation } from '@motion/rpc'

import { RouteTypes } from '../types'

export type CreateSecret = RouteTypes<'SecretsController_createSecret'>
export const createSecret = defineMutation<
  CreateSecret['request'],
  CreateSecret['response']
>().using({
  method: 'POST',
  uri: () => '/v2/secrets',
})

export type UpdateSecret = RouteTypes<'SecretsController_updateSecret'>
export const updateSecret = defineMutation<
  UpdateSecret['request'],
  UpdateSecret['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/secrets/${args.id}`,
})

export type DeleteSecret = RouteTypes<'SecretsController_deleteSecret'>
export const deleteSecret = defineMutation<
  DeleteSecret['request'],
  DeleteSecret['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/secrets/${args.id}`,
})
