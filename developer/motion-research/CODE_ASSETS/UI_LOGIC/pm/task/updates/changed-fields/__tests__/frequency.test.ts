import { type RecurringTaskSchema } from '@motion/rpc-types'

import tk from 'timekeeper'

import { getTaskFrequencyChangedFields } from '../frequency'

describe('getTaskFrequencyChangedFields', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-12-02T16:14:30.335Z')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const defaultTask = {
    type: 'RECURRING_TASK',
    isAutoScheduled: true,
    startingOn: '2024-02-01',
    assigneeUserId: 'user-id',
    priorityLevel: 'HIGH',
    duration: 30,
  } as RecurringTaskSchema
  const currentUserId = 'currentUserId'

  it('returns an object setting ignoreWarnOnPastDue to true when frequency is weekly', () => {
    const task = {
      ...defaultTask,
      frequency: 'WEEKLY',
    } as unknown as RecurringTaskSchema

    expect(getTaskFrequencyChangedFields(task, { currentUserId })).toEqual({
      ignoreWarnOnPastDue: true,
    })
  })

  it('returns an object setting ignoreWarnOnPastDue to false when frequency is daily', () => {
    const task = {
      ...defaultTask,
      frequency: 'DAILY',
    } as unknown as RecurringTaskSchema

    expect(getTaskFrequencyChangedFields(task, { currentUserId })).toEqual({
      ignoreWarnOnPastDue: true,
    })
  })

  it('returns an object without ignoreWarnOnPastDue when frequency is monthly', () => {
    const task = {
      ...defaultTask,
      frequency: 'MONTHLY',
    } as unknown as RecurringTaskSchema

    expect(getTaskFrequencyChangedFields(task, { currentUserId })).toEqual({})
  })
})
