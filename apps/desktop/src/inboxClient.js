import { createQueryKey, defineMutation, defineQuery } from './apiClient.js';

export const queryKeys = {
  root: () => createQueryKey('inbox'),
  items: () => createQueryKey(queryKeys.root(), 'items'),
  unreadCount: () => createQueryKey(queryKeys.root(), 'unread-count'),
  markItemAsRead: (args = {}) => {
    if (args.type === 'single') {
      return createQueryKey(queryKeys.root(), 'mark-item-as-read', args.itemId);
    }

    if (args.type === 'multiple') {
      return createQueryKey(queryKeys.root(), 'mark-item-as-read', ...(Array.isArray(args.itemIds) ? args.itemIds : []));
    }

    return createQueryKey(queryKeys.root(), 'mark-item-as-read', 'all');
  }
};

export const getInboxItems = defineQuery({
  method: 'GET',
  uri: '/v2/notifications/items',
  key: () => queryKeys.items()
});

export const getUnreadInboxCount = defineQuery({
  method: 'GET',
  uri: '/v2/notifications/unread-count',
  key: () => queryKeys.unreadCount()
});

export const markInboxItemsAsRead = defineMutation({
  method: 'PATCH',
  uri: '/v2/notifications/mark-status',
  key: (args = {}) => queryKeys.markItemAsRead(args),
  body: (args = {}) => args
});
