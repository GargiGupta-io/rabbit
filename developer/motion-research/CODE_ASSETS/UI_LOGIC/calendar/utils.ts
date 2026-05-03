import {
  type CalendarProviderType,
  type EmailAccount,
  type TemporaryCalendar,
} from '@motion/rpc-types/legacy'

export const createTemporaryCalendar = (
  calendarEmail: string,
  emailAccount: EmailAccount
): TemporaryCalendar => ({
  id: `temp-${calendarEmail}`,
  userId: '',
  emailAccountId: emailAccount.id,
  type: 'DEFAULT',
  providerId: `temp-${calendarEmail}`,
  accessRole: 'VIEWER',
  allowedConferenceTypes: [],
  colorId: '3',
  isEnabled: true,
  isInFrequentlyMet: false,
  isInMyCalendars: false,
  isPrimary: null,
  providerType: emailAccount.providerType,
  title: calendarEmail,
  status: 'OK',
  isDeleted: false,
  createdTime: new Date().toISOString(),
  updatedTime: null,
  isTemporary: true,
  deletedTime: null,
})

export function getCalProvider(
  loginProvider: string | undefined
): CalendarProviderType | undefined {
  if (!loginProvider) return undefined
  switch (loginProvider) {
    case 'apple.com':
      return 'APPLE'
    case 'google.com':
      return 'GOOGLE'
    case 'microsoft.com':
      return 'MICROSOFT'
    default:
      return undefined
  }
}
