import { defineApi, defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import type { RouteTypes } from '../types'

/**
 * .NET version of the share methods.
 */

type Share = RouteTypes<'Share_ShareEntity'>

export const shareItem = defineMutation<
  Share['request'],
  Share['response']
>().using({
  uri: `${__NET_HOST__}/v1/share`,
  method: 'POST',
  invalidate: (args) => queryKeys.byId(args.entityType, args.entityId),
})

type GetShares = RouteTypes<'Share_ListShares'>

export const getShares = defineApi<
  GetShares['request'],
  GetShares['response']
>().using({
  uri: (args) =>
    `${__NET_HOST__}/v1/share/${args.entityType}/${args.entityId}/shares`,
  method: 'GET',
  key: (args) => queryKeys.byId(args.entityType, args.entityId),
})

type RemoveShare = RouteTypes<'Share_RemoveShare'>

export const removeShare = defineMutation<
  RemoveShare['request'],
  RemoveShare['response']
>().using({
  uri: `${__NET_HOST__}/v1/share`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.byId(args.entityType, args.entityId),
})

type BatchListShares = RouteTypes<'Share_BatchListShares'>

export const batchGetShares = defineApi<
  BatchListShares['request'],
  BatchListShares['response']
>().using({
  uri: `${__NET_HOST__}/v1/share/list-batch`,
  method: 'POST',
  key: (args) => ['shares', 'batch', args.entityType, args.entityIds],
})
