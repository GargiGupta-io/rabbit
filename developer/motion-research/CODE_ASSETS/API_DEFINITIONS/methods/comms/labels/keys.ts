import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: createKey('comms/items/labels'),
  labels: (params?: { includeDisabled?: boolean }) =>
    createKey(
      queryKeys.root,
      'list',
      params?.includeDisabled ? 'all' : 'enabled'
    ),
}
