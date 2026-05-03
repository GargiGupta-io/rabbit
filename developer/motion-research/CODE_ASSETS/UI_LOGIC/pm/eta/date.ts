import { type DateLike, safeParseDate } from '@motion/utils/dates'

import { DateTime } from 'luxon'

export type ETADateOptions = 'projectedDate' | 'projectedEoW' | 'projectedEoM'
export type ETADateReturn = Record<ETADateOptions, DateTime>

// If the date is a friday, return the following friday
function getUpcomingFriday(date: DateTime): DateTime {
  if (date.weekday === 5) {
    return date.plus({ week: 1 })
  } else if (date.weekday < 5) {
    return date.set({ weekday: 5 })
  }

  // If the date is a Saturday or Sunday, return the following Friday
  return date.minus({ days: date.weekday - 5 }).plus({ week: 1 })
}

// If not on last week of month, return last friday of the month
// Otherwise, return the last weekday of the next month
function getLastOfMonth(date: DateTime): DateTime {
  const endOfMonth = date.endOf('month')

  // Find the last Friday of the current month
  let lastFriday = endOfMonth
  while (lastFriday.weekday !== 5) {
    lastFriday = lastFriday.minus({ days: 1 })
  }

  // Check if the date is already in the last week of the month
  const lastWeekStart = endOfMonth.minus({ days: 6 })
  if (date >= lastWeekStart) {
    // Move to the next month
    const startOfNextMonth = date.plus({ months: 1 }).startOf('month')
    const endOfNextMonth = startOfNextMonth.endOf('month')

    // Find the last weekday of the next month
    let lastWeekday = endOfNextMonth
    while (lastWeekday.weekday === 6 || lastWeekday.weekday === 7) {
      // 6=Saturday, 7=Sunday
      lastWeekday = lastWeekday.minus({ days: 1 })
    }
    return lastWeekday
  }

  return lastFriday
}

/*
 * Given a date, return the 3 options for the ETA popover
 * (, EOW for scheduled date, and last friday for due date)
 * (If the date is in the last week of the month, the EOM option should be the end of the next month)
 */
export const getEtaDateOptions = (date: DateLike | null): ETADateReturn => {
  const projectedDate = safeParseDate(date) ?? DateTime.now()
  const eowDate = getUpcomingFriday(projectedDate).endOf('day')

  return {
    projectedDate: projectedDate,
    projectedEoW: eowDate,
    // Pass in EoW because we never want the EoM to be the same as EoW
    projectedEoM: getLastOfMonth(eowDate).endOf('day'),
  }
}
