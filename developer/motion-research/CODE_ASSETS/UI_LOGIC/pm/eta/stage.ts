import { templateStr } from '@motion/react-core/strings'
import { type StageSchema } from '@motion/rpc-types'
import { type DeadlineStatusWithReason } from '@motion/shared/common'
import { formatToReadableWeekDayMonth } from '@motion/utils/dates'

import { DateTime } from 'luxon'

import {
  getEtaLabel,
  numDaysAndHoursBetweenDates,
  type PluralizeFunction,
} from './general'
import {
  getMissedDeadlineTooltip,
  getOnTrackTooltip,
  getScheduledPastDeadlineTooltip,
  type MaybeTooltipReturnObject,
} from './tooltip'

type ConfigOptions = {
  normalizeToAtRisk?: boolean
}

/*
 * Normalize the stage deadline status to 'at-risk' if the stage has missed the deadline
 */
export const normalizeStageDeadlineStatus = (
  stage: StageSchema,
  configObject: ConfigOptions = { normalizeToAtRisk: true }
) => {
  let deadlineStatus = stage.deadlineStatus

  if (
    configObject.normalizeToAtRisk &&
    (deadlineStatus === 'missed-deadline' ||
      deadlineStatus === 'scheduled-past-deadline')
  ) {
    deadlineStatus = 'at-risk'
  }

  return deadlineStatus
}

export const getStageEtaTitle = (stage: StageSchema) => {
  const deadlineStatus = normalizeStageDeadlineStatus(stage, {
    normalizeToAtRisk: false,
  })
  return getEtaLabel(deadlineStatus, 'stage')
}

export const getStageEtaReason = (
  stage: StageSchema,
  pluralize: (
    numDays: number,
    singular: string,
    plural: string
  ) => string | React.ReactNode
) => {
  const deadlineStatus = stage.deadlineStatus ?? 'none'

  const scheduledDate = stage.estimatedCompletionTime
    ? stage.estimatedCompletionTime
    : null

  const dateDue = formatToReadableWeekDayMonth(stage.dueDate ?? '')

  const { numDaysMissed, numHoursMissed } = numDaysAndHoursBetweenDates(
    stage.dueDate,
    scheduledDate
  )

  switch (deadlineStatus) {
    case 'missed-deadline':
      return stage.dueDate
        ? templateStr('Due {{dateDue}} ({{daysAgo}})', {
            dateDue,
            daysAgo: DateTime.fromISO(stage.dueDate).toRelative(),
          })
        : ''
    case 'scheduled-past-deadline':
    case 'at-risk':
      const shouldShowHours = numDaysMissed === 0 && numHoursMissed > 0

      return templateStr(
        'Due {{dateDue}}. Scheduled {{numMissed}} {{pluralizedText}} after',
        {
          dateDue,
          numMissed: shouldShowHours ? numHoursMissed : numDaysMissed,
          pluralizedText: shouldShowHours
            ? pluralize(numHoursMissed, 'hour', 'hours')
            : pluralize(numDaysMissed, 'day', 'days'),
        }
      )
    case 'on-track':
      return scheduledDate
        ? templateStr('Due {{dateDue}} {{scheduledText}}', {
            dateDue,
            scheduledText:
              numDaysMissed > 0
                ? templateStr(
                    '({{daysDiff}} {{pluralizedText}} after scheduled date)',
                    {
                      numDaysMissed,
                      pluralizedText: pluralize(numDaysMissed, 'day', 'days'),
                    }
                  )
                : '(Scheduled on due date)',
          })
        : ''
    default:
      return ''
  }
}

export const getExtendedStageDeadlineStatus = (
  stage: StageSchema | null,
  configObject: ConfigOptions = { normalizeToAtRisk: false }
): DeadlineStatusWithReason => {
  if (stage === null) return 'none'

  const deadlineStatus = normalizeStageDeadlineStatus(stage, configObject)

  if (deadlineStatus !== 'none') return stage.deadlineStatus

  if (stage.completedTime) {
    return 'completed'
  } else if (stage.canceledTime) {
    return 'canceled'
  }

  return 'none'
}

export const getStageNoEtaReason = (
  stage: StageSchema,
  configObject: ConfigOptions = { normalizeToAtRisk: false }
) => {
  const deadlineStatus = getExtendedStageDeadlineStatus(stage, configObject)

  if (
    deadlineStatus !== 'none' &&
    deadlineStatus !== 'completed' &&
    deadlineStatus !== 'canceled'
  )
    return null

  if (deadlineStatus === 'completed') {
    return 'Stage complete'
  } else if (deadlineStatus === 'canceled') {
    return 'Stage canceled'
  } else if (!stage.scheduledStatus) {
    return 'No ETA because there are no auto-scheduled tasks in this stage'
  }

  return 'No ETA'
}

/*
  Given a stage, return the tooltip title, action, and ETA text
*/
export const getStageEtaTooltip = (
  stage: StageSchema,
  pluralize: PluralizeFunction
): MaybeTooltipReturnObject => {
  const deadlineStatus = normalizeStageDeadlineStatus(stage, {
    normalizeToAtRisk: false,
  })

  if (deadlineStatus === 'none') {
    return {
      title: getStageNoEtaReason(stage) ?? '',
      action: undefined,
      etaText: undefined,
    }
  } else if (deadlineStatus === 'missed-deadline') {
    return getMissedDeadlineTooltip(
      stage.dueDate,
      stage.estimatedCompletionTime,
      pluralize
    )
  } else if (deadlineStatus === 'scheduled-past-deadline') {
    return getScheduledPastDeadlineTooltip(
      stage.dueDate,
      stage.estimatedCompletionTime,
      pluralize
    )
  } else if (deadlineStatus === 'on-track') {
    return getOnTrackTooltip(
      stage.dueDate,
      stage.estimatedCompletionTime,
      pluralize
    )
  }
}
