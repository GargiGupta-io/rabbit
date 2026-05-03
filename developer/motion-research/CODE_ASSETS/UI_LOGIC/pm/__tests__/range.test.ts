import { DateTime } from 'luxon'

import { STALE_TASK_CUTOFF } from '../constants'
import { getCurrentRangeStart } from '../range'

describe('getCurrentRangeStart', () => {
  it('should return the correct start date', () => {
    const now = DateTime.fromISO('2023-11-20')
    const expectedStart = now.minus({ days: STALE_TASK_CUTOFF })

    expect(getCurrentRangeStart(now).equals(expectedStart)).toBe(true)
  })
})
