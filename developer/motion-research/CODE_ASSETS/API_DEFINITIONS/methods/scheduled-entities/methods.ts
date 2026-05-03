import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type Get = RouteTypes<'ScheduledEntitiesController_get'>

export const getScheduledEntities = defineApi<
  Get['request'],
  Get['response']
>().using({
  uri: 'v2/scheduled-entities',
  method: 'POST',
  key: queryKeys.query,
})
