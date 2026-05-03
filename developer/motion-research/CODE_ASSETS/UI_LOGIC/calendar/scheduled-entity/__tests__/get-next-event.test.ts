import { uniqueId } from '@motion/utils/core'
import { type ScheduledEntitySchema } from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { getNextEvent } from '../get-next-event'
import { type ExtendedScheduledEntity } from '../types'

const generateScheduledEntity = ({
  start,
  end,
  timeless = false,
  type = 'EVENT',
}: {
  start?: string
  end?: string
  timeless?: boolean
  type?: ScheduledEntitySchema['type']
}): ExtendedScheduledEntity => {
  return {
    type,
    id: uniqueId(),
    schedule: {
      start,
      end,
      timeless,
    },
  } as ExtendedScheduledEntity
}

const DEFAULT_TIME = '2024-01-01T00:00:00.000Z'

describe('get-next-event', () => {
  beforeEach(() => {
    const frozenTime = DateTime.fromISO(DEFAULT_TIME)
    tk.freeze(frozenTime.toJSDate())
  })

  afterEach(() => {
    tk.reset()
  })

  it('returns null when there are no scheduled entities', () => {
    const scheduledEntities: ExtendedScheduledEntity[] = []
    const nextEvent = getNextEvent(scheduledEntities)

    expect(nextEvent).toBeNull()
  })

  it('returns the next event when there are ongoing events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
    ]
    const nextEvent = getNextEvent(scheduledEntities)

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('returns the next event when there are upcoming events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-01T23:59:59.999Z',
      }),
    ]
    const nextEvent = getNextEvent(scheduledEntities)

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('returns the ongoing event when there are both ongoing and upcoming events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2024-01-01T00:00:00.000Z',
      }),
      generateScheduledEntity({
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-01T23:59:59.999Z',
      }),
    ]
    const nextEvent = getNextEvent(scheduledEntities)

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('returns null when there are no ongoing or upcoming events', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2023-12-31T23:59:59.999Z',
        end: '2023-12-31T23:59:59.999Z',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities)

    expect(nextEvent).toBeNull()
  })

  it('filters out events past the end of the day when onlyToday is true', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2024-01-02T00:00:00.000Z',
        end: '2024-01-02T23:59:59.999Z',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, { onlyToday: true })

    expect(nextEvent).toBeNull()
  })

  it('does not filter out events past the end of the day when onlyToday is false', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: '2024-01-02T00:00:00.000Z',
        end: '2024-01-02T23:59:59.999Z',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, { onlyToday: false })

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('moves an ongoing event in some warning time to the ongoing events list', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ second: 5 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, { warningInSeconds: 5 })

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('moves an upcoming event in some warning time to the front of the ongoing events list', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ second: 15 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 30 }).toISO(),
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ hour: 1 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 31 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ hours: 1 }).toISO(),
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, { warningInSeconds: 15 })

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('removes an ongoing event that has been in progress past the durationInSeconds provided', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ seconds: 600 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ seconds: 600 }).toISO(),
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      durationInSeconds: 500,
    })

    expect(nextEvent).toBeNull()
  })

  it('does not remove an ongoing event that has been in progress for less than the durationInSeconds provided', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      durationInSeconds: 700,
    })

    expect(nextEvent).toEqual(scheduledEntities[0])
  })

  it('ignores upcoming events when the ignoreUpcomingEvents option is true', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 40 }).toISO(),
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      durationInSeconds: 700,
      ignoreUpcomingEvents: true,
    })

    expect(nextEvent).toBeNull()
  })

  it('ignores EVENT type events when the ignoreCalendarEvents option is true', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        type: 'EVENT',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      ignoreCalendarEvents: true,
    })

    expect(nextEvent).toBeNull()
  })

  it('ignores TASK and CHUNK type events when the ignoreTasksAndChunks option is true', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        type: 'TASK',
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        type: 'CHUNK',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      ignoreTasksAndChunks: true,
    })

    expect(nextEvent).toBeNull()
  })

  // Handle combinations
  it('ignores TASK and CHUNK type events when the ignoreTasksAndChunks option is true AND ignoreUpcomingEvents is true', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 40 }).toISO(),
        type: 'TASK',
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 40 }).toISO(),
        type: 'CHUNK',
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 40 }).toISO(),
        type: 'EVENT',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      ignoreUpcomingEvents: true,
      ignoreTasksAndChunks: true,
    })

    expect(nextEvent).toBeNull()
  })

  it('ignores EVENT type events when the ignoreCalendarEvents option is true AND ignoreUpcomingEvents is true', () => {
    const scheduledEntities = [
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).minus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        type: 'EVENT',
      }),
      generateScheduledEntity({
        start: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 10 }).toISO(),
        end: DateTime.fromISO(DEFAULT_TIME).plus({ minutes: 40 }).toISO(),
        type: 'TASK',
      }),
    ]

    const nextEvent = getNextEvent(scheduledEntities, {
      ignoreUpcomingEvents: true,
      ignoreCalendarEvents: true,
    })

    expect(nextEvent).toBeNull()
  })
})
