import { SHORT_TASK_DURATION } from '@motion/shared/pm'
import {
  type ProjectSchema,
  type RecurringTaskSchema,
  type TaskSchema,
  type UserSettingsSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  adjustDateToEndOfDay,
  adjustTaskDueDate,
  getScheduledDate,
  getTaskDefaultDueDate,
  getTaskInitialStartDate,
} from '../date-helpers'

describe('date helpers', () => {
  const FROZEN_DATE = '2023-12-02'
  const FROZEN_DATE_TIME = '2023-12-02T12:00:00Z'

  describe('getTaskInitialStartDate', () => {
    beforeEach(() => tk.freeze(new Date(FROZEN_DATE)))

    afterEach(() => tk.reset())

    it('returns the current date when no params', () => {
      expect(getTaskInitialStartDate()).toBe(FROZEN_DATE)
    })

    describe('with existing task', () => {
      it('returns the startingOn date for recurring task', () => {
        const task = {
          type: 'RECURRING_TASK',
          startingOn: '2023-12-06T20:49:55.016Z',
        } as RecurringTaskSchema

        expect(getTaskInitialStartDate(task)).toBe('2023-12-06')
      })

      it('returns the startDate for normal task when set', () => {
        const task = {
          type: 'NORMAL',
          startDate: '2023-12-06',
        } as TaskSchema

        expect(getTaskInitialStartDate(task)).toBe('2023-12-06')
      })

      it('returns today if task is autoscheduled without start date', () => {
        const task = {
          type: 'NORMAL',
          isAutoScheduled: true,
          startDate: null,
        } as TaskSchema

        expect(getTaskInitialStartDate(task)).toBe(FROZEN_DATE)
      })

      it('returns null if task is not autoscheduled without start date', () => {
        const task = {
          type: 'NORMAL',
          isAutoScheduled: false,
          startDate: null,
        } as TaskSchema

        expect(getTaskInitialStartDate(task)).toBe(null)
      })

      it('uses completed time when task was completed before start date', () => {
        const task = {
          type: 'NORMAL',
          startDate: '2023-12-10',
          completedTime: '2023-12-05T12:00:00.000Z',
        } as TaskSchema

        expect(getTaskInitialStartDate(task)).toBe('2023-12-05')
      })

      it('ignores completed time when after start date', () => {
        const task = {
          type: 'NORMAL',
          startDate: '2023-12-05',
          completedTime: '2023-12-10T12:00:00.000Z',
        } as TaskSchema

        expect(getTaskInitialStartDate(task)).toBe('2023-12-05')
      })

      it('returns today for recurring task without startingOn', () => {
        const task = {
          type: 'RECURRING_TASK',
        } as RecurringTaskSchema

        expect(getTaskInitialStartDate(task)).toBe(FROZEN_DATE)
      })
    })

    describe('with user defined defaults', () => {
      const createUserDefaults = (
        relativeStartOn: string
      ): UserSettingsSchema['taskDefaultSettings'] =>
        ({
          global: { relativeStartOn },
        }) as UserSettingsSchema['taskDefaultSettings']

      it('returns date from user settings when relativeStartOn is set', () => {
        expect(
          getTaskInitialStartDate(
            undefined,
            null,
            null,
            createUserDefaults('tomorrow')
          )
        ).toBe('2023-12-03')
      })

      it('returns today when user settings are empty', () => {
        const emptyDefaults = {
          global: {},
        } as UserSettingsSchema['taskDefaultSettings']

        expect(
          getTaskInitialStartDate(undefined, null, null, emptyDefaults)
        ).toBe(FROZEN_DATE)
      })

      it('adjusts start date relative to due date when needed', () => {
        const dueDate = '2023-12-04T23:59:59.999+00:00'
        const nextWeekDefaults = createUserDefaults('next-week')
        const nextMonthDefaults = createUserDefaults('next-month')

        expect(
          getTaskInitialStartDate(undefined, dueDate, null, nextWeekDefaults)
        ).toBe('2023-12-04')

        expect(
          getTaskInitialStartDate(undefined, dueDate, null, nextMonthDefaults)
        ).toBe('2023-12-03')
      })
    })

    describe('with project start date', () => {
      it('uses project start date when it is in the future', () => {
        const project = {
          startDate: '2023-12-10',
        } as ProjectSchema

        expect(getTaskInitialStartDate(undefined, null, project)).toBe(
          '2023-12-10'
        )
      })

      it('uses project start date when no user defaults are set', () => {
        const project = {
          startDate: '2023-12-10',
        } as ProjectSchema
        const emptyDefaults = {
          global: {},
        } as UserSettingsSchema['taskDefaultSettings']

        expect(
          getTaskInitialStartDate(undefined, null, project, emptyDefaults)
        ).toBe('2023-12-10')
      })

      it('prioritizes project start date over user defaults', () => {
        const project = {
          startDate: '2023-12-10',
        } as ProjectSchema
        const userDefaults = {
          global: { relativeStartOn: 'tomorrow' },
        } as UserSettingsSchema['taskDefaultSettings']

        expect(
          getTaskInitialStartDate(undefined, null, project, userDefaults)
        ).toBe('2023-12-10')
      })

      it('prioritizes due date override over project start date', () => {
        const project = {
          startDate: '2023-12-10',
        } as ProjectSchema
        const dueDateOverride = '2023-12-05T23:59:59.999+00:00'

        expect(
          getTaskInitialStartDate(undefined, dueDateOverride, project)
        ).toBe('2023-12-04')
      })

      it('sets to today for past project start dates', () => {
        const project = {
          startDate: '2023-11-30',
        } as ProjectSchema

        expect(getTaskInitialStartDate(undefined, null, project)).toBe(
          '2023-12-02'
        )
      })

      it('handles today as project start date', () => {
        const project = {
          startDate: FROZEN_DATE,
        } as ProjectSchema

        expect(getTaskInitialStartDate(undefined, null, project)).toBe(
          '2023-12-02'
        )
      })

      it('falls back to user defaults when project start date is null', () => {
        const project = {
          startDate: null,
        } as ProjectSchema
        const userDefaults = {
          global: { relativeStartOn: 'tomorrow' },
        } as UserSettingsSchema['taskDefaultSettings']

        expect(
          getTaskInitialStartDate(undefined, null, project, userDefaults)
        ).toBe('2023-12-03')
      })

      it('returns today on invalid project start date', () => {
        const project = {
          startDate: 'invalid-date',
        } as ProjectSchema

        expect(getTaskInitialStartDate(undefined, null, project)).toEqual(
          FROZEN_DATE
        )
      })
    })

    it('throw on invalid due date', () => {
      expect(() =>
        getTaskInitialStartDate(undefined, 'invalid-date', null)
      ).toThrow()
    })
  })

  describe('getTaskDefaultDueDate', () => {
    beforeEach(() => tk.freeze(new Date(FROZEN_DATE_TIME)))

    afterEach(() => tk.reset())

    const createUserDefaults = (
      relativeDueDate: string
    ): UserSettingsSchema['taskDefaultSettings'] =>
      ({
        global: { relativeDueDate },
      }) as UserSettingsSchema['taskDefaultSettings']

    it('handles basic cases', () => {
      expect(getTaskDefaultDueDate()).toBe('2023-12-03T23:59:59.999+00:00')
      expect(
        getTaskDefaultDueDate(undefined, { dueDate: null } as ProjectSchema)
      ).toBe('2023-12-03T23:59:59.999+00:00')
    })

    describe('with project due dates', () => {
      it('respects project due dates appropriately', () => {
        const futureProject = { dueDate: '2023-12-10' } as ProjectSchema
        const pastProject = { dueDate: '2023-11-30' } as ProjectSchema

        expect(getTaskDefaultDueDate(undefined, futureProject)).toBe(
          '2023-12-10T23:59:59.999+00:00'
        )
        expect(getTaskDefaultDueDate(undefined, pastProject)).toBe(
          '2023-12-03T23:59:59.999+00:00'
        )
      })
    })

    describe('with user defined defaults', () => {
      it('uses user settings when appropriate', () => {
        const startAt = DateTime.fromISO(FROZEN_DATE)

        expect(
          getTaskDefaultDueDate(
            startAt,
            null,
            createUserDefaults('next-7-days')
          )
        ).toBe('2023-12-09T23:59:59.999+00:00')
      })

      it('balances project due dates and user defaults', () => {
        const startAt = DateTime.fromISO(FROZEN_DATE)
        const earlyProject = { dueDate: '2023-12-05' } as ProjectSchema
        const lateProject = { dueDate: '2023-12-10' } as ProjectSchema

        expect(
          getTaskDefaultDueDate(
            startAt,
            earlyProject,
            createUserDefaults('end-of-week')
          )
        ).toBe('2023-12-05T23:59:59.999+00:00')

        expect(
          getTaskDefaultDueDate(
            startAt,
            lateProject,
            createUserDefaults('tomorrow')
          )
        ).toBe('2023-12-03T23:59:59.999+00:00')
      })
    })
  })

  describe('getScheduledDate', () => {
    it('handles various task scenarios', () => {
      expect(getScheduledDate(undefined)).toBe(null)

      const reminderTask = {
        duration: SHORT_TASK_DURATION,
        dueDate: '2023-12-01T08:00:00.000Z',
        scheduledEnd: '2023-12-01T08:00:00.000Z',
      } as unknown as TaskSchema

      const scheduledDate = getScheduledDate(reminderTask)

      expect(scheduledDate).toBeInstanceOf(DateTime)
      expect(scheduledDate!.toISO()).toBe('2023-12-01T08:00:00.000+00:00')

      expect(getScheduledDate({} as TaskSchema)).toBe(null)
    })
  })

  describe('adjustTaskDueDate', () => {
    beforeEach(() => tk.freeze(new Date(FROZEN_DATE_TIME)))

    afterEach(() => tk.reset())

    it('returns null when both dates are null', () => {
      expect(adjustTaskDueDate(null, null)).toBe(null)
    })

    it('returns end of day when only due date is provided', () => {
      const dueDate = '2023-12-05'

      expect(adjustTaskDueDate(null, dueDate)).toBe(
        '2023-12-05T23:59:59.999+00:00'
      )
    })

    it('adjusts due date when it is before start date', () => {
      const startDate = '2023-12-05'
      const dueDate = '2023-12-03'

      // Should return start date + 1 day at end of day
      expect(adjustTaskDueDate(startDate, dueDate)).toBe(
        '2023-12-06T23:59:59.999+00:00'
      )
    })

    it('preserves due date when it is after start date', () => {
      const startDate = '2023-12-03'
      const dueDate = '2023-12-05'

      expect(adjustTaskDueDate(startDate, dueDate)).toBe(
        '2023-12-05T23:59:59.999+00:00'
      )
    })

    it('handles DateTime objects', () => {
      const startDate = DateTime.fromISO('2023-12-03')
      const dueDate = DateTime.fromISO('2023-12-05')

      expect(adjustTaskDueDate(startDate, dueDate)).toBe(
        '2023-12-05T23:59:59.999+00:00'
      )
    })

    it('handles invalid start date by using only due date', () => {
      expect(adjustTaskDueDate('invalid', '2023-12-05')).toBe(
        '2023-12-05T23:59:59.999+00:00'
      )
    })

    it('handles invalid due date by returning null', () => {
      expect(adjustTaskDueDate('2023-12-05', 'invalid')).toBe(null)
    })
  })

  describe('adjustDateToEndOfDay', () => {
    it('returns null for null input', () => {
      expect(adjustDateToEndOfDay(null)).toBe(null)
    })

    it('converts date string to end of day', () => {
      expect(adjustDateToEndOfDay('2023-12-05')).toBe(
        '2023-12-05T23:59:59.999+00:00'
      )
    })

    it('handles DateTime objects', () => {
      const dateTime = DateTime.fromISO('2023-12-05T10:30:00.000Z')

      expect(adjustDateToEndOfDay(dateTime)).toBe(
        '2023-12-05T23:59:59.999+00:00'
      )
    })

    it('returns ISODate format when useISODate option is true', () => {
      expect(adjustDateToEndOfDay('2023-12-05', { useISODate: true })).toBe(
        '2023-12-05'
      )
    })

    it('handles invalid date strings by returning null', () => {
      expect(adjustDateToEndOfDay('invalid-date')).toBe(null)
    })
  })

  describe('getTaskDefaultDueDate with custom start dates', () => {
    beforeEach(() => tk.freeze(new Date(FROZEN_DATE_TIME)))

    afterEach(() => tk.reset())

    it('respects custom start date', () => {
      const customStart = DateTime.fromISO('2023-12-15')

      expect(getTaskDefaultDueDate(customStart)).toBe(
        '2023-12-16T23:59:59.999+00:00'
      )
    })

    it('uses user defaults when they are earlier than project due date', () => {
      const customStart = DateTime.fromISO('2023-12-15')
      const project = { dueDate: '2023-12-20' } as ProjectSchema
      const userDefaults = {
        global: { relativeDueDate: 'tomorrow' },
      } as UserSettingsSchema['taskDefaultSettings']

      expect(getTaskDefaultDueDate(customStart, project, userDefaults)).toBe(
        '2023-12-03T23:59:59.999+00:00' // user defined default, b/c earlier than project due date
      )
    })
  })

  describe('getTaskInitialStartDate edge cases', () => {
    beforeEach(() => tk.freeze(new Date(FROZEN_DATE_TIME)))

    afterEach(() => tk.reset())

    it('handles invalid project start date gracefully', () => {
      const project = {
        startDate: 'not-a-date',
      } as ProjectSchema
      const userDefaults = {
        global: { relativeStartOn: 'tomorrow' },
      } as UserSettingsSchema['taskDefaultSettings']

      expect(
        getTaskInitialStartDate(undefined, null, project, userDefaults)
      ).toBe('2023-12-03')
    })

    it('handles timezone edge cases for recurring tasks', () => {
      const task = {
        type: 'RECURRING_TASK',
        startingOn: '2023-12-06T00:00:00.000Z',
      } as RecurringTaskSchema

      expect(getTaskInitialStartDate(task)).toBe('2023-12-06')
    })

    it('handles null project with user defaults', () => {
      const userDefaults = {
        global: { relativeStartOn: 'next-week' },
      } as UserSettingsSchema['taskDefaultSettings']

      expect(getTaskInitialStartDate(undefined, null, null, userDefaults)).toBe(
        '2023-12-04' // start of next week
      )
    })
  })
})
