import { DateTime } from 'luxon'
import { RRule, rrulestr, type Weekday } from 'rrule'

export function recurrenceRuleToText(recurrence: string) {
  if (!recurrence) {
    return ''
  }

  if (recurrence === 'Custom') {
    return recurrence
  }

  // Since the goal is just to display a text here, and the rrule library doesn't seem to support the exdate format from iOS
  // exdate is excluded here
  const { rrule } = splitRecurrenceProperties(recurrence)
  const normalizedRrule = normalizeRRule(rrule)

  return normalizedRrule
    .replace('every day', 'daily')
    .replace('every week ', 'weekly ')
    .replace('every month', 'monthly')
    .replace('every year', 'yearly')
    .replace(
      /every (January|February|March|April|May|June|July|August|September|October|November|December) on the (\d{1,2})/,
      'Yearly on $1 $2'
    )
    .replace(/^[a-z]/, (char) => char.toUpperCase())
}
/**
 * Recurrence rules might not be identical strings but have the same recurrence behaviour
 * For example when a 2 recurrence rules for every weekday that have their days listed in a different order:
 * RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR should still match RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE
 * So we normalize the recurrence rule via the `toText()` method to compare them
 */
export function normalizeRRule(rruleString: string) {
  const rule = rrulestr(rruleString)
  return rule.toText()
}

/**
 * If a user on iOS removes one instance in a recurrence set, an EXDATE rule is added.
 * Our backend already handles this correctly, but the rrule library in the frontend doesn't seem to support the EXDATE format from iOS.
 * So we split the recurrence into rrule and exdate properties in order to only use the rrule property for display purposes.
 * DTSTART is kept with the rrule if it exists, since this doesn't cause any issues with the rrule library.
 */
export function splitRecurrenceProperties(recurrence: string): {
  rrule: string
  exdate: string
} {
  if (!recurrence.includes('EXDATE')) {
    return {
      rrule: recurrence,
      exdate: '',
    }
  }

  const lines = recurrence.split('\n').filter((line) => line.trim())
  const exdateLines = lines.filter((line) => line.includes('EXDATE'))
  const nonExdateLines = lines.filter((line) => !line.includes('EXDATE'))

  return {
    rrule: nonExdateLines.join('\n'),
    exdate: exdateLines.join('\n'),
  }
}

/**
 * Needed to merge the exdate and rrule properties back together for backend processing.
 * Otherwise exdates are lost.
 */
export function mergeRecurrenceProperties(
  rrule: string,
  exdate: string
): string {
  if (!exdate) {
    return rrule
  }

  return `${exdate}\n${rrule}`
}

const weekdayMap: Record<number, Weekday> = {
  1: RRule.MO,
  2: RRule.TU,
  3: RRule.WE,
  4: RRule.TH,
  5: RRule.FR,
  6: RRule.SA,
  7: RRule.SU,
}

const dailyRule = new RRule({ freq: RRule.DAILY })
const weekdaysRule = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
})

export function getRecurrenceRulesForDate(isoDateString: string) {
  const recurringRules: RRule[] = [dailyRule]

  const date = DateTime.fromISO(isoDateString)

  const weekday = weekdayMap[date.weekday]

  const weeklyRule = new RRule({ freq: RRule.WEEKLY, byweekday: weekday })
  recurringRules.push(weeklyRule)

  const weekOfDate = Math.ceil(date.day / 7)

  if (weekOfDate < 5) {
    const nthWeekdayRule = new RRule({
      freq: RRule.MONTHLY,
      byweekday: weekday.nth(weekOfDate),
    })
    recurringRules.push(nthWeekdayRule)
  }

  const isLastInstanceOfWeekday = date.plus({ days: 7 }).month !== date.month

  if (isLastInstanceOfWeekday) {
    const lastWeekdayRule = new RRule({
      freq: RRule.MONTHLY,
      byweekday: weekday.nth(-1),
    })
    recurringRules.push(lastWeekdayRule)
  }

  if (weekday !== RRule.SA && weekday !== RRule.SU) {
    recurringRules.push(weekdaysRule)
  }

  const yearlyRule = new RRule({
    freq: RRule.YEARLY,
  })
  recurringRules.push(yearlyRule)

  return recurringRules
}
