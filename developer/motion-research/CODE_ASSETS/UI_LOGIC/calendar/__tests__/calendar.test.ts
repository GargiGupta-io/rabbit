import { type Calendar } from '@motion/rpc-types/legacy'
import { type CalendarEventSchemaV2 } from '@motion/zod/client'

import { DateTime } from 'luxon'

import {
  allOtherAttendeesDeclined,
  formatTimeSlot,
  isCalendarEventEditable,
  isHostOfEvent,
} from '../calendar'

const mockAppleCalendar: Calendar = {
  id: 'apple-1',
  userId: 'tim-apple',
  emailAccountId: 't.apple@apple.com',
  type: 'DEFAULT',
  providerId: 'test-apple',
  accessRole: 'OWNER',
  allowedConferenceTypes: [],
  colorId: '0',
  isEnabled: true,
  isInFrequentlyMet: false,
  isInMyCalendars: true,
  isPrimary: false,
  providerType: 'APPLE',
  title: 'Apple Calendar',
  status: 'OK',
  isDeleted: false,
  createdTime: DateTime.now().toISO(),
  updatedTime: null,
  deletedTime: null,
}

const mockGoogleCalendar: Calendar = {
  id: 'google-1',
  userId: 'Sundar-google',
  emailAccountId: 's.google@google.com',
  type: 'DEFAULT',
  providerId: 'test-google',
  accessRole: 'OWNER',
  allowedConferenceTypes: [],
  colorId: '0',
  isEnabled: true,
  isInFrequentlyMet: false,
  isInMyCalendars: true,
  isPrimary: false,
  providerType: 'GOOGLE',
  title: 'GOOGLE Calendar',
  status: 'OK',
  isDeleted: false,
  createdTime: DateTime.now().toISO(),
  updatedTime: null,
  deletedTime: null,
}

const hostedEventOne = {
  id: '1fc98ffd-7504-4e5e-a925-d85dbf708b29',
  organizer: null,
  attendees: [
    {
      email: 'johnsonstone5813@gmail.com',
      isOptional: false,
      isOrganizer: true,
      status: 'accepted',
    },
    {
      email: 'testemail@gmail.com',
      isOptional: false,
      isOrganizer: false,
      status: 'declined',
    },
  ],
  email: 'johnsonstone5813@gmail.com',
} as CalendarEventSchemaV2

const hostedEventTwo = {
  id: '01251a91-4bfb-4156-99d5-9cc0615d29ee',
  organizer: {
    email: 'johnstone@usemotion.com',
  },
  attendees: [
    {
      email: 'johnstone@usemotion.com',
      isOptional: false,
      status: 'accepted',
    },
    {
      email: 'testemail@gmail.com',
      status: 'declined',
      isOptional: false,
    },
  ],
  email: 'johnstone@usemotion.com',
} as CalendarEventSchemaV2

