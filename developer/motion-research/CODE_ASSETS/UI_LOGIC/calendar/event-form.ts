import { type Calendar, type EmailAccount } from '@motion/rpc-types/legacy'
import {
  isSameDay,
  parseDate,
  roundTime,
  shiftDateToZone,
} from '@motion/utils/dates'
import {
  type CalendarEventSchemaV2,
  type CalendarSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { getAllDayEventISODates } from './events/helpers'

// @deprecated - use EventFormFields
export type SharedEventFormFields = Pick<
  CalendarEventSchemaV2,
  'start' | 'end' | 'status' | 'isAllDay'
>

export function handleIsAllDayChange(
  newValue: boolean,
  { start, end }: Pick<SharedEventFormFields, 'start' | 'end'>
): Pick<SharedEventFormFields, 'start' | 'end' | 'status' | 'isAllDay'> {
  if (newValue) {
    const { start: startDate, end: endDate } = getAllDayEventISODates(
      start,
      end
    )

    return {
      start: startDate,
      end: endDate,
      status: 'FREE',
      isAllDay: true,
    }
  }

  const shiftedStart = shiftDateToZone(start)

  const startWithCurrentTime = DateTime.now().set({
    year: shiftedStart.year,
    month: shiftedStart.month,
    day: shiftedStart.day,
  })

  const newStartDate = roundTime(startWithCurrentTime, 15)
  const newEndDay = shiftDateToZone(end).minus({ days: 1 })
  const newEndDate = isSameDay(newStartDate, newEndDay)
    ? newStartDate.plus({ minutes: 30 })
    : newEndDay.set({
        hour: newStartDate.hour,
        minute: newStartDate.minute,
        second: newStartDate.second,
      })

  return {
    start: newStartDate.toISO(),
    end: newEndDate.toISO(),
    status: 'BUSY',
    isAllDay: false,
  }
}

export function handleStartTimeChange(
  newValue: DateTime,
  { start, end }: Pick<SharedEventFormFields, 'start' | 'end'>
): Pick<SharedEventFormFields, 'start' | 'end'> {
  const startDateTime = parseDate(start)
  const endDateTime = parseDate(end)
  const duration = startDateTime.until(endDateTime).toDuration()

  const newEndDateTime = newValue.plus(duration)

  return {
    start: newValue.toISO(),
    end: newEndDateTime.toUTC().toISO(),
  }
}

export function handleEndTimeChange(
  newValue: DateTime,
  { start, end }: Pick<SharedEventFormFields, 'start' | 'end'>
): Pick<SharedEventFormFields, 'start' | 'end'> {
  const startDateTime = parseDate(start)
  const endDateTime = parseDate(end)

  // If new end time is before start time, adjust start time backwards
  if (newValue < startDateTime) {
    const duration = startDateTime.until(endDateTime).toDuration()
    const newStartDateTime = newValue.minus(duration)
    return {
      start: newStartDateTime.toUTC().toISO(),
      end: newValue.toISO(),
    }
  }

  // Otherwise just update the end time
  return {
    start: start,
    end: newValue.toISO(),
  }
}

function updateDateOnly(dateTime: DateTime, newDate: DateTime): DateTime {
  return dateTime.set({
    year: newDate.year,
    month: newDate.month,
    day: newDate.day,
  })
}

export function handleStartDateChange(
  newValue: DateTime,
  {
    start,
    end,
    isAllDay,
  }: Pick<SharedEventFormFields, 'start' | 'end' | 'isAllDay'>
): Pick<SharedEventFormFields, 'start' | 'end'> {
  const startDateTime = parseDate(start)
  const endDateTime = parseDate(end)
  const duration = startDateTime.until(endDateTime).toDuration()

  const newStartDateTime = isAllDay
    ? newValue
    : updateDateOnly(startDateTime, newValue)

  const newEndDateTime = newStartDateTime.plus(duration)

  return {
    start: isAllDay
      ? newStartDateTime.toISODate()
      : newStartDateTime.toUTC().toISO(),
    end: isAllDay ? newEndDateTime.toISODate() : newEndDateTime.toUTC().toISO(),
  }
}

export function handleEndDateChange(
  newValue: DateTime,
  {
    start,
    end,
    isAllDay,
  }: Pick<SharedEventFormFields, 'start' | 'end' | 'isAllDay'>
): Pick<SharedEventFormFields, 'start' | 'end'> {
  const startDateTime = parseDate(start)
  const endDateTime = parseDate(end)
  const duration = startDateTime.until(endDateTime).toDuration()

  const newEndDateTime = isAllDay
    ? newValue.plus({ days: 1 })
    : updateDateOnly(endDateTime, newValue)

  const newStartDateTime = newEndDateTime.minus(duration)

  return {
    start:
      newEndDateTime > startDateTime
        ? isAllDay
          ? startDateTime.toISODate()
          : startDateTime.toUTC().toISO()
        : isAllDay
          ? newStartDateTime.toISODate()
          : newStartDateTime.toUTC().toISO(),
    end: isAllDay ? newEndDateTime.toISODate() : newEndDateTime.toUTC().toISO(),
  }
}

export function getEndDateTime({
  end,
  isAllDay,
}: Pick<SharedEventFormFields, 'end' | 'isAllDay'>) {
  return isAllDay ? parseDate(end).minus({ days: 1 }) : parseDate(end)
}

export function getAccountOptions<T extends Calendar | CalendarSchema>(
  editableCalendars: T[],
  emailAccountsMap: Map<string, Pick<EmailAccount, 'email'>>,
  resolveCalendarId = (c: Pick<Calendar, 'id' | 'providerId'>): string => c.id
) {
  return editableCalendars
    .map((item) => {
      const email = emailAccountsMap.get(item.emailAccountId)?.email
      if (!email) return
      return {
        ...item,
        email,
        calendarId: resolveCalendarId(item),
      }
    })
    .filter(Boolean)
}
