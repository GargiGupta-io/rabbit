import {
  type CalendarEventSchemaV2,
  type EventConferenceType,
  type MeetingBotStatusSchema,
  type MeetingInsightsSchema,
  type RecurringMeetingInsightsSchema,
} from '@motion/rpc-types'
import { isOneOf } from '@motion/utils/array'

import { isRetryableErrorStatus } from './status-details'

export function isNotetakerSupportedConferenceLink(
  conferenceType: EventConferenceType | null | undefined
) {
  return (
    conferenceType === 'hangoutsMeet' ||
    conferenceType === 'meet' ||
    conferenceType === 'zoom' ||
    conferenceType === 'teamsForBusiness'
  )
}

/**
 * Whether the meeting insights is in a state where a bot can be sent.
 *
 * It should be sendable only if the bot is not in progress or completed.
 * */
export function isBotSendable(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  return (
    meetingInsights?.conferenceLink != null &&
    !isOneOf(meetingInsights?.meetingBotStatus, ['IN_PROGRESS', 'COMPLETED']) &&
    // If the bot failed, it should only be sendable if the error is retryable.
    (meetingInsights.meetingBotStatus !== 'FAILED' ||
      isRetryableErrorStatus(meetingInsights)) &&
    meetingInsights?.noteId != null
  )
}

/**
 * Whether the meeting insight is completed
 */
export function isNotetakerCompleted(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  return meetingInsights?.meetingBotStatus === 'COMPLETED'
}

/**
 * Whether the meeting insight is in call
 */
export function isNotetakerInProgress(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  return meetingInsights?.meetingBotStatus === 'IN_PROGRESS'
}

export function isNotetakerFailed(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  return meetingInsights?.meetingBotStatus === 'FAILED'
}

export function isNotetakerSectionHidden(
  meetingInsights: MeetingInsightsSchema | null | undefined,
  eventInfo:
    | Pick<CalendarEventSchemaV2, 'type' | 'conferenceLink' | 'conferenceType'>
    | null
    | undefined,
  recurringMeetingInsights: RecurringMeetingInsightsSchema | null | undefined
) {
  // The event doesn't have a supported conference type, so we should not show the notetaker section.
  if (
    eventInfo != null &&
    !isNotetakerSupportedConferenceLink(eventInfo.conferenceType)
  ) {
    return true
  }

  const recurringDataDoesNotExist =
    eventInfo?.type === 'RECURRING_EVENT' && recurringMeetingInsights == null

  const normalDataDoesNotExist =
    eventInfo?.type === 'NORMAL' && meetingInsights == null

  return (
    isNotetakerCompleted(meetingInsights) ||
    recurringDataDoesNotExist ||
    normalDataDoesNotExist
  )
}

/**
 * @deprecated
 * Whether the meeting insight's bot is in a state that can be changed.
 * @param meetingInsights The meeting insights to check.
 */
export function isBotMutable(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  const unsupportedStatuses: MeetingBotStatusSchema[] = [
    'COMPLETED',
    'DONT_SCHEDULE',
    'FAILED_TO_PROCESS',
  ]

  return (
    meetingInsights != null &&
    !unsupportedStatuses.includes(meetingInsights.meetingBotStatus)
  )
}

/**
 * @deprecated
 * Whether the meeting insights is in a state where a bot can be kicked
 */
export function isBotKickableLegacy(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  return meetingInsights?.meetingBotStatus === 'IN_CALL'
}

/**
 * @deprecated
 * Whether the meeting insights is in a state where a bot can be sent
 * */
export function isBotSendableLegacy(
  meetingInsights: MeetingInsightsSchema | null | undefined
) {
  return (
    meetingInsights?.conferenceLink != null &&
    isOneOf(meetingInsights?.meetingBotStatus, [
      'NEEDS_SCHEDULING',
      'SCHEDULED',
      'FAILED_TO_SCHEDULE',
      'FATAL_BOT_ERROR',
      'BOT_NEVER_ADMITTED',
    ])
  )
}
