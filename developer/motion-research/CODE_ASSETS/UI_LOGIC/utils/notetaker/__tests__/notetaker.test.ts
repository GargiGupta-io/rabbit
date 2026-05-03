import {
  type CalendarEventSchemaV2,
  type EventConferenceType,
  type MeetingInsightsSchema,
  type RecurringMeetingInsightsSchema,
} from '@motion/rpc-types'

import {
  isBotSendable,
  isNotetakerCompleted,
  isNotetakerInProgress,
  isNotetakerSectionHidden,
  isNotetakerSupportedConferenceLink,
} from '../notetaker'

describe('isNotetakerSupportedConferenceLink', () => {
  it('should return true for supported conference types', () => {
    const supportedTypes: EventConferenceType[] = [
      'hangoutsMeet',
      'meet',
      'zoom',
      'teamsForBusiness',
    ]

    supportedTypes.forEach((type) => {
      expect(isNotetakerSupportedConferenceLink(type)).toBe(true)
    })
  })

  it('should return false for unsupported conference types', () => {
    const unsupportedTypes: EventConferenceType[] = [
      'none',
      'phone',
      'customLocation',
      'eventHangout',
      'eventNamedHangout',
      'unknown',
      'skypeForBusiness',
      'skypeForConsumer',
    ]

    unsupportedTypes.forEach((type) => {
      expect(isNotetakerSupportedConferenceLink(type)).toBe(false)
    })
  })

  it('should handle null and undefined values', () => {
    expect(isNotetakerSupportedConferenceLink(null)).toBe(false)
    expect(isNotetakerSupportedConferenceLink(undefined)).toBe(false)
  })
})

describe('isNotetakerCompleted', () => {
  const createMockInsights = (
    status: MeetingInsightsSchema['meetingBotStatus']
  ): MeetingInsightsSchema => ({
    id: 'test-id',
    meetingBotStatus: status,
    meetingBotStatusDetails: null,
    sendRecapToAllAttendees: false,
    startTime: new Date().toISOString(),
    eventData: null,
    summary: null,
    noteId: null,
    parentId: null,
    conferenceLink: null,
    recallMessage: null,
  })

  it('should return true when bot status is COMPLETED', () => {
    const insights = createMockInsights('COMPLETED')

    expect(isNotetakerCompleted(insights)).toBe(true)
  })

  it('should return false for other bot statuses', () => {
    const otherStatuses: MeetingInsightsSchema[] = [
      createMockInsights('SCHEDULED'),
      createMockInsights('DONT_SCHEDULE'),
      createMockInsights('FAILED_TO_PROCESS'),
      createMockInsights('PROCESSING'),
      createMockInsights('NEEDS_SCHEDULING'),
    ]

    otherStatuses.forEach((insights) => {
      expect(isNotetakerCompleted(insights)).toBe(false)
    })
  })

  it('should handle null and undefined values', () => {
    expect(isNotetakerCompleted(null)).toBe(false)
    expect(isNotetakerCompleted(undefined)).toBe(false)
  })
})

describe('isBotSendable', () => {
  const createMockInsights = (
    status: MeetingInsightsSchema['meetingBotStatus'],
    conferenceLink: string | null
  ): MeetingInsightsSchema => ({
    id: 'test-id',
    meetingBotStatus: status,
    meetingBotStatusDetails: null,
    sendRecapToAllAttendees: false,
    startTime: new Date().toISOString(),
    eventData: null,
    summary: null,
    noteId: '12312312',
    parentId: null,
    conferenceLink,
    recallMessage: null,
  })

  it('should return true when bot is not in progress or completed and has conference link', () => {
    const sendableStatuses: MeetingInsightsSchema[] = [
      createMockInsights('SCHEDULED', 'https://example.com'),
      createMockInsights('NEEDS_SCHEDULING', 'https://example.com'),
    ]

    sendableStatuses.forEach((insights) => {
      expect(isBotSendable(insights)).toBe(true)
    })
  })

  it('should return false when bot is in progress or completed', () => {
    const nonSendableStatuses: MeetingInsightsSchema[] = [
      createMockInsights('IN_PROGRESS', 'https://example.com'),
      createMockInsights('COMPLETED', 'https://example.com'),
    ]

    nonSendableStatuses.forEach((insights) => {
      expect(isBotSendable(insights)).toBe(false)
    })
  })

  it('should return true when error is retryable', () => {
    const insights = createMockInsights('FAILED', 'https://example.com')
    insights.meetingBotStatusDetails = 'MEETING_HAD_NO_SPEECH'

    expect(isBotSendable(insights)).toBe(true)
  })

  it('should return false when error is non-retryable', () => {
    const insights = createMockInsights('FAILED', 'https://example.com')
    insights.meetingBotStatusDetails = 'MEETING_NOT_FOUND'

    expect(isBotSendable(insights)).toBe(false)
  })

  it('should return false when note id is null', () => {
    const insights = createMockInsights('SCHEDULED', 'https://example.com')
    insights.noteId = null

    expect(isBotSendable(insights)).toBe(false)
  })

  it('should return false when conference link is null', () => {
    const insights = createMockInsights('SCHEDULED', null)

    expect(isBotSendable(insights)).toBe(false)
  })

  it('should handle null and undefined values', () => {
    expect(isBotSendable(null)).toBe(false)
    expect(isBotSendable(undefined)).toBe(false)
  })
})

