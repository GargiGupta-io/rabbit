import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { isValidTaskDeadlineDateOption } from '../deadline'

describe('isValidTaskDeadlineDateOption()', () => {
  afterEach(() => {
    tk.reset()
  })

  describe('recurring instances', () => {
    it('returns false when the date is before the start date', () => {
      const instance = {
        type: 'RECURRING_INSTANCE',
        startDate: '2024-06-25',
      } satisfies Parameters<typeof isValidTaskDeadlineDateOption>[0]

      expect(
        isValidTaskDeadlineDateOption(
          instance,
          DateTime.fromISO('2024-06-21T15:47:38+00:00')
        )
      ).toBe(false)

      expect(
        isValidTaskDeadlineDateOption(
          instance,
          DateTime.fromISO('2024-06-24T15:47:38+00:00')
        )
      ).toBe(false)
    })

    it('returns true when the date is equal or after the start date', () => {
      const instance = {
        type: 'RECURRING_INSTANCE',
        startDate: '2024-06-23',
      } satisfies Parameters<typeof isValidTaskDeadlineDateOption>[0]

      expect(
        isValidTaskDeadlineDateOption(
          instance,
          DateTime.fromISO('2024-06-23T00:00:00+00:00')
        )
      ).toBe(true)

      expect(
        isValidTaskDeadlineDateOption(
          instance,
          DateTime.fromISO('2024-06-27T22:43:13+00:00')
        )
      ).toBe(true)
    })
  })

  describe('other tasks', () => {
    beforeEach(() => {
      const frozenTime = new Date('2024-06-28T00:00:00+00:00')
      tk.freeze(frozenTime)
    })

    it('returns false when the date is before "today start of day"', () => {
      const task = {
        type: 'NORMAL',
        startDate: '2024-06-25',
      } satisfies Parameters<typeof isValidTaskDeadlineDateOption>[0]

      expect(
        isValidTaskDeadlineDateOption(
          task,
          DateTime.fromISO('2024-06-21T15:47:38+00:00')
        )
      ).toBe(false)

      expect(
        isValidTaskDeadlineDateOption(
          task,
          DateTime.fromISO('2024-06-24T15:47:38+00:00')
        )
      ).toBe(false)
    })

    it('returns true when the date is equal or after "today start of day"', () => {
      const task = {
        type: 'NORMAL',
        startDate: '2024-06-23',
      } satisfies Parameters<typeof isValidTaskDeadlineDateOption>[0]

      expect(
        isValidTaskDeadlineDateOption(
          task,
          DateTime.fromISO('2024-06-28T00:00:00+00:00')
        )
      ).toBe(true)

      expect(
        isValidTaskDeadlineDateOption(
          task,
          DateTime.fromISO('2024-08-03T22:43:13+00:00')
        )
      ).toBe(true)
    })
  })
})
