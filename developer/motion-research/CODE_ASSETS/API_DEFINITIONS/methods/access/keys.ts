import { createKey } from '@motion/rpc'

import { RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['v2', 'access']),
  query: (
    args: Partial<RouteTypes<'AccessController_checkAccess'>['request']>
  ) => createKey(queryKeys.root, args as any),
}
