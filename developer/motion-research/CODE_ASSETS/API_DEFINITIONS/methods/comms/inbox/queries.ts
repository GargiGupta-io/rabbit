import { defineApi, defineInfiniteQuery } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../../types'

// Inboxes
type GetInboxes = RouteTypes<'Inbox_ListInboxes'>
export const getInboxes = defineApi<
  GetInboxes['request'],
  GetInboxes['response']
>().using({
  key: (args) => queryKeys.inboxes(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/inboxes`,
})

type GetInbox = RouteTypes<'Inbox_GetInbox'>
export const getInbox = defineApi<
  GetInbox['request'],
  GetInbox['response']
>().using({
  key: (args) => queryKeys.inbox(args.inboxId),
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/inboxes/${args.inboxId}`,
  enabled: (args) => !!args.inboxId,
})

type GetInboxItems = RouteTypes<'Inbox_GetInboxItems'>
export const getInboxItems = defineInfiniteQuery<
  GetInboxItems['request'],
  GetInboxItems['response']
>().using({
  key: (args) => queryKeys.inboxItems(args.inboxId),
  method: 'GET',
  getNextPageParam: (lastPage) => {
    const lastId = lastPage.ids.at(-1)
    if (!lastId) return undefined

    const last = lastPage.models.commsItems[lastId]
    if (!last) return undefined
    return { before: last.createdAt }
  },
  initialPageParam: undefined,
  uri: (args) => {
    const params = new URLSearchParams()
    if (args.before !== undefined) {
      params.set('before', String(args.before))
    }
    if (args.after !== undefined) {
      params.set('after', String(args.after))
    }
    if (args.limit !== undefined) {
      params.set('limit', String(args.limit))
    }
    const queryString = params.toString()
    return `${__NET_HOST__}/v1/api/comms/inboxes/${args.inboxId}/items${queryString ? `?${queryString}` : ''}`
  },
  enabled: (args) => !!args.inboxId,
})

type GetPersonalItems = RouteTypes<'Inbox_GetPersonalItems'>
export const getPersonalItems = defineApi<
  GetPersonalItems['request'],
  GetPersonalItems['response']
>().using({
  key: () => queryKeys.personalItems(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/inboxes/personal/items`,
})

// Unread Counts
type GetAllInboxUnreadCounts = RouteTypes<'Inbox_GetAllInboxUnreadCounts'>
export const getAllInboxUnreadCounts = defineApi<
  GetAllInboxUnreadCounts['request'],
  GetAllInboxUnreadCounts['response']
>().using({
  key: () => queryKeys.allUnreadCounts(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/inboxes/unread-count/all`,
})

// Personal Inbox Subscriptions
type GetPersonalSubscriptions =
  RouteTypes<'PersonalInboxSubscription_ListSources'>
export const getPersonalSubscriptions = defineApi<
  GetPersonalSubscriptions['request'],
  GetPersonalSubscriptions['response']
>().using({
  key: () => queryKeys.personalSubscriptions(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/personal-inbox-subscriptions`,
})

// Inbox Sources
type GetInboxSources = RouteTypes<'InboxSource_ListSources'>
export const getInboxSources = defineApi<
  GetInboxSources['request'],
  GetInboxSources['response']
>().using({
  key: () => queryKeys.sources(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/sources`,
})

type GetInboxSource = RouteTypes<'InboxSource_GetSource'>
export const getInboxSource = defineApi<
  GetInboxSource['request'],
  GetInboxSource['response']
>().using({
  key: (args) => queryKeys.source(args.sourceId),
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/sources/${args.sourceId}`,
  enabled: (args) => !!args.sourceId,
})

// Comms Items
type GetCommsItems = RouteTypes<'CommsItem_GetCommsItems'>

// Single-page fetch for sync/indexing use cases
export const getCommsItemsPage = defineApi<
  GetCommsItems['request'],
  GetCommsItems['response']
>().using({
  key: (args) => queryKeys.commsItemsPage(args),
  method: 'GET',
  uri: (args) => {
    const params = new URLSearchParams()

    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value))
      }
    })

    const queryString = params.toString()

    return `${__NET_HOST__}/v1/api/comms/items${queryString ? `?${queryString}` : ''}`
  },
})

export const getInfiniteCommsItems = defineInfiniteQuery<
  GetCommsItems['request'],
  GetCommsItems['response']
>().using({
  key: (args) => queryKeys.commsItems(args),
  uri: (args) => {
    const params = new URLSearchParams()

    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value))
      }
    })

    const queryString = params.toString()

    return `${__NET_HOST__}/v1/api/comms/items${queryString ? `?${queryString}` : ''}`
  },
  getNextPageParam: (lastPage) => {
    const lastId = lastPage.ids.at(-1)
    if (!lastId) return undefined

    const last = lastPage.models.commsItems[lastId]
    if (!last) return undefined
    return { before: last.timestamp }
  },
  initialPageParam: undefined,
})

type GetCommsItem = RouteTypes<'CommsItem_GetCommsItem'>
export const getCommsItem = defineApi<
  GetCommsItem['request'],
  GetCommsItem['response']
>().using({
  key: (args) => queryKeys.commsItem(args.commsItemId),
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/items/${args.commsItemId}`,
  enabled: (args) => !!args.commsItemId,
})

type GetInboxShape = RouteTypes<'Inbox_GetInboxShape'>
export const getInboxShape = defineApi<
  GetInboxShape['request'],
  GetInboxShape['response']
>().using({
  key: () => queryKeys.inboxShape(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/inboxes/shape`,
})

type GetSyncStatus = RouteTypes<'EmailSync_GetSyncStatus'>
export const getSyncStatus = defineApi<
  GetSyncStatus['request'],
  GetSyncStatus['response']
>().using({
  key: (args) => queryKeys.syncStatus(args.workflowId),
  method: 'GET',
  uri: (args) => `${__NET_HOST__}/v1/api/email/sync/${args.workflowId}/status`,
  enabled: (args) => !!args.workflowId,
})
