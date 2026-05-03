import { createKey } from '@motion/rpc'

import { GetIntegrationPayloads } from './queries'

export const queryKeys = {
  root: () => createKey('integrations'),

  groups: () => createKey(queryKeys.root(), 'groups'),
  connectionsRoot: () => createKey(queryKeys.root(), 'connections'),
  connections: (platformId?: string) =>
    createKey(queryKeys.connectionsRoot(), platformId ?? 'all'),
  countsByUser: () => createKey(queryKeys.root(), 'counts-by-user'),

  payloads: (args: GetIntegrationPayloads['request']) => [
    ...queryKeys.root(),
    'payloads',
    args,
  ],
}
