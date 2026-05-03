import { DateTime, Duration } from 'luxon'
import { z } from 'zod/v4'

export const StringDateSchema = z
  .string()
  .transform((value) => DateTime.fromISO(value).toJSDate())

export const ISODurationSchema = z.string().superRefine((value, ctx) => {
  try {
    Duration.fromISO(value)
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'duration must be a valid ISO 8601 Duration',
    })
  }
})

export const ProcessedDateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string') return new Date(arg)
  return arg
}, z.date())

/**
 * Parse a RFC 5321 header and extract the RFC 2822 date.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5321#section-4.1.2
 * @see https://datatracker.ietf.org/doc/html/rfc5321#section-4.4
 * @see https://datatracker.ietf.org/doc/html/rfc2822#section-3.3
 * @param header
 * @returns
 */
export function getDateFromEmailReceivedHeader(header?: string): Date | null {
  if (!header) return null
  const i = header.lastIndexOf(';')
  let s = (i >= 0 ? header.slice(i + 1) : header)
    .replace(/\([^()]*\)/g, ' ') // drop comments like "(PDT)"
    .replace(/\s+/g, ' ')
    .trim()

  try {
    const dt = DateTime.fromRFC2822(s, { setZone: true })
    return dt.isValid ? dt.toJSDate() : null
  } catch {
    return null
  }
}
