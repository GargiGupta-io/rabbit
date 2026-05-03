import { DateTime, type Zone } from 'luxon'

/*
 * Get a luxon zone from a timezone string
 * Ex: America/New_York
 *
 * @param {string} timezone - timezone string
 */
export function getZoneFromTimezone(timezone?: string) {
  return DateTime.local({ zone: timezone }).zone
}

/*
 * Format a luxon zone to a string in the format of
 * {shortName} - {longName} (GMT{shortOffset})
 * Ex: EST - Eastern Standard Time (GMT-05:00)
 *
 * @param {Zone} timezone - luxon zone
 */
export function formatTimezoneToString(timezone: Zone) {
  // Ex: EST
  const shortName = timezone.offsetName(0, {
    format: 'short',
  })

  // Ex: Eastern Standard Time
  const longName = timezone.offsetName(0, {
    format: 'long',
  })

  // Ex: -04:00
  const shortOffset = timezone.formatOffset(0, 'short')

  return `${shortName} - ${longName} (GMT${shortOffset})`
}

/*
 * Compare two timezone strings to see if they are equal by checking their offsets
 *
 * @param {string} timezone1 - timezone string
 * @param {string} timezone2 - timezone string
 */
export function areTimezonesOffsetsEqual(
  timezone1?: string,
  timezone2?: string
) {
  if (!timezone1 || !timezone2) {
    return false
  }

  // Get the offsets for the current date
  const timezone1Offset = getZoneFromTimezone(timezone1).offset(0)
  const timezone2Offset = getZoneFromTimezone(timezone2).offset(0)
  // Compare the offsets
  return timezone1Offset === timezone2Offset
}

/*
 * Format the difference between two timezones as a human-readable string
 * Ex: "3 hours ahead of you", "6 hours behind you", "Same timezone as you"
 *
 * @param {string} targetTimezone - The timezone to compare (e.g., guest timezone)
 * @param {string} referenceTimezone - The reference timezone (e.g., current user's timezone)
 * @returns {string | undefined} Formatted difference text, or undefined if either timezone is missing
 */
export function formatTimezoneDifference(
  targetTimezone?: string,
  referenceTimezone?: string
): string | undefined {
  if (!targetTimezone || !referenceTimezone) {
    return undefined
  }

  const referenceZone = getZoneFromTimezone(referenceTimezone)
  const targetZone = getZoneFromTimezone(targetTimezone)

  // Get offsets in minutes (offset returns minutes from UTC)
  const referenceNow = DateTime.now().setZone(referenceZone)
  const referenceOffset = referenceZone.offset(referenceNow.toMillis())
  const targetOffset = targetZone.offset(referenceNow.toMillis())

  // Calculate difference in hours
  const differenceInMinutes = targetOffset - referenceOffset
  const differenceInHours = differenceInMinutes / 60

  if (differenceInHours === 0) {
    return 'Same timezone as you'
  }

  const hours = Math.abs(differenceInHours)
  const direction = differenceInHours > 0 ? 'ahead of' : 'behind'

  // Format hours - show decimal if not a whole number
  const formattedHours = hours % 1 === 0 ? hours.toString() : hours.toFixed(1)

  // Use plural "hours" if not exactly 1 hour
  const hourText = hours === 1 ? 'hour' : 'hours'

  return `${formattedHours} ${hourText} ${direction} you`
}
