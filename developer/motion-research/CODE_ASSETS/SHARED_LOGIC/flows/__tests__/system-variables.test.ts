import { createStableFlowKey, FLOW_KEY_VIRTUAL_PREFIX } from '../keys'
import {
  isVirtualVariableKey,
  PROJECT_NAME_FLOW_KEY,
} from '../system-variables'

describe('isVirtualVariableKey', () => {
  it('should return true if the key starts with FLOW_KEY_VIRTUAL_PREFIX', () => {
    const key = FLOW_KEY_VIRTUAL_PREFIX + '123'

    expect(isVirtualVariableKey(key)).toBe(true)
  })

  it('should return false if the key does not start with FLOW_KEY_VIRTUAL_PREFIX', () => {
    const key = createStableFlowKey('1234')

    expect(isVirtualVariableKey(key)).toBe(false)
  })

  it('should return false if the key is a system variable', () => {
    const key = PROJECT_NAME_FLOW_KEY

    expect(isVirtualVariableKey(key)).toBe(false)
  })
})
