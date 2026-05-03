import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type TrackTaskRoute = RouteTypes<'RecentlyOpenedController_trackTask'>
export const trackTask = defineMutation<
  TrackTaskRoute['request'],
  void // TrackTaskRoute['response']
>().using({
  body: (args) => args,
  method: 'POST',
  uri: '/recently_opened/tasks',
  invalidate: () => queryKeys.tasks,
})

type TrackRoute = RouteTypes<'RecentlyOpenedController_track'>
export const track = defineMutation<TrackRoute['request'], void>().using({
  body: (args) => args,
  method: 'POST',
  uri: '/recently_opened',
  invalidate: () => queryKeys.root,
})