describe('isNotetakerInProgress', () => {
  const createMockInsights = (
    status: MeetingInsightsSchema['meetingBotStatus']
  ): MeetingInsightsSchema => ({
    id: 'test-id',
    meetingBotStatus: status,
    meetingBotStatusDetails: null,
    sendRecapToAllAttendees: false,
    startTime: new Date().toISOString(),
    eventData: null,
    summary: null,
    noteId: null,
    parentId: null,
    conferenceLink: null,
    recallMessage: null,
  })

  it('should return true when bot status is IN_PROGRESS', () => {
    const insights = createMockInsights('IN_PROGRESS')

    expect(isNotetakerInProgress(insights)).toBe(true)
  })

  it('should return false for other bot statuses', () => {
    const otherStatuses: MeetingInsightsSchema[] = [
      createMockInsights('COMPLETED'),
      createMockInsights('SCHEDULED'),
      createMockInsights('NEEDS_SCHEDULING'),
    ]

    otherStatuses.forEach((insights) => {
      expect(isNotetakerInProgress(insights)).toBe(false)
    })
  })

  it('should handle null and undefined values', () => {
    expect(isNotetakerInProgress(null)).toBe(false)
    expect(isNotetakerInProgress(undefined)).toBe(false)
  })
})

describe('isNotetakerSectionHidden', () => {
  const createMockEvent = (
    type: CalendarEventSchemaV2['type'],
    conferenceLink: string | null,
    conferenceType: EventConferenceType | undefined = undefined
  ): CalendarEventSchemaV2 =>
    ({
      id: 'test-id',
      type,
      conferenceLink,
      conferenceType,
    }) as CalendarEventSchemaV2

  const createMockInsights = (
    status: MeetingInsightsSchema['meetingBotStatus']
  ): MeetingInsightsSchema => ({
    id: 'test-id',
    meetingBotStatus: status,
    meetingBotStatusDetails: null,
    sendRecapToAllAttendees: false,
    startTime: new Date().toISOString(),
    eventData: null,
    summary: null,
    noteId: null,
    parentId: null,
    conferenceLink: null,
    recallMessage: null,
  })

  it('should return true when event has unsupported conference type', () => {
    const event = createMockEvent('NORMAL', null, 'none')

    expect(isNotetakerSectionHidden(null, event, null)).toBe(true)
  })

  it('should return true when event has no conference type', () => {
    const event = createMockEvent('NORMAL', 'https://example.com', undefined)

    expect(isNotetakerSectionHidden(null, event, null)).toBe(true)
  })

  it('should return true when meeting is completed', () => {
    const event = createMockEvent('NORMAL', 'https://example.com', 'zoom')
    const insights = createMockInsights('COMPLETED')

    expect(isNotetakerSectionHidden(insights, event, null)).toBe(true)
  })

  it('should return true for recurring event with no recurring insights', () => {
    const event = createMockEvent(
      'RECURRING_EVENT',
      'https://example.com',
      'zoom'
    )

    expect(isNotetakerSectionHidden(null, event, null)).toBe(true)
  })

  it('should return true for normal event with no insights', () => {
    const event = createMockEvent('NORMAL', 'https://example.com', 'zoom')

    expect(isNotetakerSectionHidden(null, event, null)).toBe(true)
  })

  it('should return false for normal event with insights', () => {
    const event = createMockEvent('NORMAL', 'https://example.com', 'zoom')
    const insights = createMockInsights('IN_PROGRESS')

    expect(isNotetakerSectionHidden(insights, event, null)).toBe(false)
  })

  it('should return false for recurring event with recurring insights', () => {
    const event = createMockEvent(
      'RECURRING_EVENT',
      'https://example.com',
      'zoom'
    )
    const recurringInsights = {
      id: 'test-id',
      meetingBotStatus: 'IN_PROGRESS',
      sendRecapToAllAttendees: false,
      noteId: null,
      botEnabled: true,
      decodedICalUid: null,
    } as RecurringMeetingInsightsSchema

    expect(isNotetakerSectionHidden(null, event, recurringInsights)).toBe(false)
  })

  it('should handle null and undefined values', () => {
    expect(isNotetakerSectionHidden(null, null, null)).toBe(false)
    expect(isNotetakerSectionHidden(undefined, undefined, undefined)).toBe(
      false
    )
  })
})
