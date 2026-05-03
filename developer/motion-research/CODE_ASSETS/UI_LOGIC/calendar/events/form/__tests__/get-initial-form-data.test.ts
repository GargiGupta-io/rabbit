import { type EmailAccount } from '@motion/rpc-types/legacy'
import {
  type CalendarEventAttendeeSchemaV2,
  type CalendarEventSchemaV2,
} from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { getInitialEventFormData } from '../get-initial-form-data'

describe('getInitialEventFormData', () => {
  afterEach(() => {
    tk.reset()
  })

  const mainCalendarId = 'main-calendar-id'
  const mainEmailAccount = {
    email: 'test@example.com',
    providerType: 'GOOGLE',
  } as EmailAccount

  describe('when no event is provided', () => {
    it('should return default values when no event is provided', () => {
      const defaultValues = {
        id: 'event-id',
        start: DateTime.now().toISO(),
        end: DateTime.now().plus({ minutes: 30 }).toISO(),
      }

      const result = getInitialEventFormData({
        mainCalendarId,
        mainEmailAccount,
        settingConferenceType: 'meet',
        defaultValues,
        workspaceCustomFields: [],
        options: {},
      })

      expect(result).toEqual({
        id: 'event-id',
        calendarId: mainCalendarId,
        colorId: null,
        email: mainEmailAccount.email,
        isAllDay: false,
        start: expect.any(String), // Assuming the start will be in ISO string format
        end: expect.any(String), // Assuming the end will be in ISO string format
        recurrence: null,
        status: 'BUSY',
        title: '',
        description: '',
        conferenceLink: null,
        conferenceType: 'none', // No guests, so conference type should be 'none'
        location: null,
        travelTimeAfter: null,
        travelTimeBefore: null,
        visibility: 'DEFAULT',
        attendees: [],
        customFieldValuesFieldArray: [],
        isLoading: false,
        labelIds: [],
        projectId: null,
        stageDefinitionId: null,
        workspaceId: null,
        botEnabled: false,
        sendRecapToAllAttendees: false,
      })
    })

    it('returns default values for all day event', () => {
      const defaultValues = {
        id: 'event-id',
        start: DateTime.now().toISO(),
        end: DateTime.now().plus({ day: 1 }).toISO(),
        isAllDay: true,
      }

      const result = getInitialEventFormData({
        mainCalendarId,
        mainEmailAccount,
        settingConferenceType: 'meet',
        defaultValues,
        workspaceCustomFields: [],
        options: {},
      })

      expect(result).toEqual({
        id: 'event-id',
        calendarId: mainCalendarId,
        colorId: null,
        email: mainEmailAccount.email,
        isAllDay: true,
        start: expect.any(String), // Assuming the start will be in ISO string format
        end: expect.any(String), // Assuming the end will be in ISO string format
        recurrence: null,
        status: 'FREE',
        title: '',
        description: '',
        conferenceLink: null,
        conferenceType: 'none',
        location: null,
        travelTimeAfter: null,
        travelTimeBefore: null,
        visibility: 'DEFAULT',
        attendees: [],
        customFieldValuesFieldArray: [],
        isLoading: false,
        labelIds: [],
        projectId: null,
        stageDefinitionId: null,
        workspaceId: null,
        botEnabled: false,
        sendRecapToAllAttendees: false,
      })
    })
  })

  it('should handle an all-day event correctly', () => {
    const event = {
      id: '1',
      isAllDay: true,
      start: DateTime.now().toISO(),
      end: DateTime.now().plus({ days: 1 }).toISO(),
      calendarId: 'event-calendar-id',
      colorId: 'color-id',
      email: 'event@example.com',
      title: 'Event Title',
      description: 'Event Description',
      conferenceLink: 'http://example.com',
      conferenceType: 'video',
      location: 'Event Location',
      status: 'CONFIRMED',
      recurrence: null,
      attendees: [],
    } as unknown as CalendarEventSchemaV2

    const result = getInitialEventFormData({
      mainCalendarId,
      mainEmailAccount,
      settingConferenceType: 'meet',
      workspaceCustomFields: [],
      options: {
        event,
      },
    })

    expect(result).toEqual({
      id: undefined,
      calendarId: event.calendarId,
      colorId: event.colorId,
      email: event.email,
      isAllDay: event.isAllDay,

      start: expect.any(String), // The start should be a date in ISO format
      end: expect.any(String), // The end should be a date in ISO format
      recurrence: event.recurrence,
      status: event.status,
      title: event.title,
      description: event.description,
      conferenceLink: event.conferenceLink,
      conferenceType: event.conferenceType,
      location: event.location,
      travelTimeAfter: null,
      travelTimeBefore: null,
      visibility: 'DEFAULT',
      attendees: event.attendees,
      customFieldValuesFieldArray: [],
      isLoading: false,
      labelIds: [],
      projectId: null,
      stageDefinitionId: null,
      workspaceId: null,
      botEnabled: false,
      sendRecapToAllAttendees: false,
    })
  })

  it('should use default start and end if no event and no default values are provided', () => {
    const defaultValues = {}

    const result = getInitialEventFormData({
      mainCalendarId,
      mainEmailAccount,
      settingConferenceType: 'meet',
      defaultValues,
      workspaceCustomFields: [],
      options: {},
    })

    expect(result.start).toBeDefined()
    expect(result.end).toBeDefined()
  })

  it('should use event data if available', () => {
    const event = {
      calendarId: 'event-calendar-id',
      email: 'event@example.com',
      isAllDay: false,
      start: DateTime.now().toISO(),
      end: DateTime.now().plus({ hours: 1 }).toISO(),
      title: 'Event Title',
      description: 'Event Description',
      attendees: [
        { email: 'guest-1@usemotion.com' },
        { email: 'guest-2@usemotion.com' },
      ] as CalendarEventAttendeeSchemaV2[],
      conferenceType: 'zoom',
    } as CalendarEventSchemaV2

    const result = getInitialEventFormData({
      mainCalendarId,
      mainEmailAccount,
      settingConferenceType: 'meet',
      workspaceCustomFields: [],
      options: {
        event,
      },
    })

    expect(result.calendarId).toBe(event.calendarId)
    expect(result.email).toBe(event.email)
    expect(result.isAllDay).toBe(event.isAllDay)
    expect(result.start).toBe(event.start)
    expect(result.end).toBe(event.end)
    expect(result.title).toBe(event.title)
    expect(result.description).toBe(event.description)
    expect(result.attendees).toEqual([
      { email: 'guest-1@usemotion.com' },
      { email: 'guest-2@usemotion.com' },
    ])
    expect(result.conferenceType).toBe('zoom')
  })

  it('returns the form data with the setting conference type when there are guests (non-organizer attendees) as part of the default options', () => {
    const result = getInitialEventFormData({
      mainCalendarId,
      mainEmailAccount,
      settingConferenceType: 'meet',
      workspaceCustomFields: [],
      defaultValues: {
        attendees: [
          {
            email: 'guest-1@usemotion.com',
            isOrganizer: false,
            isOptional: false,
          },
          {
            email: 'guest-2@usemotion.com',
            isOrganizer: false,
            isOptional: false,
          },
        ] as CalendarEventAttendeeSchemaV2[],
      },
      options: {},
    })

    expect(result.conferenceType).toBe('meet')
    expect(result.attendees).toEqual([
      { email: 'guest-1@usemotion.com', isOrganizer: false, isOptional: false },
      { email: 'guest-2@usemotion.com', isOrganizer: false, isOptional: false },
    ])
  })

  it('returns conference type as none when there are only organizer attendees', () => {
    const result = getInitialEventFormData({
      mainCalendarId,
      mainEmailAccount,
      settingConferenceType: 'meet',
      workspaceCustomFields: [],
      defaultValues: {
        attendees: [
          {
            email: 'organizer@usemotion.com',
            isOrganizer: true,
            isOptional: false,
          },
        ] as CalendarEventAttendeeSchemaV2[],
      },
      options: {},
    })

    expect(result.conferenceType).toBe('none')
    expect(result.attendees).toEqual([
      {
        email: 'organizer@usemotion.com',
        isOrganizer: true,
        isOptional: false,
      },
    ])
  })
})
