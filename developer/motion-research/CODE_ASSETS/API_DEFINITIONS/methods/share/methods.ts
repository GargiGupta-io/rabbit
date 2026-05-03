import { defineApi, defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import type { RouteTypes } from '../types'

type Share = RouteTypes<'ShareController_share'>

export const shareItem = defineMutation<
  Share['request'],
  Share['response']
>().using({
  uri: '/v2/share',
  method: 'PATCH',
  invalidate: (args) => queryKeys.byId(args.resourceType, args.resourceId),
})

type GetShares = RouteTypes<'ShareController_getShares'>

export const getShares = defineApi<
  GetShares['request'],
  GetShares['response']
>().using({
  uri: (args) => {
    const searchParams = new URLSearchParams()
    searchParams.set('resourceType', args.resourceType)
    searchParams.set('resourceId', args.resourceId)
    return `/v2/share?${searchParams.toString()}`
  },
  method: 'GET',
  key: (args) => queryKeys.byId(args.resourceType, args.resourceId),
})

type GetPublishStatus = RouteTypes<'ShareController_getPublishStatus'>

export const getPublishStatus = defineApi<
  GetPublishStatus['request'],
  GetPublishStatus['response']
>().using({
  uri: (args) => {
    const searchParams = new URLSearchParams()
    searchParams.set('resourceType', args.resourceType)
    searchParams.set('resourceId', args.resourceId)
    return `/v2/share/publish?${searchParams.toString()}`
  },
  method: 'GET',
  key: (args) => queryKeys.publishStatus(args.resourceType, args.resourceId),
})

type PublishResource = RouteTypes<'ShareController_publishResource'>

export const publishResource = defineMutation<
  PublishResource['request'],
  PublishResource['response']
>().using({
  uri: '/v2/share/publish',
  method: 'POST',
})
