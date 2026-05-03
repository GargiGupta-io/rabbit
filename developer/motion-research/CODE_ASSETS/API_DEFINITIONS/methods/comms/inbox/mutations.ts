import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { type RouteTypes } from '../../types'
import { queryKeys as labelQueryKeys } from '../labels/keys'

// Inboxes
type CreateInbox = RouteTypes<'Inbox_CreateInbox'>
export const createInbox = defineMutation<
  CreateInbox['request'],
  CreateInbox['response']
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/api/comms/inboxes`,
  invalidate: (args) => [
    queryKeys.inboxes(),
    // Only invalidate labels if creating with label definitions
    ...(args.labelDefinitions && args.labelDefinitions.length > 0
      ? [labelQueryKeys.labels()]
      : []),
  ],
})

type UpdateInbox = RouteTypes<'Inbox_UpdateInbox'>
export const updateInbox = defineMutation<
  UpdateInbox['request'],
  UpdateInbox['response']
>().using({
  method: 'PATCH',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/inboxes/${args.inboxId}`,
  invalidate: (args) => {
    // Check if there are label changes
    const hasLabelChanges =
      (args.labelDefinitionsToCreate &&
        args.labelDefinitionsToCreate.length > 0) ||
      (args.labelDefinitionsToUpdate &&
        Object.keys(args.labelDefinitionsToUpdate).length > 0) ||
      (args.labelDefinitionsToDelete &&
        args.labelDefinitionsToDelete.length > 0)

    return [
      queryKeys.inbox(args.inboxId),
      queryKeys.inboxes(),
      // Only invalidate labels if there are label changes
      ...(hasLabelChanges ? [labelQueryKeys.labels()] : []),
    ]
  },
})

type DeleteInbox = RouteTypes<'Inbox_DeleteInbox'>
export const deleteInbox = defineMutation<
  DeleteInbox['request'],
  DeleteInbox['response']
>().using({
  method: 'DELETE',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/inboxes/${args.inboxId}`,
  invalidate: (args) => [queryKeys.inbox(args.inboxId), queryKeys.inboxes()],
})

// Personal Inbox Subscriptions
type AddPersonalSubscription = RouteTypes<'PersonalInboxSubscription_AddSource'>
export const addPersonalSubscription = defineMutation<
  AddPersonalSubscription['request'],
  AddPersonalSubscription['response']
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/api/comms/personal-inbox-subscriptions`,
  invalidate: () => queryKeys.personalSubscriptions(),
})

type RemovePersonalSubscription =
  RouteTypes<'PersonalInboxSubscription_RemoveSource'>
export const removePersonalSubscription = defineMutation<
  RemovePersonalSubscription['request'],
  RemovePersonalSubscription['response']
>().using({
  method: 'DELETE',
  uri: (args) =>
    `${__NET_HOST__}/v1/api/comms/personal-inbox-subscriptions/${args.sourceId}`,
  invalidate: () => queryKeys.personalSubscriptions(),
})

// Inbox Sources
type CreateInboxSource = RouteTypes<'InboxSource_CreateSource'>
export const createInboxSource = defineMutation<
  CreateInboxSource['request'],
  CreateInboxSource['response']
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/api/comms/sources`,
  invalidate: (args) => [
    queryKeys.sources(),
    queryKeys.inboxes(), // Invalidate inboxes to refresh source relationships
  ],
})

type UpdateInboxSource = RouteTypes<'InboxSource_UpdateSource'>
export const updateInboxSource = defineMutation<
  UpdateInboxSource['request'],
  UpdateInboxSource['response']
>().using({
  method: 'PATCH',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/sources/${args.sourceId}`,
  invalidate: (args) => [
    queryKeys.source(args.sourceId),
    queryKeys.sources(),
    queryKeys.inboxes(), // Invalidate inboxes to refresh source relationships
  ],
})

type DeleteInboxSource = RouteTypes<'InboxSource_DeleteSource'>
export const deleteInboxSource = defineMutation<
  DeleteInboxSource['request'],
  DeleteInboxSource['response']
>().using({
  method: 'DELETE',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/sources/${args.sourceId}`,
  invalidate: (args) => [
    queryKeys.source(args.sourceId),
    queryKeys.sources(),
    queryKeys.inboxes(), // Invalidate inboxes to refresh source relationships
    queryKeys.inboxShape(),
  ],
})

// Comms Items
type UpdateCommsItem = RouteTypes<'CommsItem_UpdateCommsItem'>
export const updateCommsItem = defineMutation<
  UpdateCommsItem['request'],
  UpdateCommsItem['response']
>().using({
  method: 'PATCH',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/items/${args.commsItemId}`,
  invalidate: (args) => [
    queryKeys.commsItems({}),
    queryKeys.commsItem(args.commsItemId),
    queryKeys.inboxItems(''),
    queryKeys.personalItems(),
  ],
})

type BatchUpdateCommsItems = RouteTypes<'CommsItem_BatchUpdate'>
export const batchUpdateCommsItems = defineMutation<
  BatchUpdateCommsItems['request'],
  BatchUpdateCommsItems['response']
>().using({
  method: 'PATCH',
  uri: () => `${__NET_HOST__}/v1/api/comms/items`,
  invalidate: (args) => [
    queryKeys.commsItems({}),
    queryKeys.inboxItems(''),
    queryKeys.personalItems(),
    queryKeys.allUnreadCounts(),
  ],
})
