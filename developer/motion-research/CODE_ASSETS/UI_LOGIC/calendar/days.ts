import { type CalendarStartDay } from './calendar'

export const daysOptions = [
  { label: 'S', value: 'SU', fullLabel: 'Sunday' },
  { label: 'M', value: 'MO', fullLabel: 'Monday' },
  { label: 'T', value: 'TU', fullLabel: 'Tuesday' },
  { label: 'W', value: 'WE', fullLabel: 'Wednesday' },
  { label: 'T', value: 'TH', fullLabel: 'Thursday' },
  { label: 'F', value: 'FR', fullLabel: 'Friday' },
  { label: 'S', value: 'SA', fullLabel: 'Saturday' },
] as const
export const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR']

export function getVisualDaysOptions(calendarStartDay: CalendarStartDay) {
  if (calendarStartDay === 'sunday') return daysOptions

  const [sunday, ...rest] = daysOptions
  return [...rest, sunday]
}
