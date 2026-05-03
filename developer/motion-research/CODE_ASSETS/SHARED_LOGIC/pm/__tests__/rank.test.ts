import { getNextRank } from '../rank'

describe('getNextRank', () => {
  it('should return the correct rank when starting a 0', () => {
    const position = 0
    const expected = '00001'
    const result = getNextRank(position)

    expect(result).toEqual(expected)
  })

  it('should return the correct rank when starting a 1', () => {
    const position = 1
    const expected = '00009'
    const result = getNextRank(position)

    expect(result).toEqual(expected)
  })

  it('should return the correct rank when starting a 2', () => {
    const position = 2
    const expected = '0000h'
    const result = getNextRank(position)

    expect(result).toEqual(expected)
  })
})
