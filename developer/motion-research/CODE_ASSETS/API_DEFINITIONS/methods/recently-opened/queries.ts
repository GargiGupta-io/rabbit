import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

type RecentlyOpenedTasksRoute =
  RouteTypes<'RecentlyOpenedController_getRecentlyOpenedTasks'>
export const recentlyOpenedTasks = defineApi<
  RecentlyOpenedTasksRoute['request'],
  RecentlyOpenedTasksRoute['response']['entities']
>().using({
  key: queryKeys.tasks,
  uri: '/recently_opened/tasks',
  transform: (data: RecentlyOpenedTasksRoute['response']) =>
    data.entities ?? [],
})

type RecentlyOpenedEntitiesRoute =
  RouteTypes<'RecentlyOpenedController_getRecentlyOpened'>
export const recentlyOpenedEntities = defineApi<
  RecentlyOpenedEntitiesRoute['request'],
  RecentlyOpenedEntitiesRoute['response']['entities']
>().using({
  key: queryKeys.root,
  uri: '/recently_opened',
  transform: (data: RecentlyOpenedEntitiesRoute['response']) =>
    data.entities ?? [],
})
