import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('comms/agents'),
  agentListing: () => createKey(queryKeys.root(), 'listing'),
  agentById: (id: string) => createKey(queryKeys.root(), 'agents', id),
  phoneNumbers: () => createKey(queryKeys.root(), 'phone-numbers'),
}
