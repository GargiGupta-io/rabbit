import { customAlphabet } from 'nanoid'

export const FLOW_VARIABLE_KEY_PREFIX = 'flow_key_'

export const FLOW_KEY_VIRTUAL_PREFIX = 'flow_key_virtual_'

const nanoid = customAlphabet('1234567890abcdef', 12)

export function createStableFlowKey<T extends string>(
  text?: T
): `flow_key_${T}` {
  if (!text) {
    return `${FLOW_VARIABLE_KEY_PREFIX}${nanoid()}` as `flow_key_${T}`
  }

  return `${FLOW_VARIABLE_KEY_PREFIX}${text}` as const
}

export function isFlowVariableKey(key: string | null): boolean {
  return key != null && key.startsWith(FLOW_VARIABLE_KEY_PREFIX)
}
