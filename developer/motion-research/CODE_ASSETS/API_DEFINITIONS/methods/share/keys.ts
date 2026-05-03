import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('share'),
  byId: (resourceType: string, resourceId: string) =>
    createKey(queryKeys.root(), resourceType, resourceId),
  publishStatus: (resourceType: string, resourceId: string) =>
    createKey(queryKeys.byId(resourceType, resourceId), 'publish'),
}
