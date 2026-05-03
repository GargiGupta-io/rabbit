import {
  type Frequency,
  type Options,
  RRule,
  type Weekday,
  type WeekdayStr,
} from 'rrule'

import { type FixedPatternType, type MSRecurrence } from './types'

const INDEX_TO_NUMBER = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  last: -1,
} // satisfies Record<MSRecurrenceIndex, number>

function weekday(value: string): Weekday {
  const weekdayString = value.slice(0, 2).toUpperCase() as WeekdayStr
  return RRule[weekdayString]
}
function frequency(value: FixedPatternType): Frequency {
  const key = value.toUpperCase() as keyof typeof Frequency
  return RRule[key]
}

export const msRecurrenceToRRule = (msRecurrence: MSRecurrence) => {
  if (!msRecurrence || !msRecurrence.pattern || !msRecurrence.range) {
    return ''
  }
  const rruleObj: Partial<Options> = {}
  // handle ms pattern conversion
  if (msRecurrence.pattern.type === 'absoluteMonthly') {
    rruleObj.bymonthday = msRecurrence.pattern.dayOfMonth
    rruleObj.freq = RRule.MONTHLY
  } else if (msRecurrence.pattern.type === 'relativeMonthly') {
    const offset = INDEX_TO_NUMBER[msRecurrence.pattern.index]

    rruleObj.byweekday = msRecurrence.pattern.daysOfWeek.map((day) =>
      weekday(day).nth(offset)
    )
    rruleObj.freq = RRule.MONTHLY
  } else {
    rruleObj.freq = frequency(msRecurrence.pattern.type)
  }

  if (msRecurrence.pattern.interval) {
    rruleObj.interval = msRecurrence.pattern.interval
  }

  if (msRecurrence.pattern.firstDayOfWeek) {
    rruleObj.wkst = weekday(msRecurrence.pattern.firstDayOfWeek)
  }

  if (msRecurrence.pattern.daysOfWeek && !rruleObj.byweekday) {
    rruleObj.byweekday = msRecurrence.pattern.daysOfWeek.map((day: string) =>
      weekday(day)
    )
  }

  // handle ms range conversion
  if (msRecurrence.range.type === 'numbered') {
    rruleObj.count = msRecurrence.range.numberOfOccurrences
  } else if (msRecurrence.range.type === 'endDate') {
    rruleObj.until = new Date(msRecurrence.range.endDate)
  }
  if (msRecurrence.range.startDate) {
    rruleObj.dtstart = new Date(msRecurrence.range.startDate)
  }

  return new RRule(rruleObj).toString()
}
