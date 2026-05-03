import { DateTime } from 'luxon'

import { DayMode } from './stage-adjuster'

export const getDayModeForProjectDate = (isoValue: string) => {
  const date = DateTime.fromISO(isoValue)
  const isWeekend = date.weekday === 6 || date.weekday === 7
  return isWeekend ? DayMode.CALENDAR : DayMode.BUSINESS
}
