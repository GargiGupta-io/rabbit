import { addSchemeIfNeeded } from '../url-utils'

describe('url-utils', () => {
  it('returns null when null', () => {
    expect(addSchemeIfNeeded(null)).toEqual(null)
  })

  it('returns empty when empty string', () => {
    expect(addSchemeIfNeeded('')).toEqual('')
  })

  it('should not add scheme for invalid urls', () => {
    expect(addSchemeIfNeeded('invalid url')).toEqual('invalid url')
    expect(addSchemeIfNeeded('global penguin society')).toEqual(
      'global penguin society'
    )
    expect(addSchemeIfNeeded('invalid url.com')).toEqual('invalid url.com')
  })

  it('should add scheme', () => {
    expect(addSchemeIfNeeded('google.com')).toEqual('https://google.com')
  })

  it('should not add scheme if it exists', () => {
    expect(addSchemeIfNeeded('http://google.com')).toEqual('http://google.com')
    expect(addSchemeIfNeeded('ws://ws.google.com')).toEqual(
      'ws://ws.google.com'
    )
    expect(addSchemeIfNeeded('file:///text.txt')).toEqual('file:///text.txt')
  })
})
