import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

export type ChartsGetQuery = RouteTypes<'ChartsController_query'>
export const getQuery = defineApi<
  ChartsGetQuery['request'],
  ChartsGetQuery['response']
>().using({
  key: (args) => queryKeys.query(args),
  method: 'POST',
  uri: '/v2/charts/query',
  body: (args) => args,
})

export type ChartTasksQuery = RouteTypes<'ChartsController_getTasks'>
export const getChartTasks = defineApi<
  ChartTasksQuery['request'],
  ChartTasksQuery['response']
>().using({
  key: (args) => queryKeys.tasks(args),
  method: 'POST',
  uri: '/v2/charts/tasks',
  body: (args) => args,
})

export type ChartProjectsQuery = RouteTypes<'ChartsController_getProjects'>
export const getChartProjects = defineApi<
  ChartProjectsQuery['request'],
  ChartProjectsQuery['response']
>().using({
  key: (args) => queryKeys.projects(args),
  method: 'POST',
  uri: '/v2/charts/projects',
  body: (args) => args,
})
