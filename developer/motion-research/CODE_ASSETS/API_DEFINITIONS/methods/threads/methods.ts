import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

type UpdateThread = RouteTypes<'ThreadsController_updateThread[1]'>

export const updateThread = defineMutation<
  UpdateThread['request'],
  UpdateThread['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/threads/${args.id}`,
  body: (args) => args,
})

export const deleteThread = defineMutation<
  RouteTypes<'ThreadsController_deleteThread[1]'>['request'] & {
    targetId: string
    threadId: string
  },
  void
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/threads/${args.threadId}`,
})
