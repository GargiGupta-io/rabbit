import {
  EndRelativeDateOption,
  StartRelativeDateOption,
  type UserTaskSettingRelativeDateOption,
} from '@motion/shared/common'

import { DateTime } from 'luxon'

export function mapRelativeDateOptionToAbsoluteDate(
  relativeDate: UserTaskSettingRelativeDateOption | null,
  {
    bound = 'start',
  }: {
    bound?: 'start' | 'end'
  } = {}
) {
  if (relativeDate == null) {
    return null
  }

  const today = DateTime.now().startOf('day')
  let absoluteDate: DateTime | null = null

  switch (relativeDate) {
    case 'today':
      absoluteDate = today
      break
    case 'tomorrow':
      absoluteDate = today.plus({ days: 1 })
      break
    case 'this-week': {
      if (bound === 'start') {
        // Get Monday of current week, or if weekend, Monday of next week
        absoluteDate =
          today.weekday === 1
            ? today
            : today
                .set({ weekday: 1 })
                .plus({ weeks: today.weekday >= 5 ? 1 : 0 })
      } else {
        // Get Friday of current week, or if weekend, Friday of next week
        absoluteDate =
          today.weekday === 5
            ? today
            : today
                .set({ weekday: 5 })
                .plus({ weeks: today.weekday >= 5 ? 1 : 0 })
      }
      break
    }
    case 'next-week': {
      if (bound === 'start') {
        absoluteDate = today.plus({ weeks: 1 }).startOf('week')
      } else {
        absoluteDate = today.plus({ weeks: 1 }).set({ weekday: 5 })
      }
      break
    }
    case 'next-7-days':
      absoluteDate = today.plus({ weeks: 1 })
      break
    case 'next-14-days': {
      if (bound === 'start') {
        absoluteDate = today.plus({ weeks: 2 }).startOf('week')
      } else {
        absoluteDate = today.plus({ weeks: 2 }).set({ weekday: 5 })
      }
      break
    }
    case 'this-month': {
      if (bound === 'start') {
        absoluteDate = today.startOf('month')
      } else {
        absoluteDate = today.endOf('month')
      }
      break
    }
    case 'next-month': {
      if (bound === 'start') {
        absoluteDate = today.plus({ months: 1 }).startOf('month')
      } else {
        absoluteDate = today.plus({ months: 1 }).endOf('month')
      }
      break
    }
    case 'next-30-days': {
      absoluteDate = today.plus({ month: 1 })
      break
    }
    default:
      break
  }

  if (absoluteDate == null) {
    return null
  }

  return bound === 'start'
    ? absoluteDate.startOf('day')
    : absoluteDate.endOf('day')
}

export function findRelativeDateOptionAfter(
  targetDate: DateTime
): EndRelativeDateOption {
  // Try each option until we find one that's after the target date
  for (const option of EndRelativeDateOption) {
    const dateTime = mapRelativeDateOptionToAbsoluteDate(option, {
      bound: 'end',
    })

    if (dateTime && dateTime.startOf('day') > targetDate.startOf('day')) {
      return option
    }
  }

  // If no valid option found, return the last option
  return EndRelativeDateOption[EndRelativeDateOption.length - 1]
}

export function findRelativeDateOptionBefore(
  targetDate: DateTime
): StartRelativeDateOption {
  // Try each option in reverse until we find one that's before the target date
  for (let i = StartRelativeDateOption.length - 1; i >= 0; i--) {
    const option = StartRelativeDateOption[i]
    const dateTime = mapRelativeDateOptionToAbsoluteDate(option, {
      bound: 'start',
    })

    if (dateTime && dateTime.startOf('day') < targetDate.startOf('day')) {
      return option
    }
  }

  // If no valid option found, return the first option
  return StartRelativeDateOption[0]
}
