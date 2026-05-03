import { type Calendar, CalendarAccessRole } from '@motion/rpc-types/legacy'
import { type CalendarSchema } from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  getAccountOptions,
  getEndDateTime,
  handleEndDateChange,
  handleEndTimeChange,
  handleIsAllDayChange,
  handleStartDateChange,
  handleStartTimeChange,
  type SharedEventFormFields,
} from '../event-form'

describe('handleIsAllDayChange', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should handle isAllDay change to true', () => {
    const start = DateTime.fromISO('2023-11-22T07:48:00')
    const end = DateTime.fromISO('2023-11-22T12:00:00')

    tk.freeze(start.toJSDate())
    const result = handleIsAllDayChange(true, {
      start: start.toISO(),
      end: end.toISO(),
    })

    const expectedStart = start.startOf('day')
    const expectedEnd = start.plus({ days: 1 }).startOf('day')

    expect(result).toEqual({
      start: expectedStart.toISODate(),
      end: expectedEnd.toISODate(),
      status: 'FREE',
      isAllDay: true,
    } satisfies SharedEventFormFields)
  })

  it('should handle isAllDay change to false when all day dates are same day', () => {
    const now = DateTime.fromISO('2023-11-22T07:48:00')

    tk.freeze(now.toJSDate())
    const result = handleIsAllDayChange(false, {
      start: now.toISODate(),
      end: now.plus({ day: 1 }).toISODate(),
    })

    expect(result).toEqual({
      start: '2023-11-22T08:00:00.000+00:00',
      end: '2023-11-22T08:30:00.000+00:00',
      status: 'BUSY',
      isAllDay: false,
    } satisfies SharedEventFormFields)
  })

  it('should handle isAllDay change to false when all day dates are not the same day', () => {
    const now = DateTime.fromISO('2023-11-22T07:48:00')

    tk.freeze(now.toJSDate())

    const result = handleIsAllDayChange(false, {
      start: now.toISODate(),
      end: now.plus({ day: 5 }).toISODate(),
    })

    expect(result).toEqual({
      start: '2023-11-22T08:00:00.000+00:00',
      end: '2023-11-26T08:00:00.000+00:00',
      status: 'BUSY',
      isAllDay: false,
    } satisfies SharedEventFormFields)
  })
})

describe('handleStartTimeChange', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should handle startTime change', () => {
    const newStartTime = DateTime.fromISO('2023-11-22T10:00:00')
    const start = DateTime.fromISO('2023-11-22T08:00:00')
    const end = DateTime.fromISO('2023-11-22T12:00:00')
    tk.freeze(start.toJSDate())

    const result = handleStartTimeChange(newStartTime, {
      start: start.toISO(),
      end: end.toISO(),
    })

    const duration = start.until(end).toDuration()
    const expectedEnd = newStartTime.plus(duration)

    expect(result).toEqual({
      start: newStartTime.toISO(),
      end: expectedEnd.toUTC().toISO(),
    } satisfies Partial<SharedEventFormFields>)
  })
})

describe('handleStartDateChange', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should handle startDate change with isAllDay true', () => {
    const newStart = DateTime.fromISO('2023-11-23T08:00:00')
    const start = DateTime.fromISO('2023-11-22T08:00:00')
    const end = DateTime.fromISO('2023-11-22T12:00:00')
    tk.freeze(start.toJSDate())

    const result = handleStartDateChange(newStart, {
      start: start.toISO(),
      end: end.toISO(),
      isAllDay: true,
    })

    const duration = start.until(end).toDuration()
    const expectedEnd = newStart.plus(duration)

    expect(result).toEqual({
      start: newStart.toISODate(),
      end: expectedEnd.toISODate(),
    })
  })

  it('should handle startDate change with isAllDay false', () => {
    const newStart = DateTime.fromISO('2023-11-22T00:00:00')
    const start = DateTime.fromISO('2023-11-21T00:00:00')
    const end = DateTime.fromISO('2023-11-22T00:00:00')
    tk.freeze(start.toJSDate())

    const result = handleStartDateChange(newStart, {
      start: start.toISO(),
      end: end.toISO(),
      isAllDay: false,
    })

    const expectedEnd = newStart.plus({ days: 1 })

    expect(result).toEqual({
      start: newStart.toUTC().toISO(),
      end: expectedEnd.toUTC().toISO(),
    })
  })
})

describe('handleEndDateChange', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should handle endDate change with isAllDay true', () => {
    const start = DateTime.fromISO('2023-11-22T08:00:00')
    const end = DateTime.fromISO('2023-11-22T12:00:00')
    const newEnd = DateTime.fromISO('2023-11-25T12:00:00')
    tk.freeze(start.toJSDate())

    const result = handleEndDateChange(newEnd, {
      start: start.toISO(),
      end: end.toISO(),
      isAllDay: true,
    })

    expect(result).toEqual({
      start: '2023-11-22',
      end: '2023-11-26',
    })
  })

  it('should handle endDate change with isAllDay false', () => {
    const start = DateTime.fromISO('2023-11-21T00:00:00')
    const end = DateTime.fromISO('2023-11-22T00:00:00')
    const newEnd = DateTime.fromISO('2023-11-25T00:00:00')
    tk.freeze(start.toJSDate())

    const result = handleEndDateChange(newEnd, {
      start: start.toISO(),
      end: end.toISO(),
      isAllDay: false,
    })

    expect(result).toEqual({
      start: '2023-11-21T00:00:00.000Z',
      end: '2023-11-25T00:00:00.000Z',
    })
  })

  it('should handle endDate change prior to startDate with isAllDay false', () => {
    const start = DateTime.fromISO('2023-11-21T00:00:00')
    const end = DateTime.fromISO('2023-11-22T00:00:00')
    const newEnd = DateTime.fromISO('2023-11-15T00:00:00')
    tk.freeze(start.toJSDate())

    const result = handleEndDateChange(newEnd, {
      start: start.toISO(),
      end: end.toISO(),
      isAllDay: false,
    })

    expect(result).toEqual({
      start: '2023-11-14T00:00:00.000Z',
      end: '2023-11-15T00:00:00.000Z',
    })
  })
})

