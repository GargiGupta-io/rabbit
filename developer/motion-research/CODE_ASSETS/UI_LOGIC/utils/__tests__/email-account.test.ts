import {
  CalendarProviderType,
  type EmailAccount,
  EmailAccountStatus,
} from '@motion/rpc-types/legacy'

import { isPasswordValid, sortEmailAccounts } from '../email-account'

describe('email-account', () => {
  test('sortEmailAccounts sorts main email account first', () => {
    const mainEmailAccountId = '1'
    const mainEmailAccount = createFakeEmailAccount({
      id: mainEmailAccountId,
      name: 'Main',
    })

    const emailAccounts: EmailAccount[] = [
      createFakeEmailAccount({ id: '2', name: 'Second' }),
      mainEmailAccount,
    ]

    const result = sortEmailAccounts(emailAccounts, mainEmailAccountId)

    expect(result[0]).toBe(mainEmailAccount)
  })

  test('sortEmailAccounts sorts by email', () => {
    const mainEmailAccountId = '1'
    const mainEmailAccount = createFakeEmailAccount({
      id: mainEmailAccountId,
      email: 'a',
    })

    const emailAccounts: EmailAccount[] = [
      mainEmailAccount,
      createFakeEmailAccount({ id: '3', email: 'c' }),
      createFakeEmailAccount({ id: '2', email: 'b' }),
    ]

    const result = sortEmailAccounts(emailAccounts, mainEmailAccountId)

    expect(result[1].id).toEqual('2')
    expect(result[2].id).toEqual('3')
  })
})

function createFakeEmailAccount(
  overrides: Pick<EmailAccount, 'id'> & Partial<EmailAccount>
): EmailAccount {
  return {
    email: '',
    name: '',
    providerType: CalendarProviderType.GOOGLE,
    userId: '',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
    ],
    status: EmailAccountStatus.OK,
    calendarSyncEnabled: true,
    emailSyncEnabled: true,
    createdTime: new Date().toISOString(),
    updatedTime: null,
    ...overrides,
  }
}

describe('isPasswordValid', () => {
  it('should return true for a valid password', () => {
    const validPasswords = ['password123', 'password', '12345678', '!@#$%^&*']

    validPasswords.forEach((password) => {
      expect(isPasswordValid(password)).toBe(true)
    })
  })

  it('should return false for an invalid password', () => {
    const invalidPasswords = ['1234567']

    invalidPasswords.forEach((password) => {
      expect(isPasswordValid(password)).toBe(false)
    })
  })
})
