import { getCalendarProvider } from '../user'

describe('getCalendarProvider', () => {
  it('should return "APPLE" for login provider "apple.com"', () => {
    const loginProvider = 'apple.com'
    const result = getCalendarProvider(loginProvider)

    expect(result).toBe('APPLE')
  })

  it('should return "GOOGLE" for login provider "google.com"', () => {
    const loginProvider = 'google.com'
    const result = getCalendarProvider(loginProvider)

    expect(result).toBe('GOOGLE')
  })

  it('should return "MICROSOFT" for login provider "microsoft.com"', () => {
    const loginProvider = 'microsoft.com'
    const result = getCalendarProvider(loginProvider)

    expect(result).toBe('MICROSOFT')
  })

  it('should return undefined for an unknown login provider', () => {
    const loginProvider = 'unknown.com'
    const result = getCalendarProvider(loginProvider)

    expect(result).toBeUndefined()
  })
})
