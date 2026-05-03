import { wrapVariableInDelimiters } from '../variables'

describe('wrapVariableInDelimiters', () => {
  it('should wrap the key in delimiters', () => {
    const key = 'flow_key_1'
    const formattedKey = wrapVariableInDelimiters(key)

    expect(formattedKey).toBe(`{{flow_key_1}}`)
  })
})
