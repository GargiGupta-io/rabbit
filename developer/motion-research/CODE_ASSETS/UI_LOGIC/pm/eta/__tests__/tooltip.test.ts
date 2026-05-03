import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  getAheadOfScheduleTooltip,
  getMissedDeadlineTooltip,
  getOnTrackTooltip,
  getScheduledPastDeadlineTooltip,
} from '../tooltip'

const pluralize = (num: number, singular: string, plural: string) => {
  return num === 1 ? singular : plural
}

describe('Tooltip functions', () => {
  beforeAll(() => {
    tk.freeze(DateTime.fromISO('2023-10-01').toJSDate())
  })

  afterAll(() => {
    tk.reset()
  })

  describe('getMissedDeadlineTooltip', () => {
    it('should return correct tooltip for missed deadline', () => {
      const result = getMissedDeadlineTooltip('2023-09-28', null, pluralize)

      expect(result).toEqual({
        title: 'Missed deadline by 3 days',
        action: 'Click to see how to resolve this',
        etaText: undefined,
      })
    })

    it('should return correct tooltip for missed deadline with scheduled date', () => {
      const result = getMissedDeadlineTooltip(
        '2023-09-28',
        '2023-10-05',
        pluralize
      )

      expect(result).toEqual({
        title: 'Missed deadline by 3 days',
        action: 'Click to see how to resolve this',
        etaText: 'ETA: Thu Oct 5',
      })
    })

    it('should return correct tooltip when no deadline is missed', () => {
      const result = getMissedDeadlineTooltip(null, null, pluralize)

      expect(result).toEqual({
        title: 'Missed deadline',
        action: 'Click to see how to resolve this',
        etaText: undefined,
      })
    })
  })

  describe('getScheduledPastDeadlineTooltip', () => {
    it('should return correct tooltip for scheduled past deadline when multiple days are missed', () => {
      const result = getScheduledPastDeadlineTooltip(
        '2023-09-28',
        '2023-10-05',
        pluralize
      )

      expect(result).toEqual({
        title: 'Scheduled past deadline by 7 days',
        action: 'Click to see how to resolve this',
        etaText: 'ETA: Thu Oct 5',
      })
    })

    it('should return correct tooltip for scheduled past deadline when same day but multiple hours are missed', () => {
      const result = getScheduledPastDeadlineTooltip(
        '2023-10-01T12:00:00',
        '2023-10-01T10:00:00',
        pluralize
      )

      expect(result).toEqual({
        title: 'Scheduled past deadline by 2 hours',
        action: 'Click to see how to resolve this',
        etaText: 'ETA: Sun Oct 1 at 10:00 AM',
      })
    })

    it('should return correct tooltip when no scheduled date or due date', () => {
      const result = getScheduledPastDeadlineTooltip(null, null, pluralize)

      expect(result).toEqual({
        title: 'Scheduled past deadline',
        action: 'Click to see how to resolve this',
        etaText: undefined,
      })
    })
  })

  describe('getOnTrackTooltip', () => {
    it('should return correct tooltip for on track', () => {
      const result = getOnTrackTooltip('2023-10-05', '2023-10-01', pluralize)

      expect(result).toEqual({
        title: 'On track (4 days ahead)',
        action: undefined,
        etaText: 'ETA: Sun Oct 1',
      })
    })

    it('should return correct tooltip when no scheduled date or due date', () => {
      const result = getOnTrackTooltip(null, null, pluralize)

      expect(result).toEqual({
        title: 'On track',
        action: undefined,
        etaText: undefined,
      })
    })
  })

  describe('getAheadOfScheduleTooltip', () => {
    it('should return correct tooltip for ahead of schedule', () => {
      const result = getAheadOfScheduleTooltip(
        '2023-10-10',
        '2023-10-01',
        pluralize
      )

      expect(result).toEqual({
        title: 'Ahead of schedule by 9 days',
        action: 'Click to see how to optimize this',
        etaText: 'ETA: Sun Oct 1',
      })
    })

    it('should return correct tooltip when no scheduled date or due date', () => {
      const result = getAheadOfScheduleTooltip(null, null, pluralize)

      expect(result).toEqual({
        title: 'Ahead of schedule',
        action: 'Click to see how to optimize this',
        etaText: undefined,
      })
    })
  })
})
