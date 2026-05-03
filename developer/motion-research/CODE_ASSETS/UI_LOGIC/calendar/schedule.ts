import { type DayVerbose, type Schedule } from '@motion/rpc-types'
import {
  type DateLike,
  getWeekOf,
  parseDate,
  parseTime,
} from '@motion/utils/dates'

import { DateTime } from 'luxon'

import { type CalendarStartDay } from './calendar'

type Event = {
  start: string
  end: string
}

interface Options {
  baseDate?: DateLike
  startingDay?: CalendarStartDay
  zone?: string
  dayOfWeekFilter?: DayVerbose[] // dow to include (undefined means all)
}

const weekdayToDayVerbose = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as DayVerbose[]

export const convertScheduleIntoEvents = (
  schedule: Schedule['schedule'],
  opts: Options = {}
) => {
  const {
    baseDate: baseDateLike,
    zone,
    startingDay = 'sunday',
    dayOfWeekFilter,
  } = opts

  const baseDate =
    baseDateLike != null
      ? parseDate(baseDateLike, zone)
      : DateTime.now().setZone(zone)
  const slots: Event[] = []

  const { start: startOfWeek } = getWeekOf(baseDate, { zone, startingDay })

  Object.keys(schedule).map((day) => {
    const dayVerbose = day as DayVerbose
    if (dayOfWeekFilter && !dayOfWeekFilter.includes(dayVerbose)) {
      return
    }

    const ranges = schedule[dayVerbose]
    const weekdayOffset = convertDayVerboseIntoOffset(dayVerbose, startingDay)

    ranges.forEach((rangeObj) => {
      const [start, end] = rangeObj.range.split('-')
      const weekdayDate = startOfWeek.plus({ day: weekdayOffset })
      const startTime = parseTime(start)
      const endTime = parseTime(end)

      const startDateTime = weekdayDate.set({
        hour: startTime.hour,
        minute: startTime.minute,
      })
      let endDateTime = weekdayDate.set({
        hour: endTime.hour,
        minute: endTime.minute,
      })

      if (endDateTime <= startDateTime) {
        // Handle midnight-crossing schedules (e.g., 1pm-2am)
        // If end time is before start time, it means the range crosses midnight
        endDateTime = endDateTime.plus({ days: 1 })
      }

      slots.push({
        start: startDateTime.setZone(zone).toISO(),
        end: endDateTime.setZone(zone).toISO(),
      })
    })
  })

  return slots
}

export type HoursBlock = {
  start: string
  end: string
}

export const convertScheduleIntoEventsByDayOfWeek = (
  schedule: Schedule['schedule'],
  opts: Pick<Options, 'baseDate' | 'startingDay' | 'zone'> = {}
) => {
  const { baseDate: baseDateLike, zone, startingDay = 'sunday' } = opts

  const baseDate =
    baseDateLike != null
      ? parseDate(baseDateLike, zone)
      : DateTime.now().setZone(zone)
  const slotsByDOW: Record<DayVerbose, HoursBlock[] | undefined> = {
    Friday: [],
    Monday: [],
    Saturday: [],
    Sunday: [],
    Thursday: [],
    Tuesday: [],
    Wednesday: [],
  }

  const { start: startOfWeek } = getWeekOf(baseDate, { zone, startingDay })

  Object.keys(schedule).map((day) => {
    const dayVerbose = day as DayVerbose

    const ranges = schedule[dayVerbose]
    const weekdayOffset = convertDayVerboseIntoOffset(dayVerbose, startingDay)

    slotsByDOW[dayVerbose] = ranges.map((rangeObj) => {
      const [start, end] = rangeObj.range.split('-')
      const weekdayDate = startOfWeek.plus({ day: weekdayOffset })
      const startTime = parseTime(start)
      const endTime = parseTime(end)

      const startDateTime = weekdayDate.set({
        hour: startTime.hour,
        minute: startTime.minute,
      })
      let endDateTime = weekdayDate.set({
        hour: endTime.hour,
        minute: endTime.minute,
      })

      if (endDateTime <= startDateTime) {
        // Handle midnight-crossing schedules (e.g., 1pm-2am)
        // If end time is before start time, it means the range crosses midnight
        endDateTime = endDateTime.plus({ days: 1 })
      }

      return {
        start: startDateTime.setZone(zone).toISO(),
        end: endDateTime.setZone(zone).toISO(),
      }
    })
  })

  return slotsByDOW
}

const dayVerboseToWeekDay = weekdayToDayVerbose.reduce(
  (acc, dayVerbose, index) => {
    acc[dayVerbose as DayVerbose] = index
    return acc
  },
  {} as Record<DayVerbose, number>
)

function convertDayVerboseIntoOffset(
  day: DayVerbose,
  startingDay: CalendarStartDay
) {
  const luxonWeekday = dayVerboseToWeekDay[day]

  if (startingDay === 'sunday') {
    return (luxonWeekday + 1) % 7
  }

  return luxonWeekday
}

/**
 * Returns the DayVerbose value by day of week number where:
 * 0 - Monday
 * 1 - Tuesday
 * 2 - Wednesday
 * 3 - Thursday
 * 4 - Friday
 * 5 - Saturday
 * 6 - Sunday
 */
export const getDayOfWeekVerboseByNumber = (dow: number) =>
  weekdayToDayVerbose[dow]

export const getDayOfWeekVerbose = (date: DateTime): DayVerbose =>
  getDayOfWeekVerboseByNumber(date.weekday - 1)
