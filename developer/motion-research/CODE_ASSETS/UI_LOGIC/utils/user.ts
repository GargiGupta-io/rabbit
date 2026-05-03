import { type CalendarProviderType } from '@motion/rpc-types/legacy'

export function getCalendarProvider(
  loginProvider: string
): CalendarProviderType | undefined {
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
