import { createKey } from '@motion/rpc'
import { type ScheduledEntitiesGetSchema } from '@motion/zod/client'

export const queryKeys = {
  root: createKey('v2/scheduled-entities'),
  query: (args?: ScheduledEntitiesGetSchema) =>
    createKey(queryKeys.root, args as any),
}
