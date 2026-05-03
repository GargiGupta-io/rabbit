import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

export type MarkItemAsRead =
  RouteTypes<'NotificationsController_markItemsStatus'>

export const markItemAsRead = defineMutation<
  MarkItemAsRead['request'],
  void
>().using({
  method: 'PATCH',
  uri: '/v2/notifications/mark-status',
  key: (args) => queryKeys.markItemAsRead(args),
})
