import { createKey } from '@motion/rpc'

import {
  ChartProjectsQuery,
  type ChartsGetQuery,
  type ChartTasksQuery,
} from './methods'

export const queryKeys = {
  root: createKey('v2', 'charts'),
  query: (args: ChartsGetQuery['request']) => [queryKeys.root, args],
  tasks: (args: ChartTasksQuery['request']) => [queryKeys.root, 'tasks', args],
  projects: (args: ChartProjectsQuery['request']) => [
    queryKeys.root,
    'projects',
    args,
  ],
}
