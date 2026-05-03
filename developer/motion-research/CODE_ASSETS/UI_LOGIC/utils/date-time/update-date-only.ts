import { type DateTime } from 'luxon'

/**
 * Note: this conversion is intended to be done client-side and is done with
 * respect to the local timezone.
 */
export function updateDateOnly(
  dateTime: DateTime,
  newDate: DateTime
): DateTime {
  return dateTime.set({
    year: newDate.year,
    month: newDate.month,
    day: newDate.day,
  })
}
