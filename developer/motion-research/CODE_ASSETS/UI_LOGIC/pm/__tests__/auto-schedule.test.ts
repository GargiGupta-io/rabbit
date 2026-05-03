import { SHORT_TASK_DURATION } from '@motion/shared/pm'
import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { RecurringTaskSchemaMock, TaskSchemaMock } from '../../mocks/pm'
import { getAutoscheduleInfo } from '../auto-schedule'
import { getScheduledDate } from '../task'
import { type ScheduledType } from '../task-scheduled-end'

describe('getAutoscheduleInfo()', () => {
  it('should return pending for a non-created task', () => {
    const task = undefined
    const isAutoScheduled = true
    const isCompleted = false

    const info = getAutoscheduleInfo(task, isAutoScheduled, isCompleted)

    expect(info.formattedScheduledDate).toBe('None')
    expect(info.type).toBe('pending' satisfies ScheduledType)
    expect(info.labelVariant).toBe('on')
  })

  it('should return None for an auto-scheduled completed task', () => {
    const task = {
      ...TaskSchemaMock,
      estimatedCompletionTime: null,
      completedTime: '2024-05-31T15:06:28.369Z',
    }
    const isAutoScheduled = false
    const isCompleted = true

    const info = getAutoscheduleInfo(task, isAutoScheduled, isCompleted)

    expect(info.formattedScheduledDate).toBe('None')
    expect(info.type).toBe('completed' satisfies ScheduledType)
    expect(info.labelVariant).toBe('off')
  })

  it('should return pending for a pending task', () => {
    const task = {
      ...TaskSchemaMock,
      estimatedCompletionTime: null,
      needsReschedule: true,
    }
    const isAutoScheduled = true
    const isCompleted = false

    const info = getAutoscheduleInfo(task, isAutoScheduled, isCompleted)

    expect(info.formattedScheduledDate).toBe('None')
    expect(info.type).toBe('pending' satisfies ScheduledType)
    expect(info.labelVariant).toBe('on')
  })

  it('should return an error label for a past due task', () => {
    const task = {
      ...TaskSchemaMock,
      scheduledStatus: 'PAST_DUE',
      estimatedCompletionTime: null,
      duration: SHORT_TASK_DURATION,
      dueDate: DateTime.now().minus({ days: 1 }).toISO(),
    } as NormalTaskSchema
    const isAutoScheduled = true
    const isCompleted = false
    const expectedScheduledDate = getScheduledDate(task)?.toFormat('ccc LLL d')

    const info = getAutoscheduleInfo(task, isAutoScheduled, isCompleted)

    expect(info.formattedScheduledDate).toBe(expectedScheduledDate)
    expect(info.type).toBe('pastDue' satisfies ScheduledType)
    expect(info.labelVariant).toBe('error')
  })

  describe('for a recurring task', () => {
    it('should return recurringScheduled when the task is auto-scheduled', () => {
      const task = {
        ...RecurringTaskSchemaMock,
      } satisfies RecurringTaskSchema
      const isAutoScheduled = true
      const isCompleted = false

      const info = getAutoscheduleInfo(task, isAutoScheduled, isCompleted)

      expect(info.formattedScheduledDate).toBe('None')
      expect(info.type).toBe('recurringScheduled' satisfies ScheduledType)
      expect(info.labelVariant).toBe('on')
    })
  })

  it('should return off for a recurring task that is not auto scheduled', () => {
    const task = {
      ...RecurringTaskSchemaMock,
    } satisfies RecurringTaskSchema
    const isAutoScheduled = false
    const isCompleted = false

    const info = getAutoscheduleInfo(task, isAutoScheduled, isCompleted)

    expect(info.formattedScheduledDate).toBe('None')
    expect(info.type).toBe('notScheduled' satisfies ScheduledType)
    expect(info.labelVariant).toBe('off')
  })
})
