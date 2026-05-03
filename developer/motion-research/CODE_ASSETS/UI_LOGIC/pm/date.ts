import { byValue, Compare } from '@motion/utils/array'

import { type DateTime } from 'luxon'
import { type ReactNode } from 'react'

export type QuickAction = {
  label: string | ReactNode
  value: DateTime
}

export function getQuickActionsForStartDate(
  startOfDay: DateTime,
  additionalQuickActions: QuickAction[] = []
) {
  const today = { label: 'Today', value: startOfDay }
  const tomorrow = { label: 'Tomorrow', value: today.value.plus({ days: 1 }) }
  const nextWeek = {
    label: 'Next week',
    value: today.value.startOf('week').plus({ weeks: 1 }),
  }
  const next2Weeks = {
    label: 'In 2 weeks',
    value: nextWeek.value.plus({ weeks: 1 }),
  }
  const nextMonth = {
    label: 'Next month',
    value: today.value.startOf('month').plus({ months: 1 }),
  }

  return [
    today,
    tomorrow,
    nextWeek,
    next2Weeks,
    nextMonth,
    ...additionalQuickActions,
  ].sort(byValue((x) => Number(x.value), Compare.numeric))
}

export function getQuickActionsForDeadline(
  startOfDay: DateTime,
  additionalQuickActions: QuickAction[] = []
) {
  const today = { label: 'Today', value: startOfDay }
  const tomorrow = { label: 'Tomorrow', value: today.value.plus({ days: 1 }) }
  const thisWeek = {
    label: 'This week',
    value: today.value.startOf('week').plus({ days: 4 }),
  }
  const sevenDaysFromNow = {
    label: '7 days from now',
    value: startOfDay.plus({ days: 7 }),
  }

  const nextWeek = {
    label: 'Next week',
    value: thisWeek.value.plus({ weeks: 1 }),
  }
  const next2Weeks = {
    label: 'In 2 weeks',
    value: nextWeek.value.plus({ weeks: 1 }),
  }
  const thisMonth = {
    label: 'This month',
    value: today.value.endOf('month'),
  }
  const nextMonth = {
    label: 'Next month',
    value: today.value.startOf('month').plus({ months: 1 }).endOf('month'),
  }

  return [
    today,
    tomorrow,
    thisWeek,
    sevenDaysFromNow,
    nextWeek,
    next2Weeks,
    thisMonth,
    nextMonth,
    ...additionalQuickActions,
  ]
    .filter((entry) => entry.value >= startOfDay)
    .sort(byValue((x) => Number(x.value), Compare.numeric))
}

export function getQuickActionsForDoLater(startTime: DateTime) {
  const in1Hour = { label: 'In 1 hour', value: startTime.plus({ hour: 1 }) }
  const in2Hours = { label: 'In 2 hours', value: startTime.plus({ hour: 2 }) }
  const thisAfternoon = {
    label: 'This afternoon (3pm)',
    value: startTime.startOf('day').set({ hour: 15 }),
  }
  const thisEvening = {
    label: 'This evening (7pm)',
    value: startTime.startOf('day').set({ hour: 19 }),
  }
  const tomorrow = {
    label: 'Tomorrow',
    value: startTime.startOf('day').plus({ days: 1 }).set({ hour: 8 }),
  }
  const nextWeekTime = startTime
    .startOf('week')
    .plus({ days: 7 })
    .set({ hour: 8 })
  const nextWeek = {
    label: `Next week (Mon ${nextWeekTime.toFormat('MMM d')})`,
    value: nextWeekTime,
  }

  return [
    in1Hour,
    in2Hours,
    thisAfternoon,
    thisEvening,
    tomorrow,
    nextWeek,
  ].filter((entry) => entry.value >= startTime)
}

export function calculateNextFridayDueDate() {
  const today = new Date()
  const dayOfWeek = today.getDay()

  if (dayOfWeek === 0) {
    // Today is Sunday, return the Friday 5 days after
    today.setDate(today.getDate() + 5)
  } else if (dayOfWeek >= 1 && dayOfWeek <= 3) {
    // Today is Mon-Wed, return this Friday
    const daysUntilFriday = 5 - dayOfWeek
    today.setDate(today.getDate() + daysUntilFriday)
  } else {
    // Return next Friday
    const daysUntilNextFriday = 5 + (7 - dayOfWeek)
    today.setDate(today.getDate() + daysUntilNextFriday)
  }

  return today.toISOString()
}

export function getPercentageTimeChange({
  startDate,
  currentDueDate,
  newDueDate,
  rounded = true,
}: {
  startDate: DateTime | null
  currentDueDate: DateTime | null
  newDueDate: DateTime | null
  rounded?: boolean
}) {
  if (startDate == null || currentDueDate == null || newDueDate == null) {
    return 0
  }

  const originalNumDays = currentDueDate.diff(startDate, 'days').days
  if (originalNumDays <= 0) {
    return 0
  }

  const newNumDays = newDueDate.diff(startDate, 'days').days
  const changeInDays = newNumDays - originalNumDays
  const percentage = (changeInDays / originalNumDays) * 100
  return rounded ? Math.round(percentage) : percentage
}
