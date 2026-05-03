import { type DateLike, parseDate } from '@motion/utils/dates'

export const calculateDurationInMinutes = (start: DateLike, end: DateLike) => {
  try {
    const startDate = parseDate(start)
    const endDate = parseDate(end)
    return Math.round(endDate.diff(startDate, 'minutes').minutes)
  } catch (err) {
    return null
  }
}
