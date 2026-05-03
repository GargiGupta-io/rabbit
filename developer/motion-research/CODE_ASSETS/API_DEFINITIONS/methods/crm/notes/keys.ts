import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('crm/notes'),
  entityNotes: (entityId: string) =>
    createKey(queryKeys.root(), 'entity', entityId),
}
