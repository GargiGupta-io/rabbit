import {
  type ChunkTaskSchema,
  type RecurringTaskSchema,
  type TaskSchema,
} from '@motion/rpc-types'
import { DEFAULT_DURATION } from '@motion/shared/pm'

import tk from 'timekeeper'

import { getTaskAutoScheduledChangedFields } from '../auto-scheduled'

describe('getTaskAutoScheduledChangedFields', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-12-02T16:14:30.335Z')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  describe('for chunks', () => {
    it('returns an empty object for chunk tasks', () => {
      const task = {
        type: 'CHUNK',
      } as ChunkTaskSchema

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({})
    })
  })

  describe('for recurring tasks', () => {
    const defaultRecurringTask = {
      type: 'RECURRING_TASK',
      isAutoScheduled: true,
      assigneeUserId: 'assignee-123',
      duration: 45,
      startingOn: '2023-12-06T21:10:03.500Z',
    } as RecurringTaskSchema

    it('returns an empty object if the task is not auto-scheduled', () => {
      const task = {
        ...defaultRecurringTask,
        isAutoScheduled: false,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({})
    })

    it('returns an empty object when the task has all the required fields', () => {
      const task = {
        ...defaultRecurringTask,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({})
    })

    it('returns an object containing the current user id as its assignee when missing', () => {
      const task = {
        ...defaultRecurringTask,
        assigneeUserId: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({ assigneeUserId: 'user-123' })
    })
  })

  describe('for normal tasks', () => {
    const defaultTask = {
      type: 'NORMAL',
      isAutoScheduled: true,
      assigneeUserId: 'assignee-123',
      duration: 45,
      minimumDuration: null,
      startDate: '2023-05-14',
      dueDate: '2023-12-06T21:10:03.500Z',
    } as TaskSchema

    it('returns an empty object if the task is not auto-scheduled', () => {
      const task = {
        ...defaultTask,
        isAutoScheduled: false,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({})
    })

    it('returns an empty object when the task has all the required fields', () => {
      const task = {
        ...defaultTask,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({})
    })

    it('returns an object containing the current user id as its assignee when missing', () => {
      const task = {
        ...defaultTask,
        assigneeUserId: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({ assigneeUserId: 'user-123' })
    })

    it('returns an object containing the default duration when missing', () => {
      const task = {
        ...defaultTask,
        duration: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({ duration: DEFAULT_DURATION })
    })

    it('returns an empty object if the minimum duration is already set', () => {
      const task = {
        ...defaultTask,
        duration: 120,
        minimumDuration: 30,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({})
    })

    it('returns an object containing the default minimumDuration when the duration requires one', () => {
      const task = {
        ...defaultTask,
        duration: 120,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({ minimumDuration: 60 })
    })

    it('returns an object containing startDate as today', () => {
      const task = {
        ...defaultTask,
        startDate: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({ startDate: '2023-12-02' })
    })

    it('returns an object containing dueDate as startDate + 1day', () => {
      const task = {
        ...defaultTask,
        dueDate: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({ dueDate: '2023-05-15T23:59:59.999+00:00' })
    })

    it('returns an object containing an updated due date after the start date', () => {
      const task = {
        ...defaultTask,
        dueDate: '2023-05-06T10:10:00.500Z',
        startDate: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({
        startDate: '2023-12-02',
        dueDate: '2023-12-03T23:59:59.999+00:00',
      })
    })

    it('returns an object containing the start date and assignee when not set', () => {
      const task = {
        ...defaultTask,
        startDate: null,
        assigneeUserId: null,
      }

      expect(
        getTaskAutoScheduledChangedFields(task, { currentUserId: 'user-123' })
      ).toEqual({
        startDate: '2023-12-02',
        assigneeUserId: 'user-123',
      })
    })
  })
})
