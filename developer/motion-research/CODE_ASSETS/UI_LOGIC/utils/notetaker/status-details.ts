import {
  FatalErrorStatusDetailsSchema,
  type MeetingInsightsSchema,
  RetryableErrorStatusDetailsSchema,
} from '@motion/zod/client'

import { type ReactNode } from 'react'

export const JoiningStateLabels: Record<JoiningStatusDetails, string> = {
  BOT_IN_WAITING_ROOM: 'Notetaker is in waiting room...',
  BOT_JOINING_CALL: 'Notetaker is joining call...',
}

export const ErrorStateLabels: Record<
  RetryableErrorStatusDetailsSchema | FatalErrorStatusDetailsSchema,
  ReactNode
> = {
  BOT_ERRORED: 'Error sending bot. Please try again.',
  RECALL_TEMP_LIMIT_EXCEEDED: 'Temporary bot limit exceeded. Please try again.',
  MEETING_URL_UNSUPPORTED:
    'The meeting link or conference type is not supported. Please try again.',
  BOT_KICKED_FROM_WAITING_ROOM:
    'Bot was kicked from waiting room. Please try again.',
  BOT_TIMED_OUT_IN_WAITING_ROOM:
    'Bot timed out in waiting room. Please try again.',
  RECORDING_PERMISSIONS_DENIED:
    'Recording permissions denied. Please try again.',
  MEETING_REQUIRED_LOGIN:
    'Meeting requires login. Please update the meeting link with the correct credentials and try again.',
  MEETING_PASSWORD_INCORRECT:
    'Meeting password is incorrect. Please update the meeting link with the correct credentials and try again.',
  MEETING_NOT_FOUND:
    'Meeting not found. Please update the meeting link and try again.',
  MEETING_FULL: 'Meeting is full.',
  ZOOM_LOCAL_RECORDING_DISABLED:
    'The meeting host has disabled their global recording setting, please enable it and try again.',
  ZOOM_LOCAL_RECORDING_REQUEST_DISABLED:
    'The meeting host has disabled their local recording request setting, please enable it and try again.', // TODO: Add support link when available
  ZOOM_LOCAL_RECORDING_NOT_SUPPORTED:
    'The meeting host is using Zoom Room or other Zoom client that does not support local recording permission. Try changing a different client to record the meeting.',
  FAILED_TO_SCHEDULE:
    'Failed to schedule the bot. Please contact support for assistance.',
  FAILED_TO_PROCESS:
    'Failed to process the meeting. Please contact support for assistance.',
  MEETING_HAD_NO_SPEECH: 'The meeting had no speech. Please try again.',
  BOT_KICKED_FROM_CALL_BEFORE_RECORDING:
    'Bot was kicked from the call before recording started. Please try again.',
  TEAMS_TENANT_BLACKLISTED:
    'Meeting bots are blacklisted from this Teams tenant.', // TODO: Add support link when available
}

export const IsProcessingLabel =
  'Notetaker is summarizing notes & action items...'

/**
 * Status details related to the bot joining the call
 */
export const JoiningStatusDetails = makeStatusDetails([
  'BOT_IN_WAITING_ROOM',
  'BOT_JOINING_CALL',
])
export type JoiningStatusDetails = (typeof JoiningStatusDetails)[number]

export function isJoiningStatus(
  meetingInsights: MeetingInsightsSchema | null | undefined
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: 'IN_PROGRESS'
  meetingBotStatusDetails: JoiningStatusDetails
} {
  return hasStatusAndDetails(
    meetingInsights,
    'IN_PROGRESS',
    JoiningStatusDetails
  )
}

/**
 * Status details related to the bot being in an active call
 */
export const InProgressStatusDetails = makeStatusDetails([
  'BOT_IN_CALL_RECORDING',
  'BOT_IN_CALL_NOT_RECORDING',
])
export type InProgressStatusDetails = (typeof InProgressStatusDetails)[number]

export function isInProgressStatus(
  meetingInsights: MeetingInsightsSchema | null | undefined
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: 'IN_PROGRESS'
  meetingBotStatusDetails: InProgressStatusDetails
} {
  return hasStatusAndDetails(
    meetingInsights,
    'IN_PROGRESS',
    InProgressStatusDetails
  )
}

/**
 * Status details related to processing the meeting
 */
export const ProcessingStatusDetails = makeStatusDetails(['PROCESSING_MEETING'])
export type ProcessingStatusDetails = (typeof ProcessingStatusDetails)[number]

export function isProcessingStatus(
  meetingInsights: MeetingInsightsSchema | null | undefined
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: 'IN_PROGRESS'
  meetingBotStatusDetails: ProcessingStatusDetails
} {
  return hasStatusAndDetails(
    meetingInsights,
    'IN_PROGRESS',
    ProcessingStatusDetails
  )
}

/**
 * Status details that indicate a warning state
 */
export const WarningStatusDetails = makeStatusDetails([
  'MEETING_PARTIALLY_RECORDED',
  'MEETING_HAD_NO_SPEECH',
])
export type WarningStatusDetails = (typeof WarningStatusDetails)[number]

export function isWarningStatus(
  meetingInsights: MeetingInsightsSchema | null | undefined
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: 'COMPLETED'
  meetingBotStatusDetails: WarningStatusDetails
} {
  return hasStatusAndDetails(meetingInsights, 'COMPLETED', WarningStatusDetails)
}

export function isRetryableErrorStatus(
  meetingInsights: MeetingInsightsSchema | null | undefined
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: 'FAILED'
  meetingBotStatusDetails: RetryableErrorStatusDetailsSchema
} {
  return hasStatusAndDetails(
    meetingInsights,
    'FAILED',
    RetryableErrorStatusDetailsSchema
  )
}

export function isFatalErrorStatus(
  meetingInsights: MeetingInsightsSchema | null | undefined
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: 'FAILED'
  meetingBotStatusDetails: FatalErrorStatusDetailsSchema
} {
  return hasStatusAndDetails(
    meetingInsights,
    'FAILED',
    FatalErrorStatusDetailsSchema
  )
}

/**
 * Helper function to create a readonly array of status details with proper typing
 */
function makeStatusDetails<
  T extends readonly MeetingInsightsSchema['meetingBotStatusDetails'][],
>(arr: T) {
  return arr
}

/**
 * Type guard to check if meeting insights has a specific status and details
 */
function hasStatusAndDetails<
  T extends MeetingInsightsSchema['meetingBotStatusDetails'],
>(
  meetingInsights: MeetingInsightsSchema | null | undefined,
  status: MeetingInsightsSchema['meetingBotStatus'],
  details: readonly T[]
): meetingInsights is MeetingInsightsSchema & {
  meetingBotStatus: typeof status
  meetingBotStatusDetails: T
} {
  return (
    !!meetingInsights?.meetingBotStatusDetails &&
    meetingInsights.meetingBotStatus === status &&
    details.includes(meetingInsights.meetingBotStatusDetails as T)
  )
}
