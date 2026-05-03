import { byValue, Compare } from '@motion/utils/array'

import { DateTime } from 'luxon'

import { type ExtendedScheduledEntity } from './types'

/*
 * Given the list of upcoming scheduled entities, this function will return the ongoing and upcoming events.
 * @param scheduledEntities - The list of scheduled entities to filter.
 * @returns An object containing the ongoing and upcoming events.
 */
export function getOngoingAndUpcomingEvents<T extends ExtendedScheduledEntity>(
  scheduledEntities: T[]
): {
  ongoingEvents: T[]
  upcomingEvents: T[]
  timelessEvents: T[]
} {
  const now = DateTime.now()
  const ongoingEvents: T[] = []
  const upcomingEvents: T[] = []
  const timelessEvents: T[] = []

  for (const entity of scheduledEntities) {
    // Handle timeless events first
    if (entity.schedule.timeless) {
      timelessEvents.push(entity)
      continue
    }

    // Skip events that the current user has declined
    if (entity.type === 'EVENT') {
      const event = entity.event
      if (event) {
        const curUserAttendee = event.attendees?.find(
          (a) => a.email === event.email
        )
        if (curUserAttendee?.status === 'declined') {
          continue
        }
      }
    }

    const start = DateTime.fromISO(entity.schedule.start)
    const end = DateTime.fromISO(entity.schedule.end)

    if (start <= now && end >= now) {
      ongoingEvents.push(entity)
    } else if (start > now) {
      upcomingEvents.push(entity)
    }
  }

  // Sort the events after categorization
  const sortByStartTime = byValue(
    (item: T) => DateTime.fromISO(item.schedule.start).toUTC().toISO(),
    Compare.string
  )

  return {
    ongoingEvents: ongoingEvents.sort(sortByStartTime),
    upcomingEvents: upcomingEvents.sort(sortByStartTime),
    timelessEvents,
  }
}
