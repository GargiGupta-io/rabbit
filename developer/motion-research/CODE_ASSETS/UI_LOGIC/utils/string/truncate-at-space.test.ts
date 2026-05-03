import { truncateAtSpace } from './truncate-at-space'

describe('truncateAtSpace', () => {
  it('should truncate the string with placeholder if it exceeds the specified length', () => {
    const str = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const truncatedStr = truncateAtSpace(str, 20)

    expect(truncatedStr).toEqual('Lorem ipsum dolor…')
  })

  it('should not truncate the string if it is shorter than the specified length', () => {
    const str = 'Short string'
    const truncatedStr = truncateAtSpace(str, 20)

    expect(truncatedStr).toEqual('Short string')
  })

  it('should truncate the string at the last space before the specified length', () => {
    const str = 'This is a long string without any spaces'
    const truncatedStr = truncateAtSpace(str, 20)

    expect(truncatedStr).toEqual('This is a long…')
  })

  it('should allow custom placeholder', () => {
    const str = 'This is a long string without any spaces'
    const truncatedStr = truncateAtSpace(str, 20, '...')

    expect(truncatedStr).toEqual('This is a long...')
  })

  it('should work for very long strings without spaces', () => {
    const str = 'a'.repeat(1000)
    const truncatedStr = truncateAtSpace(str, 20)

    expect(truncatedStr).toEqual('a'.repeat(19) + '…')
  })
})
