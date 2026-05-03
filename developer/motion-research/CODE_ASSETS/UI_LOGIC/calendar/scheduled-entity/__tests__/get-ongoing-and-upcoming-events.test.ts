import { uniqueId } from '@motion/utils/core'
import { type CalendarEventSchemaV2 } from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { getOngoingAndUpcomingEvents } from '../get-ongoing-and-upcoming-events'
import { type ExtendedScheduledEntity } from '../types'

const generateScheduledEntity = ({
  start,
  end,
  timeless = false,
  event,
}: {
  start?: string
  end?: string
  timeless?: boolean
  event?: Partial<CalendarEventSchemaV2>
}): ExtendedScheduledEntity => {
  return {
    type: 'EVENT',
    id: uniqueId(),
    schedule: {
      start,
      end,
      timeless,
    },
    event,
  } as ExtendedScheduledEntity
}

const DEFAULT_TIME = '2024-01-01T00:00:00.000Z'
const TEST_EMAIL = 'test@usemotion.com'

describe('getOngoingAndUpcomingEvents', () => {
  beforeEach(() => {
    const frozenTime = DateTime.fromISO(DEFAULT_TIME)
    tk.freeze(frozenTime.toJSDate())
  })

  afterEach(() => {
    tk.reset()
  })

  it('returns an empty object when there are no scheduled entities', () => {
    const scheduledEntities: ExtendedScheduledEntity[] = []
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual([])
  })

  it('places the event in ongoing when its start is before now and end is after now', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual(scheduledEntities)
    expect(upcomingEvents).toEqual([])
  })

  it('places the event in upcoming when its start is after now', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.001Z',
        end: '2024-01-01T00:00:00.002Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual(scheduledEntities)
  })

  it('ignores timeless events in upcoming events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: undefined,
        end: undefined,
        timeless: true,
      }),
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.001Z',
        end: '2024-01-01T00:00:00.002Z',
      }),
    ]

    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual([scheduledEntities[1]])
  })

  it('ignores timeless events in ongoing events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: undefined,
        end: undefined,
        timeless: true,
      }),
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
    ]

    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([scheduledEntities[1]])
    expect(upcomingEvents).toEqual([])
  })

  it('sorts the ongoing events by start date', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.002Z',
      }),
      generateScheduledEntity({
        start: '2023-12-31T23:59:58.999Z',
        end: '2024-01-01T00:00:00.002Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual(scheduledEntities.reverse())
    expect(upcomingEvents).toEqual([])
  })

  it('sorts the upcoming events by start date', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.001Z',
        end: '2024-01-01T00:00:00.002Z',
      }),
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.003Z',
        end: '2024-01-01T00:00:00.004Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual(scheduledEntities)
  })

  it('handles past events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-30T23:59:59.999Z',
        end: '2023-12-31T00:00:00.000Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual([])
  })

  it('handles multiple ongoing events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual(scheduledEntities)
    expect(upcomingEvents).toEqual([])
  })

  it('handles multiple ongoing and upcoming events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.001Z',
        end: '2024-01-01T00:00:00.002Z',
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual(scheduledEntities.slice(0, 1))
    expect(upcomingEvents).toEqual(scheduledEntities.slice(1))
  })

  it('handles a mix of past, ongoing, and upcoming events', () => {
    const scheduledEntities = [
      // Past event
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ days: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).minus({ days: 5 }).toISO(),
      }),
      // Timeless event
      generateScheduledEntity({
        timeless: true,
      }),
      // Currently ongoing event
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ hours: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
      }),
      // Past event
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ days: 5 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).minus({ days: 4 }).toISO(),
      }),
      // Upcoming events
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ days: 3 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ days: 5 }).toISO(),
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 2 }).toISO(),
      }),
    ]
    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual(scheduledEntities.slice(2, 3))
    expect(upcomingEvents).toEqual(scheduledEntities.slice(4).reverse())
  })

  it('filters out events from current events that the user has declined', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ hours: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
        event: {
          email: TEST_EMAIL,
          attendees: [
            {
              email: TEST_EMAIL,
              status: 'declined',
              isOptional: false,
              isOrganizer: false,
            },
          ],
        },
      }),
    ]

    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual([])
  })

  it('filters out events from upcoming events that the user has declined', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 2 }).toISO(),
        event: {
          email: TEST_EMAIL,
          attendees: [
            {
              email: TEST_EMAIL,
              status: 'declined',
              isOptional: false,
              isOrganizer: false,
            },
          ],
        },
      }),
    ]

    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual([])
  })

  it('does NOT filter out when an event is not included in the entity', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 2 }).toISO(),
      }),
    ]

    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual(scheduledEntities)
  })

  it('does NOT filter out when the event is not declined', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 2 }).toISO(),
        event: {
          email: TEST_EMAIL,
          attendees: [
            {
              email: TEST_EMAIL,
              status: 'accepted',
              isOptional: false,
              isOrganizer: false,
            },
          ],
        },
      }),
    ]

    const { ongoingEvents, upcomingEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual(scheduledEntities)
  })

  it('returns timeless events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        timeless: true,
      }),
    ]

    const { ongoingEvents, upcomingEvents, timelessEvents } =
      getOngoingAndUpcomingEvents(scheduledEntities)

    expect(ongoingEvents).toEqual([])
    expect(upcomingEvents).toEqual([])
    expect(timelessEvents).toEqual(scheduledEntities)
  })
})
