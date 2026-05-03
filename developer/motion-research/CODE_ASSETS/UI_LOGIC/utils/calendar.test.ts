import {
  CalendarAccessRole,
  type CalendarEvent,
  type CalendarList,
  CalendarProviderType,
  type Contact,
  type DeprecatedCalendar,
  type EmailAccount,
  type EventAttendee,
} from '@motion/rpc-types/legacy'
import { type CalendarSchema } from '@motion/zod/client'

import {
  findCalendarForContact,
  getCalendarForEvent,
  getEditableCalendars,
  getEventOrganizer,
  getMainCalendars,
  isCalendarRemovableFromAccount,
  isCalendarRemovableFromMyCalendars,
  isMainCalendar,
  isValidConferenceTypeForProviderType,
  sortCalendars,
} from './calendar'

const testEvent: CalendarEvent = {
  id: '',
  attendees: [],
  providerId: '',
  title: '',
  description: '',
  iCalUid: '',
  type: '',
  start: '',
  end: '',
  isAllDay: false,
  status: 'FREE',
  location: undefined,
  isCancelled: false,
  conferenceLink: null,
  teamTaskId: null,
  visibility: '',
  recurrence: null,
  recurringEventId: '',
  areAttendeesHidden: false,
  canAttendeesInvite: false,
  canAttendeesModify: false,
  url: '',
  colorId: null,
  bookingLinkId: null,
  bookingPriority: null,
  isDeleted: false,
  sourceEventId: null,
  sourceCalendarId: null,
  travelTimeId: null,
  travelTimeBefore: null,
  travelTimeAfter: null,
  calendarId: '',
  email: '',
  recurringParentId: null,
}

const testEventAttendee: EventAttendee = {
  displayName: '',
  email: '',
  isOptional: false,
  isOrganizer: false,
  status: 'needsAction',
}

const testCalendar: DeprecatedCalendar = {
  id: '',
  email: '',
}

describe('calendarEvents', () => {
  describe('getEventOrganizer()', () => {
    it('returns organizer displayName when present', () => {
      const event = {
        organizer: {
          displayName: 'John Doe',
          email: '',
        },
      }

      expect(getEventOrganizer(event)).toEqual(event.organizer.displayName)
    })

    it('returns organizer email when displayName is not present', () => {
      const event = {
        organizer: {
          displayName: '',
          email: 'test@email.com',
        },
      }

      expect(getEventOrganizer(event)).toEqual(event.organizer.email)
    })

    it('returns the event email organizer is not present', () => {
      const event = {
        email: 'test@test.com',
      }

      expect(getEventOrganizer(event)).toEqual(event.email)
    })

    it('should return empty string when no email', () => {
      const actual = getEventOrganizer({ email: undefined })

      expect(actual).toEqual('')
    })
  })

  describe('getCalendarForEvent()', () => {
    it('should return the calendar for the event', () => {
      const event = {
        ...testEvent,
        calendarId: 'calendar1',
        email: 'test@email.com',
      }

      const calendarList = {
        [event.email]: [{ ...testCalendar, id: event.calendarId }],
      }

      const result = getCalendarForEvent(event, calendarList)

      expect(result).toEqual(calendarList[event.email][0])
    })

    it('should return undefined when no calendar is found for an event', () => {
      const event = {
        ...testEvent,
        calendarId: 'calendar1',
        email: '',
      }

      const calendarList = {}

      const result = getCalendarForEvent(event, calendarList)

      expect(result).toEqual(undefined)
    })
  })
})

describe('getMainCalendars()', () => {
  it('returns the main calendars from a calendar list', () => {
    const testMainEmail = 'test@test.com'

    const testMainCalendar: DeprecatedCalendar = {
      id: '123',
      email: testMainEmail,
      primary: true,
    }

    const testNonMainCalendar: DeprecatedCalendar = {
      id: '123',
      email: testMainEmail,
      primary: false,
    }

    const calendarList: CalendarList = {
      [testMainEmail]: [testMainCalendar, testNonMainCalendar],
    }

    const actual = getMainCalendars(calendarList)

    expect(actual).toEqual([testMainCalendar])
    expect(actual).not.toContain(testNonMainCalendar)
  })
})

