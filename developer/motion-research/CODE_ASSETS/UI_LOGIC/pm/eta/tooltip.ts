import { templateStr } from '@motion/react-core/strings'
import { formatToReadableWeekDayMonth } from '@motion/utils/dates'

import { DateTime } from 'luxon'
import { type ReactNode } from 'react'

import {
  numDaysAndHoursBetweenDates,
  type PluralizeFunction,
  safeDateDiff,
} from './general'

export type TooltipReturnObject = {
  title: string | ReactNode
  action: string | ReactNode | undefined
  etaText: string | ReactNode | undefined
}

export type MaybeTooltipReturnObject = TooltipReturnObject | undefined

export const getMissedDeadlineTooltip = (
  dueDate: string | null,
  scheduledDate: string | null,
  pluralize: PluralizeFunction
): MaybeTooltipReturnObject => {
  const numDaysMissed = safeDateDiff(dueDate, DateTime.now().toISO())

  return {
    title: numDaysMissed
      ? templateStr('Missed deadline by {{numDaysMissed}} {{pluralDays}}', {
          numDaysMissed,
          pluralDays: pluralize(numDaysMissed, 'day', 'days'),
        })
      : 'Missed deadline',
    action: 'Click to see how to resolve this',
    etaText: scheduledDate
      ? templateStr('ETA: {{scheduledDate}}', {
          scheduledDate: formatToReadableWeekDayMonth(scheduledDate),
        })
      : undefined,
  }
}

export const getScheduledPastDeadlineTooltip = (
  dueDate: string | null,
  scheduledDate: string | null,
  pluralize: PluralizeFunction
): MaybeTooltipReturnObject => {
  const { numDaysMissed, numHoursMissed } = numDaysAndHoursBetweenDates(
    dueDate,
    scheduledDate
  )

  return {
    title: numDaysMissed
      ? templateStr(
          'Scheduled past deadline by {{numDaysMissed}} {{pluralDays}}',
          {
            numDaysMissed,
            pluralDays: pluralize(numDaysMissed, 'day', 'days'),
          }
        )
      : numHoursMissed > 0
        ? templateStr(
            'Scheduled past deadline by {{numHoursMissed}} {{pluralHours}}',
            {
              numHoursMissed,
              pluralHours: pluralize(numHoursMissed, 'hour', 'hours'),
            }
          )
        : 'Scheduled past deadline',
    action: 'Click to see how to resolve this',
    etaText: scheduledDate
      ? templateStr('ETA: {{scheduledDate}}{{timeModifier}}', {
          scheduledDate: formatToReadableWeekDayMonth(scheduledDate),
          timeModifier:
            numHoursMissed > 0 && numDaysMissed === 0
              ? ` at ${DateTime.fromISO(scheduledDate).toFormat('h:mm a')}`
              : '',
        })
      : undefined,
  }
}

export const getOnTrackTooltip = (
  dueDate: string | null,
  scheduledDate: string | null,
  pluralize: PluralizeFunction
): MaybeTooltipReturnObject => {
  const numDaysAhead = safeDateDiff(scheduledDate, dueDate)

  return {
    title: numDaysAhead
      ? templateStr('On track ({{numDaysAhead}} {{pluralDays}} ahead)', {
          numDaysAhead,
          pluralDays: pluralize(numDaysAhead, 'day', 'days'),
        })
      : 'On track',
    action: undefined,
    etaText: scheduledDate
      ? templateStr('ETA: {{scheduledDate}}', {
          scheduledDate: formatToReadableWeekDayMonth(scheduledDate),
        })
      : undefined,
  }
}

export const getAheadOfScheduleTooltip = (
  dueDate: string | null,
  scheduledDate: string | null,
  pluralize: PluralizeFunction
): MaybeTooltipReturnObject => {
  const numDaysAhead = safeDateDiff(scheduledDate, dueDate)

  return {
    title: numDaysAhead
      ? templateStr('Ahead of schedule by {{numDaysAhead}} {{pluralDays}}', {
          numDaysAhead,
          pluralDays: pluralize(numDaysAhead, 'day', 'days'),
        })
      : 'Ahead of schedule',
    action: 'Click to see how to optimize this',
    etaText: scheduledDate
      ? templateStr('ETA: {{scheduledDate}}', {
          scheduledDate: formatToReadableWeekDayMonth(scheduledDate),
        })
      : undefined,
  }
}
