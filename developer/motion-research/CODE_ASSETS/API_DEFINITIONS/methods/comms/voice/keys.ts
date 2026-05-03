import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('comms/voice'),
  voiceModels: (id?: string) =>
    createKey(queryKeys.root(), 'voice-models', id ?? 'all'),
}
