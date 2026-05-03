import {
  type ChunkTaskSchema,
  type RecurringTaskSchema,
} from '@motion/zod/client'

import { type UpdatableTaskSchema } from '../../types'
import { getTaskCompletedDurationChangedFields } from '../completed-duration'

describe('getTaskCompletedDurationChangedFields', () => {
  it('should return an empty object for chunk tasks', () => {
    const task = {
      type: 'CHUNK',
    } as ChunkTaskSchema

    const result = getTaskCompletedDurationChangedFields(task)

    expect(result).toEqual({})
  })

  it('should return an empty object for recurring tasks', () => {
    const task = {
      type: 'RECURRING_TASK',
      duration: 60,
      completedDuration: 60,
    } as unknown as RecurringTaskSchema

    const result = getTaskCompletedDurationChangedFields(task)

    expect(result).toEqual({})
  })

  it('should set isAutoScheduled to false for normal tasks with completed duration greater than or equal to duration', () => {
    const task = {
      type: 'NORMAL',
      duration: 60,
      completedDuration: 60,
    } as UpdatableTaskSchema

    const result = getTaskCompletedDurationChangedFields(task)

    expect(result).toEqual({ isAutoScheduled: false })
  })

  it('should not set isAutoScheduled to false for normal tasks with completed duration less than duration', () => {
    const task = {
      type: 'NORMAL',
      duration: 60,
      completedDuration: 30,
    } as UpdatableTaskSchema

    const result = getTaskCompletedDurationChangedFields(task)

    expect(result).toEqual({})
  })
})
