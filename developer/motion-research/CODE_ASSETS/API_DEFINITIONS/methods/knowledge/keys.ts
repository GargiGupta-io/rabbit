import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: createKey('v2/knowledge'),
  entries: () => createKey(queryKeys.root, 'entries'),
  byId: (id: string) => createKey(queryKeys.root, 'by-id', id),
}
