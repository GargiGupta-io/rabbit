import {
  formatNumberValue,
  truncateDecimalsInTextNumber,
} from '../number-text-utils'

describe(truncateDecimalsInTextNumber, () => {
  it('should truncate decimal text if needed', () => {
    expect(truncateDecimalsInTextNumber('123.456')).toEqual(123.45)
    expect(truncateDecimalsInTextNumber('123.456', 3)).toEqual(123.456)
    expect(truncateDecimalsInTextNumber('123.456')).toEqual(123.45)
    expect(truncateDecimalsInTextNumber('123.456abc')).toEqual(123.45)
  })

  it('should return NaN for non-number string failing parseFloat', () => {
    expect(truncateDecimalsInTextNumber('abc123.456abc')).toBeNaN()
  })
})

describe(formatNumberValue, () => {
  it('should truncate decimal text if needed', () => {
    expect(formatNumberValue(1234.45, 'formatted')).toEqual('1,234.45')
    expect(formatNumberValue(1234.45, 'percent')).toEqual('1234.45%')
    expect(formatNumberValue(1234.45, 'plain')).toEqual('1234.45')
    expect(formatNumberValue(0.0, 'formatted')).toEqual('0')
    expect(formatNumberValue(0.0, 'percent')).toEqual('0%')
    expect(formatNumberValue(0.0, 'plain')).toEqual('0')
  })

  it('should handle empty values', () => {
    expect(formatNumberValue('', 'formatted')).toEqual('')
    expect(formatNumberValue('', 'plain')).toEqual('')
    expect(formatNumberValue('', 'percent')).toEqual('')
  })
})