describe('formatTimeSlot', () => {
  it('returns the hour without minutes', () => {
    const date = DateTime.fromISO('2023-11-08T16:00:00.000Z')

    expect(formatTimeSlot(date)).toBe('4 PM')
  })

  it('returns the hour with minutes for timezone with half minutes', () => {
    const date = DateTime.fromISO('2023-11-08T13:00:00.000Z')
    const timezone = 'America/St_Johns'

    expect(formatTimeSlot(date, timezone)).toBe('9:30 AM')
  })

  it('Should be an editable calendar event (no attendees & apple calendar)', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [],
      email: 't.apple@apple.com',
      calendarId: mockAppleCalendar.id,
      calendarUniqueId: mockAppleCalendar.id,
      type: 'NORMAL',
      organizer: null,
      canAttendeesModify: null,
    }

    expect(isCalendarEventEditable(event, mockAppleCalendar, null)).toBe(true)
  })

  it('Should be an editable calendar ', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [
        {
          email: 's.google@google.com',
          isOptional: false,
          isOrganizer: false,
          status: 'accepted',
        },
      ],
      email: 's.google@google.com',
      organizer: {
        email: 'matt@usemotion.com',
      },
      calendarId: mockGoogleCalendar.id,
      calendarUniqueId: mockGoogleCalendar.id,
      type: 'NORMAL',
      canAttendeesModify: null,
    }

    expect(
      isCalendarEventEditable(event, mockAppleCalendar, 'matt@usemotion.com')
    ).toBe(false)
  })

  it('Should be an editable calendar event (no attendees & non-apple calendar)', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [],
      email: 's.google@google.com',
      calendarId: mockGoogleCalendar.id,
      calendarUniqueId: mockGoogleCalendar.id,
      type: 'NORMAL',
      organizer: null,
      canAttendeesModify: null,
    }

    expect(isCalendarEventEditable(event, mockGoogleCalendar)).toBe(true)
  })

  it('Should be an editable calendar event non-attendee host email owns event', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [
        {
          email: 's.google@google.com',
          isOptional: false,
          isOrganizer: false,
          status: 'accepted',
        },
        {
          email: 't.apple@apple.com',
          isOptional: false,
          isOrganizer: false,
          status: 'accepted',
        },
      ],
      email: 's.google@google.com',
      organizer: {
        email: 'matt@usemotion.com',
      },
      calendarId: mockGoogleCalendar.id,
      calendarUniqueId: mockGoogleCalendar.id,
      type: 'NORMAL',
      canAttendeesModify: null,
    }

    expect(
      isCalendarEventEditable(event, mockGoogleCalendar, 'matt@usemotion.com')
    ).toBe(true)
  })

  it('Should NOT be editable calendar event due to calendar mismatch', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [],
      email: 't.apple@apple.com',
      calendarId: 'not-valid-id',
      calendarUniqueId: 'not-valid-id',
      type: 'NORMAL',
      organizer: null,
      canAttendeesModify: null,
    }

    expect(isCalendarEventEditable(event, mockAppleCalendar)).toBe(false)
  })

  it('Should NOT be editable calendar event as attendee is not organizer', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [
        {
          email: 's.google@google.com',
          isOptional: false,
          isOrganizer: false,
          status: 'accepted',
        },
        {
          email: 't.apple@apple.com',
          isOptional: false,
          isOrganizer: true,
          status: 'accepted',
        },
      ],
      email: 's.google@google.com',
      calendarId: mockGoogleCalendar.id,
      calendarUniqueId: mockGoogleCalendar.id,
      type: 'NORMAL',
      organizer: null,
      canAttendeesModify: null,
    }

    expect(isCalendarEventEditable(event, mockAppleCalendar)).toBe(false)
  })

  it('Should NOT be editable calendar event as attendee is not organizer nor the owner', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [
        {
          email: 's.google@google.com',
          isOptional: false,
          isOrganizer: false,
          status: 'accepted',
        },
      ],
      email: 's.google@google.com',
      calendarId: mockGoogleCalendar.id,
      calendarUniqueId: mockGoogleCalendar.id,
      type: 'NORMAL',
      organizer: null,
      canAttendeesModify: null,
    }

    expect(
      isCalendarEventEditable(event, mockAppleCalendar, 'other.owner@gmail.com')
    ).toBe(false)
  })

  it('Should NOT be editable calendar event due to recurring instance', () => {
    const event: Pick<
      CalendarEventSchemaV2,
      | 'id'
      | 'providerId'
      | 'attendees'
      | 'email'
      | 'calendarId'
      | 'calendarUniqueId'
      | 'type'
      | 'organizer'
      | 'canAttendeesModify'
    > = {
      id: '123',
      providerId: 'providerId',
      attendees: [],
      email: 's.google@google.com',
      calendarId: mockGoogleCalendar.id,
      calendarUniqueId: mockGoogleCalendar.id,
      type: 'RECURRING_EVENT',
      organizer: null,
      canAttendeesModify: null,
    }

    expect(isCalendarEventEditable(event, mockAppleCalendar)).toBe(false)
  })
})

describe(isHostOfEvent, () => {
  it('should return false for undefined events', () => {
    expect(isHostOfEvent(undefined)).toBe(false)
  })

  it('should return true for events with no organizer but the event email is the host', () => {
    expect(isHostOfEvent(hostedEventOne)).toBe(true)
  })

  it('should return true for events where the organizer email matches the event email', () => {
    expect(isHostOfEvent(hostedEventTwo)).toBe(true)
  })

  it('should return false for events where the organizer is null and the attendee organizer is not the event email', () => {
    const unhostedEventOne = { ...hostedEventOne, email: 'newEmail' }

    expect(isHostOfEvent(unhostedEventOne)).toBe(false)
  })

  it('should return false for events where the organizer email does not match the event email', () => {
    const unhostedEventTwo = { ...hostedEventTwo, email: 'newEmail' }

    expect(isHostOfEvent(unhostedEventTwo)).toBe(false)
  })
})

describe('allOtherAttendeesDeclined', () => {
  it('should return true if other attendees declined an owner did not', () => {
    expect(
      allOtherAttendeesDeclined(
        [
          {
            email: 'johnsonstone5813@gmail.com',
            isOptional: false,
            isOrganizer: true,
            status: 'accepted',
          },
          {
            email: 'testemail@gmail.com',
            isOptional: false,
            isOrganizer: false,
            status: 'declined',
          },
        ],
        'johnsonstone5813@gmail.com'
      )
    ).toBe(true)
  })

  it('should return false if not all attendees declined', () => {
    expect(
      allOtherAttendeesDeclined(
        [
          {
            email: 'johnsonstone5813@gmail.com',
            isOptional: false,
            isOrganizer: true,
            status: 'accepted',
          },
          {
            email: 'testemail@gmail.com',
            isOptional: false,
            isOrganizer: false,
            status: 'declined',
          },
          {
            email: 'testemail2@gmail.com',
            isOptional: false,
            isOrganizer: false,
            status: 'accepted',
          },
        ],
        'johnsonstone5813@gmail.com'
      )
    ).toBe(false)
  })

  it('should return false if event owner declined', () => {
    expect(
      allOtherAttendeesDeclined(
        [
          {
            email: 'johnsonstone5813@gmail.com',
            isOptional: false,
            isOrganizer: true,
            status: 'declined',
          },
          {
            email: 'testemail@gmail.com',
            isOptional: false,
            isOrganizer: false,
            status: 'declined',
          },
        ],
        'johnsonstone5813@gmail.com'
      )
    ).toBe(false)
  })

  it('should return false if no attendees', () => {
    expect(allOtherAttendeesDeclined([], 'johnsonstone5813@gmail.com')).toBe(
      false
    )
  })
})
