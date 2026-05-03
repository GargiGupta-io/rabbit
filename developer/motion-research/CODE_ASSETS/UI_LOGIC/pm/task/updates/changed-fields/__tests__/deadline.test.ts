import { SHORT_TASK_DURATION } from '@motion/shared/pm'

import tk from 'timekeeper'

import { type UpdatableTaskSchema } from '../../types'
import { getTaskDeadlineDateChangedFields } from '../deadline'

describe('getTaskDeadlineDateChangedFields', () => {
  beforeEach(() => {
    const frozenTime = new Date('2024-01-03T16:14:30.335Z')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const defaultTask = {
    type: 'NORMAL',
    isAutoScheduled: false,
    statusId: 'status-2',
    duration: 30,
    startDate: '2023-05-14',
    dueDate: '2023-12-06T21:10:03.500Z',
  } as UpdatableTaskSchema

  it('returns an empty object if the due date is after the start date', () => {
    const task = {
      ...defaultTask,
      dueDate: '2023-06-01T21:10:03.500Z',
    }

    expect(getTaskDeadlineDateChangedFields(task)).toEqual({})
  })

  it('returns an object containing the new start date being today when deadline - 1 is before today', () => {
    const task = {
      ...defaultTask,
      startDate: '2024-01-10',
      dueDate: '2024-01-03T21:10:03.500Z',
    }

    expect(getTaskDeadlineDateChangedFields(task)).toEqual({
      startDate: '2024-01-03',
    })
  })

  it('returns an object containing the new start date being deadline - 1 day', () => {
    const task = {
      ...defaultTask,
      startDate: '2024-01-10',
      dueDate: '2024-01-07T21:10:03.500Z',
    }

    expect(getTaskDeadlineDateChangedFields(task)).toEqual({
      startDate: '2024-01-06',
    })
  })

  it('returns an object containing isAutoScheduled=false when the deadline is being removed and it was autoscheduled', () => {
    const task = {
      ...defaultTask,
      isAutoScheduled: true,
      dueDate: null,
    }

    expect(getTaskDeadlineDateChangedFields(task)).toEqual({
      isAutoScheduled: false,
    })
  })

  it('returns an object containing the start date being equal to deadline when the duration is a short task', () => {
    const task = {
      ...defaultTask,
      duration: SHORT_TASK_DURATION,
      dueDate: '2024-01-14T21:10:03.500Z',
    }

    expect(getTaskDeadlineDateChangedFields(task)).toEqual({
      startDate: '2024-01-14',
    })
  })
})
