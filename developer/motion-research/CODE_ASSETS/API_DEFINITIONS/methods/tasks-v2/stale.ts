import { defineApi, defineMutation } from '@motion/rpc'

import { keepPreviousData } from '@tanstack/react-query'

import { type RouteTypes } from '../types'

export const getStaleTasks = defineApi<
  RouteTypes<'TasksController_getStaleTasks'>['request'],
  RouteTypes<'TasksController_getStaleTasks'>['response']
>().using({
  uri: 'v2/tasks/stale',
  method: 'GET',
  key: (args) => ['v2/tasks', 'stale'],
  queryOptions: {
    placeholderData: keepPreviousData,
  },
})

export const updateStaleTasks = defineMutation<
  RouteTypes<'TasksController_updateStaleAutoScheduledTasks'>['request'],
  void
>().using({
  uri: 'v2/tasks/reschedule',
})
