import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type GetAllRoute = RouteTypes<'EmailAccountsController_getAll'>
export const getAll = defineApi<
  GetAllRoute['request'],
  GetAllRoute['response']
>().using({
  uri: '/email_accounts',
  method: 'GET',
  key: queryKeys.root,
})

export const create = defineMutation<
  RouteTypes<'EmailAccountsController_createEmailAccount'>['request'],
  RouteTypes<'EmailAccountsController_createEmailAccount'>['response']
>().using({
  key: createKey('email_accounts'),
  uri: '/email_accounts',
  method: 'POST',
})

export const update = defineMutation<
  RouteTypes<'EmailAccountsController_updateEmailAccount'>['request'],
  RouteTypes<'EmailAccountsController_updateEmailAccount'>['response']
>().using({
  key: createKey('email_accounts'),
  uri: (args) => `/email_accounts/${args.id}`,
  method: 'PATCH',
})

export const disableEmailSync = defineMutation<
  RouteTypes<'EmailAccountsController_disableEmailSync'>['request'],
  RouteTypes<'EmailAccountsController_disableEmailSync'>['response']
>().using({
  key: createKey('email_accounts'),
  uri: (args) => `/email_accounts/${args.id}/disable-email-sync`,
  method: 'POST',
})