describe('isMainCalendar()', () => {
  it('correctly identifies main calendar', () => {
    const testMainEmail = 'test@test.com'

    const testMainCalendar: DeprecatedCalendar = {
      id: '123',
      email: testMainEmail,
      primary: true,
    }

    const actual = isMainCalendar(
      testMainEmail,
      testMainCalendar.email,
      testMainCalendar.primary as boolean
    )

    expect(actual).toEqual(true)
  })

  it('correctly identifies not main calendar', () => {
    const testMainEmail = 'test@test.com'

    const testNonMainCalendar: DeprecatedCalendar = {
      id: '123',
      email: testMainEmail,
      primary: false,
    }

    const actual = isMainCalendar(
      testMainEmail,
      testNonMainCalendar.email,
      testNonMainCalendar.primary as boolean
    )

    expect(actual).toEqual(false)
  })
})

describe('isValidConferenceTypeForProviderType', () => {
  it('should return true for common conference types', () => {
    const providerTypes: CalendarProviderType[] = [
      'GOOGLE',
      'MICROSOFT',
      'APPLE',
    ]

    for (const providerType of providerTypes) {
      expect(
        isValidConferenceTypeForProviderType('none', providerType)
      ).toEqual(true)
      expect(
        isValidConferenceTypeForProviderType('phone', providerType)
      ).toEqual(true)
      expect(
        isValidConferenceTypeForProviderType('zoom', providerType)
      ).toEqual(true)
      expect(
        isValidConferenceTypeForProviderType('customLocation', providerType)
      ).toEqual(true)
    }
  })

  it('should return true for google conference types if GOOGLE provider', () => {
    expect(isValidConferenceTypeForProviderType('meet', 'GOOGLE')).toEqual(true)
    expect(
      isValidConferenceTypeForProviderType('hangoutsMeet', 'GOOGLE')
    ).toEqual(true)
    expect(
      isValidConferenceTypeForProviderType('teamsForBusiness', 'GOOGLE')
    ).toEqual(true)
    expect(isValidConferenceTypeForProviderType('meet', 'MICROSOFT')).toEqual(
      false
    )
    expect(
      isValidConferenceTypeForProviderType('hangoutsMeet', 'APPLE')
    ).toEqual(false)
  })

  it('should return true for microsoft conference types if MICROSOFT provider', () => {
    expect(
      isValidConferenceTypeForProviderType('teamsForBusiness', 'MICROSOFT')
    ).toEqual(true)
    expect(
      isValidConferenceTypeForProviderType('teamsForBusiness', 'APPLE')
    ).toEqual(false)
  })
})

function createFakeCalendar(
  overrides?: Partial<CalendarSchema>
): CalendarSchema {
  return {
    id: '',
    userId: '',
    emailAccountId: '',
    type: 'DEFAULT',
    providerId: '',
    accessRole: CalendarAccessRole.VIEWER,
    allowedConferenceTypes: [],
    colorId: '',
    isEnabled: false,
    isInFrequentlyMet: false,
    isInMyCalendars: false,
    isPrimary: false,
    providerType: CalendarProviderType.GOOGLE,
    title: '',
    status: 'OK',
    ...overrides,
  }
}

describe('isCalendarRemovableFromMyCalendars', () => {
  // Test case 1: Calendar is removable
  it('should return true when calendar is removable', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: false,
      isPrimary: false,
    })

    const mainEmailAccountId = 'mainAccountId'
    const result = isCalendarRemovableFromMyCalendars(
      calendar,
      mainEmailAccountId
    )

    expect(result).toBe(true)
  })

  // Test case 2: Calendar is not removable when it is the primary main calendar
  it('should return false when calendar is the primary main calendar', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: true,
      isPrimary: true,
    })

    const mainEmailAccountId = 'mainAccountId'
    const result = isCalendarRemovableFromMyCalendars(
      calendar,
      mainEmailAccountId
    )

    expect(result).toBe(false)
  })

  it('should return true when calendar is primary but not the main calendar', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: true,
      isPrimary: true,
    })

    const mainEmailAccountId = 'otherAccountId'
    const result = isCalendarRemovableFromMyCalendars(
      calendar,
      mainEmailAccountId
    )

    expect(result).toBe(true)
  })

  it('should return true when calendar is not primary main calendar', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: true,
      isPrimary: false,
    })

    const mainEmailAccountId = 'mainAccountId'
    const result = isCalendarRemovableFromMyCalendars(
      calendar,
      mainEmailAccountId
    )

    expect(result).toBe(true)
  })
})

