import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('booking'),
  templates: () => createKey(queryKeys.root(), 'templates'),
  settings: () => createKey(queryKeys.root(), 'settings'),
}
