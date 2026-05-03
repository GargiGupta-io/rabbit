import { createKey, defineApi, defineMutation } from '@motion/rpc'
import { omit } from '@motion/utils/core'

import { migrateBackendViews } from './migration'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'views']),
}

type GetViews = RouteTypes<'ViewsController_getAll'>
export const getAll = defineApi<
  GetViews['request'],
  GetViews['response']
>().using({
  key: () => queryKeys.root,
  uri: '/v2/views',
  method: 'GET',
  transform(data) {
    // This is temporary until I change the server to default visible
    data.ids.forEach((id) => {
      const def = data.models.views[id].definition
      if (def.type === 'team-schedule') return
      if (def.type === 'dashboard') return
      if (def.type === 'workload') return

      def.columns.forEach((col) => {
        col.visible ??= true
      })
      if (def.filters.tasks.filters.completed == null) {
        def.filters.tasks.filters.completed = 'include'
      }
      if (def.filters.projects.filters.completed == null) {
        def.filters.projects.filters.completed = 'include'
      }
    })

    return migrateBackendViews(data)
  },
})

type CreateView = RouteTypes<'ViewsController_createView'>
export const create = defineMutation<
  CreateView['request'],
  CreateView['response']
>().using({
  method: 'POST',
  uri: '/v2/views',
  body: (args) => ({ data: omit(args.data, 'id') }),
  effects: [{ on: 'success', action: 'invalidate', key: () => queryKeys.root }],
})

type UpdateView = RouteTypes<'ViewsController_updateView'>
export const update = defineMutation<
  UpdateView['request'],
  UpdateView['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/views/${args.viewId}`,
})

type DeleteView = RouteTypes<'ViewsController_deleteView'>
export const deleteView = defineMutation<
  DeleteView['request'],
  DeleteView['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/views/${args.viewId}`,
  effects: [{ on: 'success', action: 'invalidate', key: () => queryKeys.root }],
})
