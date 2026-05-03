import { DateLike, DateRange, parseDate } from '@motion/utils/dates'

import { DateTime } from 'luxon'

export const getSyncRange = (now?: DateLike): DateRange => {
  const parsed = parseDate(now ?? DateTime.now())

  return {
    // Buffer of 1 day before in case the user moved an event to be earlier than DateTime.now()
    start: parsed.minus({ days: 1 }),
    end: parsed.plus({ days: 10 }),
  }
}

export function isEventInSyncRange(
  event: { start: DateLike; end: DateLike },
  range: DateRange
) {
  const parsedEvent = {
    start: parseDate(event.start),
    end: parseDate(event.end),
  }

  // any event that starts during the sync range
  return (
    parsedEvent.start.valueOf() >= range.start.valueOf() &&
    parsedEvent.start.valueOf() < range.end.valueOf()
  )
}
