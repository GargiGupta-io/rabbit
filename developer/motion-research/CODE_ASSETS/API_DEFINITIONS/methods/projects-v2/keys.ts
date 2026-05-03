import { createKey } from '@motion/rpc'

import type { QueryKey } from '@tanstack/react-query'

export const queryKeys = {
  root: () => createKey('v2-projects'),
  byId: (id: string) => createKey(queryKeys.root(), 'by-id', id) as QueryKey,
  queryByIds: (ids: string[]) =>
    createKey(queryKeys.root(), 'query-by-ids', ids.sort()) as QueryKey,
}
