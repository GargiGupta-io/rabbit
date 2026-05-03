import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('secrets'),
  secrets: () => createKey(queryKeys.root(), 'list'),
  secret: (id: string) => createKey(queryKeys.secrets(), id),
}
