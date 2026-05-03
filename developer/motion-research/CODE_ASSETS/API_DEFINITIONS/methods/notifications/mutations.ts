import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type UpdateNotificationsPreferencesRoute =
  RouteTypes<'NotificationsController_updatePreferences'>

export const updateNotificationsPreferences = defineMutation<
  UpdateNotificationsPreferencesRoute['request'],
  UpdateNotificationsPreferencesRoute['response']
>().using({
  key: queryKeys.preferences,
  uri: 'v2/notifications/preferences',
  method: 'PATCH',
})
