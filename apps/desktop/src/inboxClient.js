import { createMotionKey, defineMutation, defineQuery } from './apiClient.js';

export const queryKeys = {
  root: () => createMotionKey('inbox'),
  items: () => createMotionKey(queryKeys.root(), 'items'),
  unreadCount: () => createMotionKey(queryKeys.root(), 'unread-count'),
  markItemAsRead: (args = {}) => {
    if (args.type === 'single') {
      return createMotionKey(queryKeys.root(), 'mark-item-as-read', args.itemId);
    }

    if (args.type === 'multiple') {
      return createMotionKey(queryKeys.root(), 'mark-item-as-read', ...(Array.isArray(args.itemIds) ? args.itemIds : []));
    }

    return createMotionKey(queryKeys.root(), 'mark-item-as-read', 'all');
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
