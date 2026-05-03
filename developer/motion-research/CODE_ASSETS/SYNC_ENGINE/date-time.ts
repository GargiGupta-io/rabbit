import { DateTime } from 'luxon'
import z from 'zod/v4'

export const IsoDateTimeSchema = z
  .union([z.date(), z.string()])
  .transform((value) => {
    if (typeof value === 'string') {
      return DateTime.fromISO(value).toISO()
    }
    return DateTime.fromJSDate(value).toISO()
  })
  .pipe(z.string())
  .meta({ type: 'string', format: 'date-time' })

export const IsoDateSchema = z
  .union([z.date(), z.string()])
  .transform((value) => {
    if (typeof value === 'string') {
      return DateTime.fromISO(value).toISODate()
    }
    return DateTime.fromJSDate(value).toISODate()
  })
  .pipe(z.string())
  .meta({ type: 'string', format: 'date' })

// String-only version for push events (no Date objects allowed)
export const StringIsoDateSchema = z
  .string()
  .transform((value) => DateTime.fromISO(value).toISODate())
  .pipe(z.string())
  .meta({ type: 'string', format: 'date' })

const transformToJsDate = (value: string) => {
  return DateTime.fromISO(
    DateTime.fromISO(value, { setZone: true }).toISODate(),
    {
      zone: 'utc',
    }
  ).toJSDate()
}

export const StringOrDateToDateSchema = z.pipe(
  z.union([z.string(), z.date()]),
  z.transform((value) => {
    if (value instanceof Date) return value
    return DateTime.fromISO(value).toJSDate()
  })
)

export const StrictDateOnlySchema = z.string().transform(transformToJsDate)

const makeDateOnlyStart = (value: string) => {
  if (value?.length === 8) {
    return DateTime.fromFormat(value, 'MM/dd/yy', { zone: 'utc' })
      .startOf('day')
      .toJSDate()
  }

  return value ? transformToJsDate(value) : undefined
}

export const StartOfDayDateOnlySchema = z.string().transform(makeDateOnlyStart)
