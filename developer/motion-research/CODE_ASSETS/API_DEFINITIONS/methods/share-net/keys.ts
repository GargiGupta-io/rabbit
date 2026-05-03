import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('share-net'),
  byId: (resourceType: string, resourceId: string) =>
    createKey(queryKeys.root(), resourceType, resourceId),
}