describe('isCalendarRemovableFromAccount', () => {
  it('should return true when calendar is not in My calendars and is not primary', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: false,
      isPrimary: false,
    })

    const result = isCalendarRemovableFromAccount(calendar)

    expect(result).toBe(true)
  })

  it('should return false when calendar is in "My Calendars"', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: true,
      isPrimary: false,
    })

    const result = isCalendarRemovableFromAccount(calendar)

    expect(result).toBe(false)
  })

  it('should return false when calendar is primary', () => {
    const calendar = createFakeCalendar({
      emailAccountId: 'mainAccountId',
      isInMyCalendars: false,
      isPrimary: true,
    })

    const result = isCalendarRemovableFromAccount(calendar)

    expect(result).toBe(false)
  })
})

describe('sortCalendars', () => {
  // Mock data for testing
  const mockCalendars = [
    createFakeCalendar({
      id: '1',
      title: 'Calendar B',
      emailAccountId: 'user1',
      isPrimary: true,
    }),
    createFakeCalendar({
      id: '2',
      title: 'Calendar A',
      emailAccountId: 'user2',
      isPrimary: false,
    }),
    createFakeCalendar({
      id: '3',
      title: 'Calendar C',
      emailAccountId: 'user1',
      isPrimary: false,
    }),
    // Add more mock calendar data as needed
  ]

  const mockMainEmailAccountId = 'user1'

  it('should prioritize main calendar emails and primary calendars', () => {
    const result = sortCalendars(mockCalendars, mockMainEmailAccountId)

    // Check if the result is an array
    expect(Array.isArray(result)).toBe(true)

    // Check if main calendar emails are at the top
    expect(result[0].emailAccountId).toBe(mockMainEmailAccountId)

    // Check if primary calendars are at the top among main calendar emails
    const mainEmailCalendars = result.filter(
      (calendar) => calendar.emailAccountId === mockMainEmailAccountId
    )

    expect(mainEmailCalendars[0].isPrimary).toBe(true)
  })

  it('should sort calendars by title for non-main calendar emails', () => {
    const result = sortCalendars(mockCalendars, mockMainEmailAccountId)

    // Check if the result is an array
    expect(Array.isArray(result)).toBe(true)

    // Check if calendars are sorted by title among non-main calendar emails
    const nonMainEmailCalendars = result.filter(
      (calendar) => calendar.emailAccountId !== mockMainEmailAccountId
    )
    for (let i = 1; i < nonMainEmailCalendars.length; i++) {
      expect(
        nonMainEmailCalendars[i].title >= nonMainEmailCalendars[i - 1].title
      ).toBe(true)
    }
  })
})

function createFakeContact(overrides: Partial<Contact>): Contact {
  return {
    email: '',
    displayName: '',
    profilePic: '',
    teamDomain: false,
    rank: 0,
    searchId: '',
    account: '',
    ...overrides,
  }
}

function createFakeEmailAccount(
  overrides: Partial<EmailAccount>
): EmailAccount {
  return {
    id: '',
    userId: '',
    email: '',
    name: null,
    providerType: CalendarProviderType.GOOGLE,
    profilePictureUrl: undefined,
    scope: [],
    status: '',
    calendarSyncEnabled: true,
    emailSyncEnabled: false,
    createdTime: '',
    updatedTime: null,
    ...overrides,
  }
}