describe('handleEndTimeChange', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should handle endTime change when new end is after start', () => {
    const newEndTime = DateTime.fromISO('2023-11-22T14:00:00')
    const start = DateTime.fromISO('2023-11-22T08:00:00')
    const end = DateTime.fromISO('2023-11-22T12:00:00')
    tk.freeze(start.toJSDate())

    const result = handleEndTimeChange(newEndTime, {
      start: start.toISO(),
      end: end.toISO(),
    })

    expect(result).toEqual({
      start: start.toISO(),
      end: newEndTime.toISO(),
    } satisfies Partial<SharedEventFormFields>)
  })

  it('should adjust start time when new end time is before start time', () => {
    const newEndTime = DateTime.fromISO('2023-11-22T06:00:00')
    const start = DateTime.fromISO('2023-11-22T08:00:00')
    const end = DateTime.fromISO('2023-11-22T12:00:00')
    tk.freeze(start.toJSDate())

    const result = handleEndTimeChange(newEndTime, {
      start: start.toISO(),
      end: end.toISO(),
    })

    const duration = start.until(end).toDuration()
    const expectedStart = newEndTime.minus(duration)

    expect(result).toEqual({
      start: expectedStart.toUTC().toISO(),
      end: newEndTime.toISO(),
    } satisfies Partial<SharedEventFormFields>)
  })
})

describe('getAccountOptions', () => {
  const resolveCalendarId = (calendar: Pick<Calendar, 'id'>) => `${calendar.id}`

  it('should return options with email and resolved calendarId', () => {
    const editableCalendars = [
      {
        id: '1',
        providerId: '1',
        emailAccountId: 'acc1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
      },
      {
        id: '2',
        providerId: '1',
        emailAccountId: 'acc2',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
    ] as CalendarSchema[]
    const emailAccountsMap = new Map([
      ['acc1', { email: 'user1@example.com' }],
      ['acc2', { email: 'user2@example.com' }],
    ])

    const result = getAccountOptions(
      editableCalendars,
      emailAccountsMap,
      resolveCalendarId
    )

    expect(result).toEqual([
      {
        id: '1',
        providerId: '1',
        emailAccountId: 'acc1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
        email: 'user1@example.com',
        calendarId: '1',
      },
      {
        id: '2',
        providerId: '1',
        emailAccountId: 'acc2',

        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
        email: 'user2@example.com',
        calendarId: '2',
      },
    ])
  })

  it('should filter out calendars with missing email account', () => {
    const editableCalendars = [
      {
        id: '1',
        providerId: '1',
        emailAccountId: 'acc1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
      },
      {
        id: '2',
        providerId: '1',
        emailAccountId: 'acc2',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
      {
        id: '3',
        providerId: '1',
        emailAccountId: 'acc3',
        isPrimary: false,
        accessRole: CalendarAccessRole.OWNER,
      },
    ] as CalendarSchema[]
    const emailAccountsMap = new Map([
      ['acc1', { email: 'user1@example.com' }],
      ['acc2', { email: 'user2@example.com' }],
    ])

    const result = getAccountOptions(
      editableCalendars,
      emailAccountsMap,
      resolveCalendarId
    )

    expect(result).toEqual([
      {
        id: '1',
        providerId: '1',
        emailAccountId: 'acc1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
        email: 'user1@example.com',
        calendarId: '1',
      },
      {
        id: '2',
        providerId: '1',
        emailAccountId: 'acc2',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
        email: 'user2@example.com',
        calendarId: '2',
      },
    ])
  })

  it('should handle an empty input array', () => {
    const editableCalendars: CalendarSchema[] = []
    const emailAccountsMap = new Map()

    const result = getAccountOptions(
      editableCalendars,
      emailAccountsMap,
      resolveCalendarId
    )

    expect(result).toEqual([])
  })

  it('should handle an empty email accounts map', () => {
    const editableCalendars = [
      {
        id: '1',
        providerId: '1',
        emailAccountId: 'acc1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
      },
      {
        id: '2',
        providerId: '2',
        emailAccountId: 'acc2',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
    ] as CalendarSchema[]
    const emailAccountsMap = new Map()

    const result = getAccountOptions(
      editableCalendars,
      emailAccountsMap,
      resolveCalendarId
    )

    expect(result).toEqual([])
  })
})

describe('getEndDateTime', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should return the parsed end date unchanged when isAllDay is false', () => {
    const end = DateTime.fromISO('2023-11-25T15:30:00')
    // freeze at the same instant so parseDate(now) is deterministic
    tk.freeze(end.toJSDate())

    const result = getEndDateTime({
      end: end.toISO(),
      isAllDay: false,
    })

    // we expect the exact same ISO string back
    expect(result.toISO()).toBe(end.toISO())
  })

  it('should subtract one day when isAllDay is true', () => {
    const end = DateTime.fromISO('2023-11-25T00:00:00')
    tk.freeze(end.toJSDate())

    const result = getEndDateTime({
      end: end.toISO(),
      isAllDay: true,
    })

    // subtracting one day from 2023-11-25 → 2023-11-24
    expect(result.toISODate()).toBe('2023-11-24')
  })
})
