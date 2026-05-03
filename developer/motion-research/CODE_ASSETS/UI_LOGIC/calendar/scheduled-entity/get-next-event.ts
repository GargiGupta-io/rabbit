import { DateTime } from 'luxon'

import { getOngoingAndUpcomingEvents } from './get-ongoing-and-upcoming-events'
import { type ExtendedScheduledEntity } from './types'

export type GetNextEventOptions = {
  onlyToday?: boolean
  /**
   * The number of seconds before an event such that it gets moved into the ongoing events list
   */
  warningInSeconds?: number
  /**
   * The number of seconds an event should stay in the ongoing events list before it gets moved to the upcoming events list
   */
  durationInSeconds?: number
  /**
   * If true, upcoming events will be ignored and only ongoing events will be considered
   */
  ignoreUpcomingEvents?: boolean
  /**
   * If true, ignore EVENT entities
   */
  ignoreCalendarEvents?: boolean
  /**
   * If true, ignore TASK and CHUNK entities
   */
  ignoreTasksAndChunks?: boolean
}

/*
 * Given a list of upcoming scheduled entities, this function will return the next event
 * @param scheduledEntities - The list of scheduled entities to filter.
 * @returns The next scheduled entity event
 */
export function getNextEvent<T extends ExtendedScheduledEntity>(
  scheduledEntities: T[],
  options: GetNextEventOptions = {
    onlyToday: false,
    warningInSeconds: 0,
    durationInSeconds: 0,
    ignoreUpcomingEvents: false,
  }
): T | null {
  if (!scheduledEntities || scheduledEntities.length === 0) {
    return null
  }

  let { upcomingEvents, ongoingEvents } =
    getOngoingAndUpcomingEvents(scheduledEntities)

  if (options.onlyToday) {
    // Filter out events that are not today
    const endOfDay = DateTime.now().endOf('day')

    // Filter out events that are not today
    ongoingEvents = ongoingEvents.filter(
      (event) => DateTime.fromISO(event.schedule.start) < endOfDay
    )

    upcomingEvents = upcomingEvents.filter(
      (event) => DateTime.fromISO(event.schedule.start) < endOfDay
    )
  }

  if (options.durationInSeconds) {
    // Remove any events that have been ongoing for longer than the duration
    const now = DateTime.now()
    const durationTime = now.minus({ seconds: options.durationInSeconds })

    ongoingEvents = ongoingEvents.filter((event) => {
      if (DateTime.fromISO(event.schedule.start) < durationTime) {
        return false
      }
      return true
    })
  }

  if (options.warningInSeconds) {
    // Cut out any events that are within the warning time and put them at the front of the ongoing events list
    const now = DateTime.now()
    const warningTime = now.plus({ seconds: options.warningInSeconds })

    const upcomingEventsCopy = upcomingEvents.slice()
    upcomingEvents = upcomingEvents.filter((event) => {
      if (DateTime.fromISO(event.schedule.start) <= warningTime) {
        ongoingEvents.unshift(event)
        return false
      }
      return true
    })

    upcomingEvents = upcomingEventsCopy
  }

  if (options.ignoreCalendarEvents) {
    ongoingEvents = ongoingEvents.filter((event) => event.type !== 'EVENT')
    upcomingEvents = upcomingEvents.filter((event) => event.type !== 'EVENT')
  }

  if (options.ignoreTasksAndChunks) {
    ongoingEvents = ongoingEvents.filter(
      (event) => event.type !== 'TASK' && event.type !== 'CHUNK'
    )
    upcomingEvents = upcomingEvents.filter(
      (event) => event.type !== 'TASK' && event.type !== 'CHUNK'
    )
  }

  if (options.ignoreUpcomingEvents) {
    return (ongoingEvents[0] as T) ?? null
  }

  return (ongoingEvents[0] as T) ?? (upcomingEvents[0] as T) ?? null
}
