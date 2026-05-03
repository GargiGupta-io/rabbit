import {
  type CalendarEvent,
  type ContactRecord,
} from '@motion/rpc-types/legacy'
/**
 * Given a list of calendar events, extract all the attendees and count the number of occurrences of each attendee.
 * @param calendarEvents
 * @returns
 */
export const parseAndCountCalendarEventAttendees = (
  calendarEvents: Pick<CalendarEvent, 'attendees' | 'email'>[]
) => {
  return calendarEvents
    .flatMap(
      (event) =>
        event.attendees?.map((attendee) => ({
          ...attendee,
          account: event.email,
        })) ?? []
    )
    .reduce<ContactRecord>((counts, guest) => {
      if (guest.email) {
        counts[guest.email] = {
          email: guest.email,
          displayName: guest.displayName || guest.email,
          rank: (counts[guest.email]?.rank ?? 0) + 1,
          teamDomain: true,
          account: guest.account,
          profilePic: undefined,
        }
      }
      return counts
    }, {})
}

export const mergeContactsWithEventGuests = (
  contacts: ContactRecord,
  eventGuests: ContactRecord
) => {
  const result: ContactRecord = {}

  // Add all contacts to the result
  for (const email of Object.keys(contacts)) {
    result[email] = {
      ...contacts[email],
    }
  }

  // Add all contacts parsed from calendar event attendees to the results
  for (const email of Object.keys(eventGuests)) {
    // If contact already exists in search results use the event contact rank if any
    if (result[email]) {
      result[email].rank = eventGuests[email]?.rank ?? result[email]?.rank ?? 0
      continue
    }

    result[email] = {
      ...eventGuests[email],
      displayName: eventGuests[email]?.displayName ?? eventGuests[email]?.email,
    }
  }

  return result
}
