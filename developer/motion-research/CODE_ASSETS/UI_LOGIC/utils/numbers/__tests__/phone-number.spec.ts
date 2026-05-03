import { formatPhoneNumber } from '../phone-number'

describe('formatPhoneNumber', () => {
  it('should format a phone number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
  })

  it('should format a phone number with international code', () => {
    expect(formatPhoneNumber('+11234567890')).toBe('(123) 456-7890')
  })

  it('should return null if the phone number is not valid', () => {
    expect(formatPhoneNumber('1234123123567890')).toBeNull()
  })
})
