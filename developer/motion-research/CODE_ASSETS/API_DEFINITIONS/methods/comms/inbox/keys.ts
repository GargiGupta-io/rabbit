import { createKey } from '@motion/rpc'

import { RouteTypes } from '../../types'

export const COMMS_ITEMS_PAGE_KEY_SEGMENT = 'comms-items-page'

export const queryKeys = {
  root: () => createKey('comms/inbox'),
  inboxes: () => createKey(queryKeys.root(), 'inboxes', 'all'),
  inbox: (inboxId: string) => createKey(queryKeys.root(), 'inbox', inboxId),
  inboxItems: (inboxId: string) =>
    createKey(queryKeys.root(), 'inbox-items', inboxId),
  personalItems: () => createKey(queryKeys.root(), 'personal-items'),
  allUnreadCounts: () => createKey(queryKeys.root(), 'all-unread-counts'),
  personalSubscriptions: () =>
    createKey(queryKeys.root(), 'personal-subscriptions'),
  sources: () => createKey(queryKeys.root(), 'sources', 'all'),
  source: (sourceId: string) => createKey(queryKeys.root(), 'source', sourceId),
  commsItems: (args: RouteTypes<'CommsItem_GetCommsItems'>['request']) =>
    createKey(
      queryKeys.root(),
      'comms-item',
      ...Object.entries(args ?? {})
        // Do not include pagination related filters in the key
        .filter(([key]) => key !== 'before' && key !== 'after')
        // Don't include undefined/null values in query keys
        .filter(([key, value]) => {
          // InboxId sometimes undefined/null and sometimes 'personal', this is a defensive clause to ensure they get coalesced into the same query key
          if (key === 'inboxId' && value === 'personal') {
            return false
          }
          return !(value === null || value === undefined || value === '')
        })
        .map((entry) => entry.join('-'))
        .sort()
    ),
  commsItemRoot: () => createKey(queryKeys.root(), 'comms-item'),
  commsItem: (itemId: string) => createKey(queryKeys.commsItemRoot(), itemId),
  inboxShape: () => createKey(queryKeys.root(), 'inbox-shape'),
  syncStatus: (workflowId: string) =>
    createKey(queryKeys.root(), 'sync-status', workflowId),
  // Includes pagination params - for single-page fetches where each page needs unique cache
  commsItemsPage: (args: RouteTypes<'CommsItem_GetCommsItems'>['request']) =>
    createKey(
      queryKeys.root(),
      COMMS_ITEMS_PAGE_KEY_SEGMENT,
      ...Object.entries(args ?? {})
        .filter(
          ([, value]) =>
            !(value === null || value === undefined || value === '')
        )
        .map((entry) => entry.join('-'))
        .sort()
    ),
}
