import { defineApi } from '@motion/rpc'
import { type TasksV2GetByIdParamsSchema } from '@motion/zod/client'

import { keepPreviousData } from '@tanstack/react-query'

import { queryKeys } from './keys'

import { type RouteTypes } from '../types'

const FIFTEEN_MINUTES = 15 * 60 * 1000
const TWO_MINUTES = 2 * 60 * 1000

export const queryTasks = defineApi<
  RouteTypes<'TasksController_queryTasks'>['request'],
  RouteTypes<'TasksController_queryTasks'>['response']
>().using({
  uri: 'v2/tasks/query',
  method: 'POST',
  key: (args) => [...queryKeys.query, args],
  queryOptions: {
    placeholderData: keepPreviousData,
  },
})

type GetTaskById = RouteTypes<'TasksController_getTaskById'>
export const getTaskById = defineApi<
  { id: string } & TasksV2GetByIdParamsSchema,
  GetTaskById['response']
>().using({
  uri: (args) => {
    const params =
      args.include.length > 0 ? `?include=${args.include.join(',')}` : ''
    return `v2/tasks/${args.id}${params}`
  },
  key: (args) => queryKeys.taskById(args.id),
  queryOptions: {
    staleTime: TWO_MINUTES,
    placeholderData: keepPreviousData,
  },
})

/**
 * Define a specific lazy task for lazy call implementation using a different key
 * because React Query use a shared signal per key when aborting queries
 * Additionally, we make sure to never cache that data since it's a lazy fetch
 * and we have internals to check the cache data
 */
export const getLazyTaskById = defineApi<
  { id: string } & TasksV2GetByIdParamsSchema,
  GetTaskById['response']
>().using({
  uri: getTaskById.uri,
  key: (args) => [...queryKeys.lazyByIdRoot, args.id],
  queryOptions: {
    staleTime: 0,
    gcTime: 0,
  },
})

type GetPastDeadlineTasks = RouteTypes<'TasksController_getPastDueTasks'>
export const getPastDeadlineTasks = defineApi<
  GetPastDeadlineTasks['request'],
  GetPastDeadlineTasks['response']
>().using({
  key: () => queryKeys.pastDue(),
  uri: (args) => {
    const params =
      args.include.length > 0 ? `?include=${args.include.join(',')}` : ''
    return `v2/tasks/past_due${params}`
  },
  queryOptions: {
    gcTime: FIFTEEN_MINUTES,
    staleTime: FIFTEEN_MINUTES,
  },
})
