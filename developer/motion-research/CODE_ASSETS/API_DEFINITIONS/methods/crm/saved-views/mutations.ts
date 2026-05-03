import { defineMutation } from '@motion/rpc'

import { savedViewsQueryKeys } from './keys'

import { type RouteTypes } from '../../types'

type Create = RouteTypes<'CrmViews_Create'>
type Update = RouteTypes<'CrmViews_Update'>
type Delete = RouteTypes<'CrmViews_Delete'>

export const createSavedView = defineMutation<
  Create['request'],
  Create['response']
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/crm/views`,
  body: (args) => args,
  key: () => savedViewsQueryKeys.root,
})

export const updateSavedView = defineMutation<
  Update['request'],
  Update['response']
>().using({
  method: 'PATCH',
  uri: (args) => `${__NET_HOST__}/v1/crm/views/${args.id}`,
  body: ({ id, ...body }) => body,
  key: (args) => savedViewsQueryKeys.savedView(args.id),
})

export const deleteSavedView = defineMutation<
  Delete['request'],
  Delete['response']
>().using({
  method: 'DELETE',
  uri: (args) => `${__NET_HOST__}/v1/crm/views/${args.id}`,
  key: (args) => savedViewsQueryKeys.savedView(args.id),
})
