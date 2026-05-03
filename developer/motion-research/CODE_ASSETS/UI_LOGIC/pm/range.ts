import { type DateTime } from 'luxon'

import { STALE_TASK_CUTOFF } from './constants'

/**
 * Gets the starting of the current scheduling range; tasks before
 * this are counted as stale and ignored by update function unless
 * specifically set for `needsReschedule`
 *
 * Keep in sync with STALE_TASK_CUTOFF in `@motion/backend`
 */
export const getCurrentRangeStart = (now: DateTime) => {
  return now.minus({ days: STALE_TASK_CUTOFF })
}
