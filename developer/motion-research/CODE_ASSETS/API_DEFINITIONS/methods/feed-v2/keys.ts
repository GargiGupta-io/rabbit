import { typedKey } from '@motion/rpc'

import type { RouteTypes } from '../types'

type FeedResponse =
  | RouteTypes<'TasksController_getFeedById'>['response']
  | RouteTypes<'ProjectsController_getFeedById'>['response']

const factory = typedKey<FeedResponse>().define

const feedById = (id: string) => factory('v2', 'feed', id)

export const queryKeys = {
  feedById,
  feedByIdWithTasks: (id: string) => factory(feedById(id), 'withTasks'),
}
