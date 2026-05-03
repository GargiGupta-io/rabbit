import { defineApi } from '@motion/rpc'

import { savedViewsQueryKeys } from './keys'

import { type RouteTypes } from '../../types'

type ListByCollection = RouteTypes<'CrmViews_ListByCollection'>
type GetById = RouteTypes<'CrmViews_GetById'>

export const getSavedViews = defineApi<
  ListByCollection['request'],
  ListByCollection['response']
>().using({
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/crm/views/collections/${args.collection}`,
  key: (args) => savedViewsQueryKeys.savedViews(args.collection),
})

export const getSavedViewById = defineApi<
  GetById['request'],
  GetById['response']
>().using({
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/crm/views/${args.id}`,
  key: (args) => savedViewsQueryKeys.savedView(args.id),
})
