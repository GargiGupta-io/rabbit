import { DateTime } from 'luxon'

import { getSyncRange, isEventInSyncRange } from '../notetaker'

describe('getSyncRange', () => {
  it('should return a range with start and end dates', () => {
    const now = new Date('2023-10-01T00:00:00Z')
    const range = getSyncRange(now)

    expect(range.start).toEqual(DateTime.fromISO('2023-09-30T00:00:00Z'))
    expect(range.end).toEqual(DateTime.fromISO('2023-10-11T00:00:00Z'))
  })

  it('should use current date if no date is provided', () => {
    const now = new Date('2023-10-01T00:00:00Z')
    vi.useFakeTimers().setSystemTime(now)
    const range = getSyncRange()

    expect(range.start).toEqual(DateTime.fromISO('2023-09-30T00:00:00Z'))
    expect(range.end).toEqual(DateTime.fromISO('2023-10-11T00:00:00Z'))
  })
})

describe('isEventInSyncRange', () => {
  it('should return true if event starts and ends within sync range', () => {
    const event = {
      start: new Date('2023-10-05T00:00:00Z'),
      end: new Date('2023-10-05T01:00:00Z'),
    }
    const range = getSyncRange(new Date('2023-10-01T00:00:00Z'))

    expect(isEventInSyncRange(event, range)).toBe(true)
  })

  it('should return true if the event starts within the sync range but ends after the sync range', () => {
    const event = {
      start: new Date('2023-10-09T00:00:00Z'),
      end: new Date('2023-10-15T01:00:00Z'),
    }
    const range = getSyncRange(new Date('2023-10-01T00:00:00Z'))

    expect(isEventInSyncRange(event, range)).toBe(true)
  })

  it('should return false if event starts outside sync range', () => {
    const event = {
      start: new Date('2023-10-15T00:00:00Z'),
      end: new Date('2023-10-15T01:00:00Z'),
    }
    const range = getSyncRange(new Date('2023-10-01T00:00:00Z'))

    expect(isEventInSyncRange(event, range)).toBe(false)
  })

  it('should return false if the event starts before the sync range but ends within the sync range', () => {
    const event = {
      start: new Date('2023-09-29T00:00:00Z'),
      end: new Date('2023-10-05T01:00:00Z'),
    }
    const range = getSyncRange(new Date('2023-10-01T00:00:00Z'))

    expect(isEventInSyncRange(event, range)).toBe(false)
  })
})
