import { createKey } from '@motion/rpc'

import { MarkItemAsRead } from './mutations'

export const queryKeys = {
  root: () => createKey('inbox'),
  items: () => createKey(queryKeys.root(), 'items'),
  unreadCount: () => createKey(queryKeys.root(), 'unread-count'),
  markItemAsRead: (args: MarkItemAsRead['request']) => {
    if (args.type === 'single') {
      return createKey(queryKeys.root(), 'mark-item-as-read', args.itemId)
    } else if (args.type === 'multiple') {
      return createKey(queryKeys.root(), 'mark-item-as-read', ...args.itemIds)
    }

    return createKey(queryKeys.root(), 'mark-item-as-read', 'all')
  },
}
