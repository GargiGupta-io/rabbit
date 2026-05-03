import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../../types'

// Labels
type GetLabels = RouteTypes<'CommsItemLabelDefinition_GetLabels'>
export const getLabels = defineApi<
  GetLabels['request'],
  GetLabels['response']
>().using({
  key: () => queryKeys.labels(),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/items/labels`,
})

// Labels by Inbox
type GetLabelsByInbox = RouteTypes<'CommsItemLabelDefinition_GetLabelsByInbox'>
export const getLabelsByInbox = defineApi<
  GetLabelsByInbox['request'],
  GetLabelsByInbox['response']
>().using({
  key: (params) => queryKeys.labels(params),
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/api/comms/items/labels/by-inbox`,
})
