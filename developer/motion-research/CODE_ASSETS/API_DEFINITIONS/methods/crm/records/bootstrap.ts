import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../../types'

type Bootstrap = RouteTypes<'CrmBootstrap_GetAllModels'>

export const bootstrap = defineApi<
  Bootstrap['request'],
  Bootstrap['response']
>().using({
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/crm/bootstrap`,
  key: () => queryKeys.bootstrap(),
})
