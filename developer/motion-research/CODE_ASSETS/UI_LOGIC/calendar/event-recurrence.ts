import { parseDate, shiftDateToZone } from '@motion/utils/dates'

import { DateTime } from 'luxon'
import { Frequency, RRule, type Weekday } from 'rrule'

import { type daysOptions } from './days'

const weekNameStrings = ['1st', '1st', '2nd', '3rd', '4th', 'last'] // 0th item is a placeholder

type Day = (typeof daysOptions)[number]['value']
export type DayChoice = `${Day}` | `+${number}${Day}` | `-${number}${Day}`

export type CustomRecurrenceForm = {
  interval: number
  freq: keyof typeof Frequency
  dayChoices: DayChoice[]
  monthChoice: 'day' | 'nth'
  endsChoice: 'after' | 'on' | 'never'
  endsOn: string
  endsAfter: number
  weekNum: number
  weekNameStr: string
}

// extract the day from the day choice
export function getDayFromChoice(choice: DayChoice): Day {
  return choice.slice(-2) as Day
}

export function parseInitialCustomRecurrenceValue(
  refDate: string,
  initialRecurrenceString: string
): CustomRecurrenceForm {
  const defaultForm = getDefaultCustomRecurrenceFormValues(refDate)

  if (!initialRecurrenceString) return defaultForm

  const parsedRule = RRule.parseString(initialRecurrenceString)

  const { endsAfter, endsOn } = getDefaultRuleEndForFrequency(
    typeof parsedRule.freq === 'number' ? parsedRule.freq : Frequency.WEEKLY,
    refDate
  )
  defaultForm.endsAfter = endsAfter
  defaultForm.endsOn = endsOn

  if (parsedRule.interval) {
    defaultForm.interval = parsedRule.interval
  }
  if (typeof parsedRule.freq === 'number') {
    defaultForm.freq = RRule.FREQUENCIES[parsedRule.freq]
  }
  if (Array.isArray(parsedRule.byweekday)) {
    defaultForm.dayChoices = parsedRule.byweekday.map(
      (x) => x.toString() as DayChoice
    )
  }
  if (!parsedRule.bymonthday) {
    defaultForm.monthChoice = 'nth'
  }
  if (parsedRule.count) {
    defaultForm.endsChoice = 'after'
  } else if (parsedRule.until) {
    defaultForm.endsChoice = 'on'
  }
  if (parsedRule.until) {
    defaultForm.endsOn = parsedRule.until.toISOString().slice(0, 10)
  }
  if (parsedRule.count) {
    defaultForm.endsAfter = parsedRule.count
  }

  return defaultForm
}

export function getDefaultCustomRecurrenceFormValues(
  refDate: string
): CustomRecurrenceForm {
  let weekNo = 1
  const startDate = parseDate(refDate)
  let tmpDate = parseDate(refDate)
  for (let i = 0; i < 5; i++) {
    tmpDate = tmpDate.minus({ days: 7 })
    if (tmpDate.month === startDate.month) {
      weekNo += 1
    } else {
      break
    }
  }

  const dayChoices = [
    startDate.toFormat('EEE').slice(0, 2).toUpperCase() as DayChoice,
  ]
  return {
    interval: 1,
    freq: 'WEEKLY',
    dayChoices,
    monthChoice: 'day',
    endsChoice: 'never',
    endsOn: DateTime.now().plus({ weeks: 13 }).toISODate(),
    endsAfter: 13,
    weekNum: weekNo === 5 ? -1 : weekNo,
    weekNameStr: weekNameStrings[weekNo] ?? 'first',
  }
}

export function recurrenceFormToRecurrenceString(
  refDate: string,
  form: CustomRecurrenceForm
) {
  const ruleObj: {
    freq: Frequency
    interval: number
    byweekday?: Weekday | Weekday[]
    bymonthday?: number
    bymonth?: number
    count?: number
    until?: Date
  } = {
    freq: RRule[form.freq],
    interval: form.interval,
  }

  if (form.freq === 'WEEKLY') {
    ruleObj.byweekday = form.dayChoices.map(
      (day) => RRule[getDayFromChoice(day)]
    )
  } else if (form.freq === 'MONTHLY') {
    if (form.monthChoice === 'day') {
      ruleObj.bymonthday = parseInt(parseDate(refDate).toFormat('dd'))
    } else {
      const key = parseDate(refDate)
        .toFormat('EEE')
        .slice(0, 2)
        .toUpperCase() as DayChoice

      ruleObj.byweekday = RRule[getDayFromChoice(key)].nth(form.weekNum)
    }
  }
  if (form.endsChoice === 'after') {
    ruleObj.count = form.endsAfter
  } else if (form.endsChoice === 'on') {
    ruleObj.until = shiftDateToZone(
      parseDate(form.endsOn).toISO(),
      'utc'
    ).toJSDate()
  }

  return new RRule(ruleObj).toString()
}

export function getDefaultCustomRecurrenceString(refDate: string) {
  const defaultForm = getDefaultCustomRecurrenceFormValues(refDate)

  return recurrenceFormToRecurrenceString(refDate, defaultForm)
}

export function getDefaultRuleEndForFrequency(
  freq: Frequency,
  refDate: string
) {
  if (freq === Frequency.DAILY) {
    return {
      endsAfter: 30,
      endsOn: parseDate(refDate).plus({ days: 30 }).toISODate(),
    }
  }

  if (freq === Frequency.WEEKLY) {
    return {
      endsAfter: 13,
      endsOn: parseDate(refDate).plus({ weeks: 13 }).toISODate(),
    }
  }

  if (freq === Frequency.MONTHLY) {
    return {
      endsAfter: 12,
      endsOn: parseDate(refDate).plus({ months: 12 }).toISODate(),
    }
  }

  // Yearly
  return {
    endsAfter: 5,
    endsOn: parseDate(refDate).plus({ years: 5 }).toISODate(),
  }
}
