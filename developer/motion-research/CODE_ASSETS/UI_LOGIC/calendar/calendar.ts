import { type Calendar, CalendarProviderType } from '@motion/rpc-types/legacy'
import { formatTime } from '@motion/utils/dates'
import { type CalendarEventSchemaV2 } from '@motion/zod/client'

import { type CalendarOptions } from '@fullcalendar/core'
import { DateTime } from 'luxon'

export const CALENDAR_VIEWS = {
  AGENDA: 'agenda',
  DAY: 'day',
  WEEK: 'week',
  THREE_DAY: '3-day',
  WEEK_DAYS: '5-day',
} as const

export type CalendarView = (typeof CALENDAR_VIEWS)[keyof typeof CALENDAR_VIEWS]
export type CalendarStartDay = 'monday' | 'sunday'
export type CalendarViewOptions = CalendarOptions['views']

export const calendarStartDayLabels: Record<CalendarStartDay, string> = {
  monday: 'Monday',
  sunday: 'Sunday',
}
export const calendarStartDayOptions = Object.keys(
  calendarStartDayLabels
) as CalendarStartDay[]

/**
 * ColorId 12 is not supported for setting on the calendar event instance for google.
 */
export const disabledGoogleEventColorIds: ColorId[] = ['12']

export const colorIds = [
  '0', // Default
  '1', // Google's Lavender
  '2', // Google's Sage
  '3', // Google's Grape
  '4', // Google's Flamingo
  '5', // Google's Banana
  '6', // Google's Tangerine
  '7', // Google's Peacock
  '8', // Google's Graphite
  '9', // Google's Blueberry
  '10', // Google's Basil
  '11', // Google's Tomato
  '12', // Not supported for Google
] as const

export const orderedColorIds: ColorId[] = [
  '9',
  '1',
  '3',
  '4',
  '11',
  '6',
  '7',
  '10',
  '0',
  '2',
  '5',
  '8',
]

export type ColorId = (typeof colorIds)[number]

export function isColorId(arg: unknown): arg is ColorId {
  return (
    !!arg &&
    typeof arg === 'string' &&
    (colorIds as readonly string[]).includes(arg)
  )
}

export function parseColorId(
  color: string | undefined | null,
  defaultValue: ColorId = '9'
): ColorId {
  return isColorId(color) ? color : defaultValue
}

export const formatTimeSlot = (date: DateTime, timezone?: string | null) => {
  const timeDate = timezone
    ? DateTime.fromMillis(date.toMillis(), { zone: timezone })
    : date

  return formatTime(timeDate, { optionalMinutes: true })
}

function eventIsForCalendar(
  event: Pick<CalendarEventSchemaV2, 'calendarId' | 'calendarUniqueId'>,
  calendar: Pick<Calendar, 'id' | 'providerId'>
): boolean {
  return (
    (event.calendarId != null && event.calendarId === calendar.id) ||
    (event.calendarUniqueId != null &&
      event.calendarUniqueId === calendar.id) ||
    (calendar.providerId != null && calendar.providerId === event.calendarId) ||
    (calendar.providerId != null &&
      calendar.providerId === event.calendarUniqueId)
  )
}

export function calendarHasEditableRole(
  calendar: Pick<Calendar, 'accessRole'>
): boolean {
  return calendar.accessRole === 'OWNER' || calendar.accessRole === 'EDITOR'
}

/**
 * Determines if a calendar event can be edited (dragged, resized, or modified in forms).
 *
 * This function consolidates the logic for both calendar drag/drop operations and
 * form editing permissions. It checks:
 * - Calendar access role (must be OWNER or EDITOR)
 * - Event organizer/host status
 * - Provider-specific rules (Apple calendar special handling)
 * - Event type restrictions (recurring events cannot be dragged)
 *
 * @param event - The calendar event, or null/undefined for new events (returns true)
 * @param calendar - The calendar object, or null/undefined (returns false)
 * @param hostEmail - Optional host email for organizer checks
 * @returns true if the event can be edited, false otherwise
 */
export function isCalendarEventEditable(
  event:
    | Pick<
        CalendarEventSchemaV2,
        | 'id'
        | 'providerId'
        | 'attendees'
        | 'email'
        | 'calendarId'
        | 'calendarUniqueId'
        | 'type'
        | 'organizer'
        | 'canAttendeesModify'
      >
    | null
    | undefined,
  calendar:
    | Pick<Calendar, 'id' | 'accessRole' | 'providerId' | 'providerType'>
    | null
    | undefined,
  hostEmail?: string | null | undefined
): boolean {
  // New events (event is null) are always editable
  if (event == null) {
    return true
  }

  // If calendar or hostEmail is missing, event is not editable
  // (we need calendar context to determine permissions)
  if (calendar == null) {
    return false
  }

  // Check if event belongs to this calendar
  if (!eventIsForCalendar(event, calendar)) {
    return false
  }

  // Check calendar access role
  const hasEditableRole = calendarHasEditableRole(calendar)
  if (!hasEditableRole) {
    return false
  }

  const curUserAttendee = event.attendees?.find((a) => a.email === event.email)
  const curUserIsOrganizer = curUserAttendee?.isOrganizer ?? false

  const hasPermissionToEdit =
    (!!hostEmail && event.organizer?.email === hostEmail) ||
    calendar.providerType === CalendarProviderType.APPLE ||
    !event.attendees ||
    !event.attendees.length ||
    curUserIsOrganizer

  if (!hasPermissionToEdit) {
    return false
  }

  return true
}

export function isHostOfEvent(
  event?: Pick<CalendarEventSchemaV2, 'attendees' | 'organizer' | 'email'>
) {
  if (!event) return false

  return Boolean(
    (event.organizer && event.organizer.email === event.email) ||
      (event.attendees &&
        event.attendees.find(
          (attendee) => attendee.isOrganizer && attendee.email === event.email
        ))
  )
}

export function allOtherAttendeesDeclined(
  attendees: CalendarEventSchemaV2['attendees'] | undefined,
  eventOwnerEmail: string
) {
  const eventOwnerAttendee =
    attendees?.find((attendee) => attendee.email === eventOwnerEmail) || null
  const eventOwnerDeclined = eventOwnerAttendee?.status === 'declined'
  const otherAttendees =
    attendees?.filter((attendee) => attendee.email !== eventOwnerEmail) ?? []

  return eventOwnerDeclined
    ? false
    : otherAttendees.length > 0 &&
        otherAttendees.every((attendee) => attendee.status === 'declined')
}
