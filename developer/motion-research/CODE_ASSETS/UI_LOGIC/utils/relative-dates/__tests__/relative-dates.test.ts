import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  findRelativeDateOptionAfter,
  findRelativeDateOptionBefore,
  mapRelativeDateOptionToAbsoluteDate,
} from '../relative-dates'

describe('relative dates', () => {
  describe('mapRelativeDateOptionToAbsoluteDate', () => {
    // Using Saturday April 15, 2023 for tests
    beforeEach(() => {
      tk.freeze('2023-04-15T12:00:00Z')
    })

    afterEach(() => {
      tk.reset()
    })

    describe('basic date options', () => {
      test('returns null for null input', () => {
        expect(mapRelativeDateOptionToAbsoluteDate(null)).toBeNull()
      })

      test('returns today for today option', () => {
        const result = mapRelativeDateOptionToAbsoluteDate('today')

        expect(result?.toISODate()).toBe('2023-04-15')
      })

      test('returns tomorrow for tomorrow option', () => {
        const result = mapRelativeDateOptionToAbsoluteDate('tomorrow')

        expect(result?.toISODate()).toBe('2023-04-16')
      })

      test('returns date in one week for next-7-days option', () => {
        const result = mapRelativeDateOptionToAbsoluteDate('next-7-days')

        expect(result?.toISODate()).toBe('2023-04-22')
      })

      test('returns date in one month for next-30-days option', () => {
        const result = mapRelativeDateOptionToAbsoluteDate('next-30-days')

        expect(result?.toISODate()).toBe('2023-05-15')
      })
    })

    describe('week-based options', () => {
      describe('this-week option', () => {
        test('returns Monday when on Wednesday with start bound', () => {
          tk.freeze('2023-04-12T12:00:00Z') // Wednesday
          const result = mapRelativeDateOptionToAbsoluteDate('this-week', {
            bound: 'start',
          })

          expect(result?.toISODate()).toBe('2023-04-10') // Monday same week
        })

        test('returns Friday when on Wednesday with end bound', () => {
          tk.freeze('2023-04-12T12:00:00Z') // Wednesday
          const result = mapRelativeDateOptionToAbsoluteDate('this-week', {
            bound: 'end',
          })

          expect(result?.toISODate()).toBe('2023-04-14') // Friday same week
        })

        test('returns next Monday when on Saturday with start bound', () => {
          tk.freeze('2023-04-15T12:00:00Z') // Saturday
          const result = mapRelativeDateOptionToAbsoluteDate('this-week', {
            bound: 'start',
          })

          expect(result?.toISODate()).toBe('2023-04-17') // Next Monday
        })

        test('returns next Friday when on Saturday with end bound', () => {
          tk.freeze('2023-04-15T12:00:00Z') // Saturday
          const result = mapRelativeDateOptionToAbsoluteDate('this-week', {
            bound: 'end',
          })

          expect(result?.toISODate()).toBe('2023-04-21') // Next Friday
        })
      })

      describe('next-week option', () => {
        test('returns next Monday with start bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-week', {
            bound: 'start',
          })

          expect(result?.toISODate()).toBe('2023-04-17')
        })

        test('returns next Friday with end bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-week', {
            bound: 'end',
          })

          expect(result?.toISODate()).toBe('2023-04-21')
        })

        test('returns start of next week with default bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-week')

          expect(result?.toISODate()).toBe('2023-04-17')
        })
      })

      describe('next-14-days option', () => {
        test('returns Monday two weeks ahead with start bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-14-days', {
            bound: 'start',
          })

          expect(result?.toISODate()).toBe('2023-04-24')
        })

        test('returns Friday two weeks ahead with end bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-14-days', {
            bound: 'end',
          })

          expect(result?.toISODate()).toBe('2023-04-28')
        })

        test('returns start of week two weeks ahead with default bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-14-days')

          expect(result?.toISODate()).toBe('2023-04-24')
        })
      })
    })

    describe('month-based options', () => {
      describe('this-month option', () => {
        test('returns start of current month with start bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('this-month', {
            bound: 'start',
          })

          expect(result?.toISODate()).toBe('2023-04-01')
        })

        test('returns end of current month with end bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('this-month', {
            bound: 'end',
          })

          expect(result?.toISODate()).toBe('2023-04-30')
        })

        test('returns start of current month with default bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('this-month')

          expect(result?.toISODate()).toBe('2023-04-01')
        })
      })

      describe('next-month option', () => {
        test('returns start of next month with start bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-month', {
            bound: 'start',
          })

          expect(result?.toISODate()).toBe('2023-05-01')
        })

        test('returns end of next month with end bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-month', {
            bound: 'end',
          })

          expect(result?.toISODate()).toBe('2023-05-31')
        })

        test('returns start of next month with default bound', () => {
          const result = mapRelativeDateOptionToAbsoluteDate('next-month')

          expect(result?.toISODate()).toBe('2023-05-01')
        })
      })
    })

    describe('edge cases and timezone handling', () => {
      test('returns today when this-month results in today', () => {
        tk.freeze('2023-04-30T12:00:00Z')
        const result = mapRelativeDateOptionToAbsoluteDate('this-month', {
          bound: 'end',
        })

        expect(result?.toISODate()).toBe('2023-04-30')
      })

      test('maintains consistent timezone handling', () => {
        const result = mapRelativeDateOptionToAbsoluteDate('today')

        expect(result?.zoneName).toBe(DateTime.now().zoneName)
      })

      test('handles dates consistently across timezone boundaries', () => {
        tk.freeze('2023-04-15T23:59:59Z')
        const resultNearMidnight = mapRelativeDateOptionToAbsoluteDate('today')

        tk.freeze('2023-04-16T00:00:01Z')
        const resultAfterMidnight = mapRelativeDateOptionToAbsoluteDate('today')

        expect(resultNearMidnight?.zoneName).toBe(resultAfterMidnight?.zoneName)
        expect(resultNearMidnight?.toISODate()).toBe('2023-04-15')
        expect(resultAfterMidnight?.toISODate()).toBe('2023-04-16')
      })
    })
  })

  describe('findRelativeDateOptionAfter', () => {
    beforeEach(() => {
      tk.freeze('2023-04-15T12:00:00Z') // Saturday
    })

    afterEach(() => {
      tk.reset()
    })

    test('returns today when date is in the past', () => {
      const targetDate = DateTime.fromISO('2023-04-14') // Friday

      const result = findRelativeDateOptionAfter(targetDate)

      expect(result).toBe('today')
    })

    test('returns tomorrow when target is today', () => {
      const targetDate = DateTime.fromISO('2023-04-15') // Saturday

      const result = findRelativeDateOptionAfter(targetDate)

      expect(result).toBe('tomorrow')
    })

    test('returns next-7-days when current week is passed', () => {
      const targetDate = DateTime.fromISO('2023-04-21') // Friday next week

      const result = findRelativeDateOptionAfter(targetDate)

      expect(result).toBe('next-7-days')
    })

    test('returns next-month for dates beyond near-term options', () => {
      const targetDate = DateTime.fromISO('2023-05-15') // Far future

      const result = findRelativeDateOptionAfter(targetDate)

      expect(result).toBe('next-month')
    })
  })

  describe('findRelativeDateOptionBefore', () => {
    beforeEach(() => {
      tk.freeze('2023-04-15T12:00:00Z') // Saturday
    })

    afterEach(() => {
      tk.reset()
    })

    test('returns tomorrow when target is in the future', () => {
      const targetDate = DateTime.fromISO('2023-04-17') // Monday

      const result = findRelativeDateOptionBefore(targetDate)

      expect(result).toBe('tomorrow')
    })

    test('returns next-week when target is in next week', () => {
      const targetDate = DateTime.fromISO('2023-04-21') // Friday next week

      const result = findRelativeDateOptionBefore(targetDate)

      expect(result).toBe('next-week')
    })

    test('returns next-month when target is far in the future', () => {
      const targetDate = DateTime.fromISO('2023-05-30') // End of next month

      const result = findRelativeDateOptionBefore(targetDate)

      expect(result).toBe('next-month')
    })
  })
})
