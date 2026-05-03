import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

type GetInboxItems = RouteTypes<'NotificationsController_getInboxItems'>
export const getInboxItems = defineApi<
  GetInboxItems['request'],
  GetInboxItems['response']
>().using({
  method: 'GET',
  uri: '/v2/notifications/items',
  key: () => queryKeys.items(),
})

type GetUnreadCount = RouteTypes<'NotificationsController_getUnreadCount'>
export const getUnreadCount = defineApi<
  GetUnreadCount['request'],
  GetUnreadCount['response']
>().using({
  method: 'GET',
  uri: '/v2/notifications/unread-count',
  key: () => queryKeys.unreadCount(),
})