describe('findCalendarForContact', () => {
  // Mock data for testing
  const mockContact: Contact = createFakeContact({
    email: 'john.doe@example.com',
    account: 'user1@example.com',
  })

  const mockEmailAccounts: EmailAccount[] = [
    createFakeEmailAccount({ id: 'user1', email: 'user1@example.com' }),
    createFakeEmailAccount({ id: 'user2', email: 'user2@example.com' }),
    // Add more mock email account data as needed
  ]

  const mockCalendars: CalendarSchema[] = [
    createFakeCalendar({
      id: '1',
      providerId: 'john.doe@example.com',
      emailAccountId: 'user1',
    }),
    createFakeCalendar({
      id: '2',
      providerId: 'other.email@example.com',
      emailAccountId: 'user2',
    }),
    // Add more mock calendar data as needed
  ]

  it('should return the correct calendar for a contact with a valid account', () => {
    const result = findCalendarForContact(
      mockContact,
      mockEmailAccounts,
      mockCalendars
    )

    // Check if the result is the expected calendar
    expect(result).toEqual(mockCalendars[0])
  })

  it('should return undefined if contact account is not found in email accounts', () => {
    const invalidContact: Contact = createFakeContact({
      email: 'invalid.contact@example.com',
      account: 'nonexistent.account@example.com',
    })

    const result = findCalendarForContact(
      invalidContact,
      mockEmailAccounts,
      mockCalendars
    )

    // Check if the result is undefined
    expect(result).toBeUndefined()
  })

  it('should return undefined if contact does not have an account', () => {
    const contactWithoutAccount = createFakeContact({
      email: 'no.account@example.com',
    })

    const result = findCalendarForContact(
      contactWithoutAccount,
      mockEmailAccounts,
      mockCalendars
    )

    // Check if the result is undefined
    expect(result).toBeUndefined()
  })

  it('should return undefined if the calendar is not found', () => {
    const contactWithoutCalendar = createFakeContact({
      email: 'no.calendar@example.com',
      account: 'user1@example.com',
    })

    const result = findCalendarForContact(
      contactWithoutCalendar,
      mockEmailAccounts,
      mockCalendars
    )

    // Check if the result is undefined
    expect(result).toBeUndefined()
  })
})

describe('getEditableCalendars', () => {
  it('should return only calendars with appropriate access roles', () => {
    const calendars = [
      {
        id: '1',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.OWNER,
      },
      {
        id: '3',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: true,
        accessRole: CalendarAccessRole.VIEWER,
      },
      {
        id: '4',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
      {
        id: '5',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
      },
    ] as CalendarSchema[]

    const result = getEditableCalendars(calendars)

    expect(result).toEqual([
      {
        id: '3',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: true,
        accessRole: CalendarAccessRole.VIEWER,
      },
      {
        id: '1',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.OWNER,
      },
      {
        id: '4',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
    ])
  })

  it('should prioritize primary calendars at the beginning', () => {
    const calendars = [
      {
        id: '1',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.OWNER,
      },
      {
        id: '2',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: true,
        accessRole: CalendarAccessRole.EDITOR,
      },
      {
        id: '3',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
    ] as CalendarSchema[]

    const result = getEditableCalendars(calendars)

    expect(result).toEqual([
      {
        id: '2',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: true,
        accessRole: CalendarAccessRole.EDITOR,
      },
      {
        id: '1',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.OWNER,
      },
      {
        id: '3',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.EDITOR,
      },
    ])
  })

  it('should return an empty array if no calendars have appropriate access roles', () => {
    const calendars = [
      {
        id: '1',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
      },
      {
        id: '2',
        emailAccountId: '1',
        providerId: '1',
        isPrimary: false,
        accessRole: CalendarAccessRole.VIEWER,
      },
    ] as CalendarSchema[]

    const result = getEditableCalendars(calendars)

    expect(result).toEqual([])
  })

  it('should handle an empty input array', () => {
    const calendars: CalendarSchema[] = []

    const result = getEditableCalendars(calendars)

    expect(result).toEqual([])
  })
})
