import { type PMTaskType } from '@motion/rpc-types/legacy'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { PMRecurringInstance, PMScheduledTaskMock } from '../../mocks'
import {
  getExtendDeadlineDateText,
  legacyShouldShowPastDueDeleteButton,
} from '../past-due'

describe('getExtendDeadlineDateText', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should return "Today" for a scheduled date equal to the current date', () => {
    const currentDateTime = DateTime.fromISO('2023-11-22T12:00:00')
    const scheduledDateTime = DateTime.fromISO('2023-11-22T14:00:00')

    tk.freeze(currentDateTime.toJSDate())

    const result = getExtendDeadlineDateText(scheduledDateTime.toISO())

    expect(result).toBe('Today (scheduled date)')
  })

  it('should return "Tomorrow" for a scheduled date one day ahead of the current date', () => {
    const currentDateTime = DateTime.fromISO('2023-11-22T12:00:00')
    const scheduledDateTime = DateTime.fromISO('2023-11-23T10:00:00')

    tk.freeze(currentDateTime.toJSDate())

    const result = getExtendDeadlineDateText(scheduledDateTime.toISO())

    expect(result).toBe('Tomorrow (scheduled date)')
  })

  it('should return the formatted date for a scheduled date different from the current date', () => {
    const currentDateTime = DateTime.fromISO('2023-11-22T12:00:00')
    const scheduledDateTime = DateTime.fromISO('2023-11-24T16:00:00')

    tk.freeze(currentDateTime.toJSDate())

    const result = getExtendDeadlineDateText(scheduledDateTime.toISO())

    expect(result).toBe('Fri Nov 24 (scheduled date)')
  })
})

// TODO kenl: update this test to use the new TaskSchema type, fn
describe('legacyShouldShowPastDueDeleteButton', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-08-01')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  it('should return true for a recurring instance with a due date more than 60 days in the past', () => {
    const task = {
      ...PMRecurringInstance,
      dueDate: DateTime.fromISO('2023-04-01T12:00:00').toISO(),
    } satisfies PMTaskType
    const result = legacyShouldShowPastDueDeleteButton(task)

    expect(result).toBe(true)
  })

  it('should return false for a task without a due date', () => {
    const task = {
      ...PMRecurringInstance,
    }
    const result = legacyShouldShowPastDueDeleteButton(task)

    expect(result).toBe(false)
  })

  it('should return false for a non-recurring task with a due date', () => {
    const task = {
      ...PMScheduledTaskMock,
    }
    const result = legacyShouldShowPastDueDeleteButton(task)

    expect(result).toBe(false)
  })
})
