import { type TaskSchema } from '@motion/zod/client'

import { getTaskStartDateChangedFields } from '../start-date'

describe('getTaskStartDateChangedFields', () => {
  const defaultTask = {
    type: 'NORMAL',
    startDate: '2023-05-14',
    dueDate: '2023-12-06T21:10:03.500Z',
  } as TaskSchema

  it('returns an empty object if the start date is before the due date (deadline)', () => {
    const task = {
      ...defaultTask,
      startDate: '2023-07-20',
    }

    expect(getTaskStartDateChangedFields(task)).toEqual({})
  })

  it('returns an object containing the new due date (being start + 1 day)', () => {
    const task = {
      ...defaultTask,
      startDate: '2023-12-10',
    }

    expect(getTaskStartDateChangedFields(task)).toEqual({
      dueDate: '2023-12-11T23:59:59.999+00:00',
    })
  })
})
