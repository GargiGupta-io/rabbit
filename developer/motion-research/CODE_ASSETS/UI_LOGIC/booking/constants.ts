/**
 * Gives the granularity that slots are rounded to based on the meeting link's
 * duration
 */
export const durationToSlotGranularity: Record<number, number> = {
  10: 15,
  15: 15,
  20: 20,
  25: 15,
  30: 15,
  45: 15,
  50: 15,
  60: 15,
  90: 30,
  120: 30,
}

/**
 * Maximum number of days shown in a booking message
 */
export const MAX_MESSAGE_DAYS = 3

/**
 * Maximum number of ranges per day within a booking message
 */
export const MAX_RANGES_PER_DAY = 2

/**
 * The default availability message template for generated messages
 */
export const DEFAULT_AVAILABILITY_MESSAGE_TEMPLATE =
  "Would any of these time windows work for a $Duration$ meeting ($Timezone$)?\n$Meeting times$\nFeel free to use this booking page if that's easier (also contains more availabilities):\n$Booking link$"
