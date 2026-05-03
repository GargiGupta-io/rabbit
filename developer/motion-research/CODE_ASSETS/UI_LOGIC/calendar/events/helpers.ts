import { type CalendarEventSchemaV2 } from '@motion/rpc-types'
import { type DateLike, parseDate } from '@motion/utils/dates'
import { type CalendarSchema } from '@motion/zod/client'

export function canAddToProject(
  event: CalendarEventSchemaV2 | null | undefined
) {
  if (event == null) return false

  return (
    event.meetingTaskId == null &&
    event.recurringEventId == null &&
    event.recurrence == null &&
    !event.isAllDay
  )
}

export function canRemoveFromProject(
  event: CalendarEventSchemaV2 | null | undefined
) {
  if (event == null) return false

  return event.meetingTaskId != null
}

/*
 *  This function is used to determine if an event is an all-day blocking event.
 *  It checks if the event is all-day, busy,
 *  as well as if the attendee found in the user's calendars is attending
 *  or if no attendees are found, that the user is the organizer
 */
export function isAllDayBlockingEvent(
  calendarEvent: CalendarEventSchemaV2,
  userMyCalendars: CalendarSchema[]
) {
  const filteredMyCalendarAttendees = calendarEvent.attendees?.filter(
    (attendee) =>
      userMyCalendars.some(
        (calendar) =>
          calendar.providerId === attendee.email ||
          calendarEvent.email === attendee.email
      )
  )

  const isOrganizer =
    (calendarEvent.attendees.length === 0 &&
      userMyCalendars.some(
        (calendar) => calendar.id === calendarEvent.calendarId
      )) ||
    calendarEvent.organizer?.email === calendarEvent.email

  const isAttendingOrOrganizer =
    filteredMyCalendarAttendees?.some(
      (attendee) => attendee.status !== 'declined'
    ) ||
    (calendarEvent.attendees.length === 0 && isOrganizer)

  return (
    calendarEvent.isAllDay &&
    calendarEvent.status === 'BUSY' &&
    userMyCalendars.some(
      (calendar) => calendar.id === calendarEvent.calendarUniqueId
    ) &&
    isAttendingOrOrganizer
  )
}

/**
 * Returns an ISO date string (with no time information) for sending to the BE
 * for all day events. If no end date is provided, the function assumes a single
 * day event.
 */
export function getAllDayEventISODates(
  start: DateLike,
  end?: DateLike
): { start: string; end: string } {
  const startDate = parseDate(start)

  if (!end) {
    return {
      start: startDate.toISODate(),
      end: startDate.plus({ days: 1 }).toISODate(),
    }
  }

  const endDate = parseDate(end).plus({ days: 1 })

  return {
    start: startDate.toISODate(),
    end: endDate.toISODate(),
  }
}

export function createOrganizingAttendee(
  email: string,
  displayName: string | null
) {
  return {
    email,
    displayName: displayName ?? email,
    isOptional: false,
    isOrganizer: true,
    status: 'accepted' as const,
  }
}
