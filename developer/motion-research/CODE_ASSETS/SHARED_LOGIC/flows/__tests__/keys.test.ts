import { createStableFlowKey } from '../keys'

describe('flow keys', () => {
  describe('createStableFlowKey', () => {
    it('should return a string with the correct prefix', () => {
      const key = createStableFlowKey()

      expect(key.startsWith('flow_key_')).toBe(true)
    })

    it('should return a unique key each time it is called', () => {
      const key1 = createStableFlowKey()
      const key2 = createStableFlowKey()

      expect(key1).not.toBe(key2)
    })
  })
})
