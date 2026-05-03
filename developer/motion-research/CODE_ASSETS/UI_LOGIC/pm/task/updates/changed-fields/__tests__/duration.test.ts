import {
  type ChunkTaskSchema,
  type RecurringTaskSchema,
} from '@motion/rpc-types'
import { SHORT_TASK_DURATION } from '@motion/shared/pm'

import { type UpdatableTaskSchema } from '../../types'
import { getTaskDurationChangedFields } from '../duration'

describe('getTaskDurationChangedFields', () => {
  const defaultTask = {
    type: 'NORMAL',
    startDate: '2024-01-02',
    dueDate: '2024-01-05T10:00:00.000',
    duration: 60,
    completedDuration: 0,
    minimumDuration: null,
    isAutoScheduled: true,
  } as UpdatableTaskSchema

  it('returns an empty object when the duration is under the threshold for a default minimum chunk duration', () => {
    const task = {
      ...defaultTask,
      duration: 15,
    }

    expect(getTaskDurationChangedFields(task)).toEqual({})
  })

  it('returns start date equal to due date when set as short/reminders', () => {
    const task = {
      ...defaultTask,
      duration: SHORT_TASK_DURATION,
    }

    expect(getTaskDurationChangedFields(task)).toEqual({
      startDate: '2024-01-05',
    })
  })

  it('returns a new minimum duration when updating the duration', () => {
    const task = {
      ...defaultTask,
      duration: 15,
      minimumDuration: 60,
    }

    expect(getTaskDurationChangedFields(task)).toEqual({
      minimumDuration: null,
    })
  })

  it('returns a new minimum duration for the new duration', () => {
    const task = {
      ...defaultTask,
      duration: 240,
      minimumDuration: 15,
    }

    expect(getTaskDurationChangedFields(task)).toEqual({ minimumDuration: 60 })
  })

  it('returns a new completed duration equal to the duration when greater than the current completed duration', () => {
    const task = {
      ...defaultTask,
      duration: 15,
      completedDuration: 30,
    }

    expect(getTaskDurationChangedFields(task)).toEqual({
      completedDuration: 15,
    })
  })

  it('does not return a new completed duration when less than the current duration', () => {
    const task = {
      ...defaultTask,
      duration: 60,
      completedDuration: 30,
    }

    expect(getTaskDurationChangedFields(task)).toEqual({})
  })

  it('does not return a new completed duration when updating the duration for a recurring task', () => {
    const task = {
      ...defaultTask,
      type: 'RECURRING_TASK',
      duration: 15,
    } as RecurringTaskSchema

    expect(getTaskDurationChangedFields(task)).toEqual({})
  })

  it('does not return a new completed duration when updating the duration for a chunk', () => {
    const task = {
      ...defaultTask,
      type: 'CHUNK',
    } as ChunkTaskSchema

    expect(getTaskDurationChangedFields(task)).toEqual({})
  })
})
