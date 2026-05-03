import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: createKey('v2/notifications'),
  query: () => createKey(queryKeys.root),
  preferences: () => createKey(queryKeys.root, 'preferences'),
}
