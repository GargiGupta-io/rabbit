import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type NotificationsGetPreferencesRoute =
  RouteTypes<'NotificationsController_getPreferences'>

export const getNotificationsPreferences = defineApi<
  NotificationsGetPreferencesRoute['request'],
  NotificationsGetPreferencesRoute['response']
>().using({
  key: queryKeys.query,
  uri: '/v2/notifications/preferences',
  method: 'GET',
})
