import { defineApi } from '@motion/rpc'

import { queryKeys as feedKeys } from './keys'

import type { RouteTypes } from '../types'

type FeedRequest =
  | ({ type: 'task' } & RouteTypes<'TasksController_getFeedById'>['request'])
  | ({
      type: 'project'
    } & RouteTypes<'ProjectsController_getFeedById'>['request'])

type FeedResponse =
  | RouteTypes<'TasksController_getFeedById'>['response']
  | RouteTypes<'ProjectsController_getFeedById'>['response']

export const getFeedById = defineApi<FeedRequest, FeedResponse>().using({
  uri: (args: FeedRequest) =>
    args.type === 'task'
      ? `/v2/tasks/${args.id}/feed`
      : `/v2/projects/${args.id}/feed${args.includeTasks ? '?includeTasks=true' : ''}`,
  key: (args) =>
    args.type === 'project' && args.includeTasks
      ? feedKeys.feedByIdWithTasks(args.id)
      : feedKeys.feedById(args.id),
})
