import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('comms/inbox/routing-rules'),
  routingRules: (inboxSourceId?: string, targetInboxId?: string) => {
    const parts = ['list']
    if (inboxSourceId) {
      parts.push('source', inboxSourceId)
    }
    if (targetInboxId) {
      parts.push('target', targetInboxId)
    }
    return createKey(queryKeys.root(), ...parts)
  },
  routingRule: (ruleId: string) =>
    createKey(queryKeys.root(), 'detail', ruleId),
}
