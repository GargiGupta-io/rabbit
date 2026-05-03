import { type MeetingInsightsSchema } from '@motion/zod/client'

import { type ReactNode } from 'react'

import { isBotSendable, isNotetakerCompleted } from './notetaker'
import {
  ErrorStateLabels,
  isFatalErrorStatus,
  isInProgressStatus,
  isJoiningStatus,
  IsProcessingLabel,
  isProcessingStatus,
  JoiningStateLabels,
} from './status-details'

type BotState = {
  sentiment: 'error' | 'neutral'
  variant: 'solid' | 'outlined' | 'muted'
  icon: 'AINotetakerOutline' | 'XOutline' | 'AINotetakerRemoveOutline'
  tooltip: ReactNode
  disabled?: boolean
}

export function getBotState(
  meetingInsights: MeetingInsightsSchema,
  isHovering: boolean
): BotState | null {
  if (isJoiningStatus(meetingInsights)) {
    return {
      sentiment: 'neutral',
      variant: 'muted',
      icon: 'AINotetakerOutline',
      tooltip: JoiningStateLabels[meetingInsights.meetingBotStatusDetails],
      disabled: true,
    }
  } else if (isProcessingStatus(meetingInsights)) {
    return {
      sentiment: 'neutral',
      variant: 'muted',
      icon: 'AINotetakerOutline',
      tooltip: IsProcessingLabel,
      disabled: true,
    }
  } else if (isInProgressStatus(meetingInsights)) {
    return {
      sentiment: 'error',
      variant: isHovering ? 'solid' : 'outlined',
      icon: isHovering ? 'XOutline' : 'AINotetakerOutline',
      tooltip: 'Kick Notetaker from meeting',
      disabled: false,
    }
  } else if (isBotSendable(meetingInsights)) {
    return {
      sentiment: 'neutral',
      variant: 'muted',
      icon: 'AINotetakerOutline',
      tooltip: 'Add Notetaker to meeting now',
      disabled: false,
    }
  } else if (isFatalErrorStatus(meetingInsights)) {
    return {
      sentiment: 'neutral',
      variant: 'outlined',
      icon: 'AINotetakerRemoveOutline',
      tooltip: ErrorStateLabels[meetingInsights.meetingBotStatusDetails],
      disabled: true,
    }
  } else if (isNotetakerCompleted(meetingInsights)) {
    return {
      sentiment: 'neutral',
      variant: 'outlined',
      icon: 'AINotetakerRemoveOutline',
      tooltip: "Notetaker can't be added back to a completed meeting",
      disabled: true,
    }
  }

  return null
}
