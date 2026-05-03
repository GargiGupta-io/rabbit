import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

type CheckAccess = RouteTypes<'AccessController_checkAccess'>
export const checkAccess = defineApi<
  CheckAccess['request'],
  CheckAccess['response']
>().using({
  method: 'GET',
  uri: (args) => {
    const searchParams = new URLSearchParams()
    searchParams.set('resourceType', args.resourceType)
    searchParams.set('resourceId', args.resourceId)
    searchParams.set('action', args.action)
    if (args.userId) {
      searchParams.set('userId', args.userId)
    }
    return `/v2/access/check?${searchParams.toString()}`
  },
  key: queryKeys.query,
})
