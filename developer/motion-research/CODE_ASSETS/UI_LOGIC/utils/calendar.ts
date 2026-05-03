import {
  type Calendar,
  type CalendarEvent,
  type CalendarList,
  type CalendarProviderType,
  type Contact,
  type DeprecatedCalendar,
  type EmailAccount,
} from '@motion/rpc-types/legacy'
import { type EventConferenceType } from '@motion/shared/common'
import {
  byProperty,
  byValue,
  cascade,
  Compare,
  ordered,
} from '@motion/utils/array'
import { type CalendarSchema } from '@motion/zod/client'

export function getEventOrganizer(event: Partial<CalendarEvent>) {
  if (event.organizer) {
    return event.organizer.displayName || event.organizer.email
  }

  return event.email ?? ''
}

export function getCalendarForEvent(
  event: CalendarEvent,
  calendarList: CalendarList
) {
  const calendars = calendarList[event.email] ?? []
  return calendars.find((c) => c.id === event.calendarId)
}

const commonConferenceTypes = ['none', 'zoom', 'phone', 'customLocation']
const googleOnlyConferenceTypes = ['meet', 'hangoutsMeet', 'teamsForBusiness']
const msOnlyConferenceTypes = ['teamsForBusiness']
export function isValidConferenceTypeForProviderType(
  conferenceType: EventConferenceType,
  providerType: CalendarProviderType
) {
  if (commonConferenceTypes.includes(conferenceType)) {
    return true
  }
  if (
    providerType === 'GOOGLE' &&
    googleOnlyConferenceTypes.includes(conferenceType)
  ) {
    return true
  }
  if (
    providerType === 'MICROSOFT' &&
    msOnlyConferenceTypes.includes(conferenceType)
  ) {
    return true
  }
  return false
}

export const isMainCalendar = (
  email: string,
  mainCalendarEmail: string,
  isPrimary: boolean
) => email === mainCalendarEmail && isPrimary

export function getMainCalendars(calendarList: CalendarList) {
  const mainCalendars: DeprecatedCalendar[] = []
  const mainCalendarEmails = Object.keys(calendarList)

  mainCalendarEmails.forEach((email) => {
    const calendars = calendarList[email]
    const mainCalendar = calendars.find((c) => c.primary && c.email === email)
    if (mainCalendar) {
      mainCalendars.push(mainCalendar)
    }
  })

  return mainCalendars
}

export function isCalendarRemovableFromMyCalendars(
  calendar: Pick<Calendar, 'emailAccountId' | 'isInMyCalendars' | 'isPrimary'>,
  mainEmailAccountId: string | undefined | null
) {
  if (mainEmailAccountId == null) return false
  const isMainAccountPrimaryCalendar =
    calendar.emailAccountId === mainEmailAccountId && !!calendar.isPrimary
  return !isMainAccountPrimaryCalendar
}

export function isCalendarRemovableFromAccount(
  calendar: Pick<Calendar, 'isInMyCalendars' | 'isPrimary'>
) {
  return !calendar.isPrimary && !calendar.isInMyCalendars
}

type CalendarSortProps = Pick<
  Calendar,
  'emailAccountId' | 'isPrimary' | 'title'
>

export function sortCalendars<T extends CalendarSortProps>(
  calendars: T[],
  mainEmailAccountId?: string
) {
  return calendars.sort(
    cascade(
      byValue(
        (item) => item.emailAccountId === mainEmailAccountId,
        ordered([true, false])
      ),
      byValue((item) => Boolean(item.isPrimary), ordered([true, false])),
      byProperty('title', Compare.string)
    )
  )
}

export function findCalendarForContact<T extends Calendar | CalendarSchema>(
  contact: Contact,
  emailAccounts: EmailAccount[],
  calendars: T[]
): T | undefined {
  if (!contact.account) {
    return undefined
  }

  const emailAccount = emailAccounts.find((e) => e.email === contact.account)
  if (!emailAccount) {
    return undefined
  }

  return calendars.find(
    (c) =>
      c.providerId === contact.email && c.emailAccountId === emailAccount.id
  )
}

type CalendarOption = Pick<
  Calendar,
  | 'id'
  | 'accessRole'
  | 'deletedTime'
  | 'isPrimary'
  | 'emailAccountId'
  | 'providerId'
  | 'title'
>

/**
 * @deprecated use `getEditableCalendars` with new `CalendarSchema` type
 */
export function getDeprecatedEditableCalendars<T extends CalendarOption>(
  calendars: T[]
) {
  return sortCalendars(
    calendars.filter(
      (c) =>
        !c.deletedTime &&
        (c.isPrimary || c.accessRole === 'OWNER' || c.accessRole === 'EDITOR')
    )
  )
}

export function getEditableCalendars(calendars: CalendarSchema[]) {
  return sortCalendars(
    calendars.filter(
      (c) =>
        c.isPrimary || c.accessRole === 'OWNER' || c.accessRole === 'EDITOR'
    )
  )
}

/* c8 ignore start */
export const calendarProviderTypeToName: Record<CalendarProviderType, string> =
  {
    APPLE: 'Apple',
    GOOGLE: 'Google',
    MICROSOFT: 'Microsoft',
  }
/* c8 ignore stop */
