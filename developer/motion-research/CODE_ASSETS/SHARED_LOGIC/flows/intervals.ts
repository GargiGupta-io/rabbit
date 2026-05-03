import { Duration } from 'luxon'

import { RelativeIntervalUnit } from './definitions'

export type DeadlineInterval = {
  unit: 'DAYS' | 'BUSINESS_DAYS' | 'WEEKS' | 'MONTHS'
  value: number
}

export const DEFAULT_INTERVAL: DeadlineInterval = {
  unit: 'WEEKS',
  value: 1,
}

export const EXPECTED_DURATION_UNIT_DROPDOWN_ITEMS = [
  { id: 'DAYS', label: 'days' },
  { id: 'BUSINESS_DAYS', label: 'weekdays' },
  { id: 'WEEKS', label: 'weeks' },
  { id: 'MONTHS', label: 'months' },
] as const satisfies { id: RelativeIntervalUnit; label: string }[]

// stages do not allow business days
export const EXPECTED_STAGE_DURATION_UNIT_DROPDOWN_ITEMS = [
  { id: 'DAYS', label: 'days' },
  { id: 'WEEKS', label: 'weeks' },
  { id: 'MONTHS', label: 'months' },
] as const satisfies { id: RelativeIntervalUnit; label: string }[]

export function convertDaysToDeadlineInterval(
  deadlineIntervalDays: number
): DeadlineInterval {
  if (deadlineIntervalDays === 0) {
    return {
      unit: 'DAYS',
      value: 0,
    }
  }

  if (deadlineIntervalDays % 30 === 0) {
    return {
      unit: 'MONTHS',
      value: Math.abs(deadlineIntervalDays / 30),
    }
  }

  if (deadlineIntervalDays % 7 === 0) {
    return {
      unit: 'WEEKS',
      value: Math.abs(deadlineIntervalDays / 7),
    }
  }

  return {
    unit: 'DAYS',
    value: Math.abs(deadlineIntervalDays),
  }
}

export function convertDateIntervalToDays(
  dateInterval: Pick<DeadlineInterval, 'unit' | 'value'>
): number {
  switch (dateInterval.unit) {
    case 'DAYS':
      return Math.abs(dateInterval.value)
    case 'BUSINESS_DAYS':
      const isGreaterThan5 = Math.abs(dateInterval.value) >= 5
      const weeksToOffset = Math.floor(Math.abs(dateInterval.value) / 5)
      return isGreaterThan5
        ? Math.abs(dateInterval.value) + 2 * weeksToOffset
        : Math.abs(dateInterval.value)
    case 'WEEKS':
      return Math.abs(dateInterval.value * 7)
    case 'MONTHS':
      return Math.abs(dateInterval.value * 30)
  }
}

export function convertDateIntervalToDuration(
  dateInterval: Pick<DeadlineInterval, 'unit' | 'value'>
): Duration {
  switch (dateInterval.unit) {
    case 'DAYS':
      return Duration.fromObject({ days: dateInterval.value })
    case 'BUSINESS_DAYS':
      const isGreaterThan5 = Math.abs(dateInterval.value) >= 5
      const weeksToOffset = Math.floor(Math.abs(dateInterval.value) / 5)
      return isGreaterThan5
        ? Duration.fromObject({
            weeks: Math.abs(dateInterval.value) + 2 * weeksToOffset,
          })
        : Duration.fromObject({ days: Math.abs(dateInterval.value) })
    case 'WEEKS':
      return Duration.fromObject({ weeks: dateInterval.value })
    case 'MONTHS':
      return Duration.fromObject({ months: dateInterval.value })
  }
}
