import { type CalendarSchema } from '@motion/rpc-types'
import {
  type CalendarEventAttendeeSchemaV2,
  type CalendarEventSchemaV2,
} from '@motion/zod/client'

import {
  canAddToProject,
  canRemoveFromProject,
  createOrganizingAttendee,
  isAllDayBlockingEvent,
} from '../helpers'

describe('canAddToProject()', () => {
  const defaultEvent = {
    id: 'event-id',
    meetingTaskId: undefined,
    recurringEventId: null,
  } as CalendarEventSchemaV2

  it('returns false for null/undefined event', () => {
    expect(canAddToProject(null)).toBe(false)
    expect(canAddToProject(undefined)).toBe(false)
  })

  it('returns false when it has a meeting task id', () => {
    expect(
      canAddToProject({ ...defaultEvent, meetingTaskId: 'meeting-1' })
    ).toBe(false)
  })

  it('returns false when it is a recurring event', () => {
    expect(
      canAddToProject({ ...defaultEvent, recurringEventId: 'recurring-1' })
    ).toBe(false)
  })

  it('returns false for all day events', () => {
    expect(canAddToProject({ ...defaultEvent, isAllDay: true })).toBe(false)
  })

  it('returns true when not recurring and not having a meeting task id yet', () => {
    expect(
      canAddToProject({
        ...defaultEvent,
        recurringEventId: null,
        meetingTaskId: undefined,
      })
    ).toBe(true)
  })
})

describe('canRemoveFromProject()', () => {
  const defaultEvent = {
    id: 'event-id',
    meetingTaskId: undefined,
    recurringEventId: null,
  } as CalendarEventSchemaV2

  it('returns false for null/undefined event', () => {
    expect(canRemoveFromProject(null)).toBe(false)
    expect(canRemoveFromProject(undefined)).toBe(false)
  })

  it('returns false when it does not have a meeting task id', () => {
    expect(
      canRemoveFromProject({ ...defaultEvent, meetingTaskId: undefined })
    ).toBe(false)
  })

  it('returns true when it has a meeting task', () => {
    expect(
      canRemoveFromProject({ ...defaultEvent, meetingTaskId: 'task-1' })
    ).toBe(true)
  })
})

describe('isAllDayBlockingEvent', () => {
  const mockCalendar = {
    id: 'calendar-1',
    providerId: 'user@example.com',
    // ... other required calendar fields
  } as CalendarSchema

  const baseEvent = {
    id: 'event-1',
    calendarUniqueId: 'calendar-1',
    calendarId: 'calendar-1',
    isAllDay: true,
    status: 'BUSY',
    email: 'user@example.com',
    attendees: [],
    // ... other required event fields
  } as unknown as CalendarEventSchemaV2

  const userCalendars = [mockCalendar]

  it('should return true for all-day busy event when user is the organizer with no attendees', () => {
    const result = isAllDayBlockingEvent(baseEvent, userCalendars)

    expect(result).toBe(true)
  })

  it('should return true for all-day busy event when user is an accepted attendee', () => {
    const event = {
      ...baseEvent,
      attendees: [
        {
          email: 'user@example.com',
          status: 'accepted',
        },
      ] as CalendarEventAttendeeSchemaV2[],
    }
    const result = isAllDayBlockingEvent(event, userCalendars)

    expect(result).toBe(true)
  })

  it('should return false for all-day busy event when user has declined', () => {
    const event = {
      ...baseEvent,
      attendees: [
        {
          email: 'user@example.com',
          status: 'declined',
        },
      ] as CalendarEventAttendeeSchemaV2[],
    }
    const result = isAllDayBlockingEvent(event, userCalendars)

    expect(result).toBe(false)
  })

  it('should return false when event is not all-day', () => {
    const event = {
      ...baseEvent,
      isAllDay: false,
    }
    const result = isAllDayBlockingEvent(event, userCalendars)

    expect(result).toBe(false)
  })

  it('should return false when event status is not BUSY', () => {
    const event = {
      ...baseEvent,
      status: 'FREE',
    } as unknown as CalendarEventSchemaV2
    const result = isAllDayBlockingEvent(event, userCalendars)

    expect(result).toBe(false)
  })

  it('should return false when calendar does not match', () => {
    const event = {
      ...baseEvent,
      calendarUniqueId: 'different-calendar',
    }
    const result = isAllDayBlockingEvent(event, userCalendars)

    expect(result).toBe(false)
  })

  it('should return true when user is organizer via organizer field', () => {
    const event = {
      ...baseEvent,
      organizer: {
        email: 'user@example.com',
      },
    }
    const result = isAllDayBlockingEvent(event, userCalendars)

    expect(result).toBe(true)
  })
})

describe('createOrganizingAttendee', () => {
  it('should create an organizing attendee with a displayName', () => {
    const attendee = createOrganizingAttendee('test@example.com', 'Test User')

    expect(attendee).toEqual({
      email: 'test@example.com',
      displayName: 'Test User',
      isOptional: false,
      isOrganizer: true,
      status: 'accepted',
    })
  })

  it('should create an organizing attendee without a displayName', () => {
    const attendee = createOrganizingAttendee('test@example.com', null)

    expect(attendee).toEqual({
      email: 'test@example.com',
      displayName: 'test@example.com',
      isOptional: false,
      isOrganizer: true,
      status: 'accepted',
    })
  })
})
