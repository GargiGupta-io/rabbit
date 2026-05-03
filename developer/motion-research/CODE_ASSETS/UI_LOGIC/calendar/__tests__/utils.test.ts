import { createTemporaryCalendar, getCalProvider } from '../utils'

describe('createTemporaryCalendar', () => {
  it('creates temporary calendar ', () => {
    const tempCal = createTemporaryCalendar('test@example.com', {
      id: 'id',
      userId: 'userId',
      email: 'test@example.com',
      name: 'name',
      providerType: 'GOOGLE',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
      ],
      status: 'OK',
      calendarSyncEnabled: true,
      emailSyncEnabled: true,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
    })

    expect(tempCal.emailAccountId).toBe('id')
  })
})

describe(getCalProvider, () => {
  it('returns calendar provider type', () => {
    expect(getCalProvider('google.com')).toBe('GOOGLE')
    expect(getCalProvider('apple.com')).toBe('APPLE')
    expect(getCalProvider('microsoft.com')).toBe('MICROSOFT')
    expect(getCalProvider(undefined)).toBe(undefined)
  })
})
