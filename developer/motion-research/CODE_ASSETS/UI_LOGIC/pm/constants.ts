// Important: make sure to sync with other cloud functions

/**
 * The number of days before/after today that the calendar sync session includes
 */
export const SYNC_SESSION_DAYS_SPAN = {
  before: 14,
  after: 31,
}

export const STALE_TASK_CUTOFF = 14
