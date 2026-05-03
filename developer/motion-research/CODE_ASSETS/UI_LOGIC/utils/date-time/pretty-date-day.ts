import { type DateLike, parseDate } from '@motion/utils/dates'
import { formatToReadableWeekDayMonth } from '@motion/utils/dates'

import { DateTime } from 'luxon'

type Options = {
  lowercase: boolean
  fallback: (date: DateTime) => string
}

const defaultOptions: Options = {
  lowercase: false,
  fallback: formatToReadableWeekDayMonth,
}

function maybeLowercase(str: string, lowercase: boolean) {
  return lowercase ? str.toLocaleLowerCase() : str
}

export function prettyDateDay(date: DateLike, options: Partial<Options> = {}) {
  const { lowercase, fallback } = { ...defaultOptions, ...options }

  const parsedDate = parseDate(date)
  const today = DateTime.now()

  if (parsedDate.hasSame(today, 'day')) {
    return maybeLowercase('Today', lowercase)
  }

  if (parsedDate.hasSame(today.plus({ days: 1 }), 'day')) {
    return maybeLowercase('Tomorrow', lowercase)
  }

  return fallback(parsedDate)
}
