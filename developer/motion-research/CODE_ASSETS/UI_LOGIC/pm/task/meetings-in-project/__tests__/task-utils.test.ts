import { type NormalTaskSchema } from '@motion/zod/client'

import {
  isMeetingTask,
  isScheduledSchedulingTask,
  isSchedulingTask,
  isUnscheduledSchedulingTask,
} from '../task-utils'

describe('isMeetingTask', () => {
  it('should return true if task is a meeting task', () => {
    expect(
      isMeetingTask({
        type: 'NORMAL',
        meetingEventId: '123',
      } as NormalTaskSchema)
    ).toBe(true)
  })

  it('should return false if task is not a meeting task', () => {
    expect(
      isMeetingTask({
        type: 'NORMAL',
        scheduleMeetingWithinDays: 1,
      } as NormalTaskSchema)
    ).toBe(false)
  })
})

describe('isSchedulingTask', () => {
  it('should return true if task is a scheduling task', () => {
    expect(
      isSchedulingTask({
        type: 'NORMAL',
        scheduleMeetingWithinDays: 1,
      } as NormalTaskSchema)
    ).toBe(true)
  })

  it('should return false if task is not a scheduling task', () => {
    expect(
      isSchedulingTask({
        type: 'NORMAL',
        meetingEventId: '123',
      } as NormalTaskSchema)
    ).toBe(false)
  })
})

describe('isUnscheduledSchedulingTask', () => {
  it('should return true if task is an unscheduled scheduling task', () => {
    expect(
      isUnscheduledSchedulingTask({
        type: 'NORMAL',
        scheduleMeetingWithinDays: 1,
        meetingTaskId: null,
      } as NormalTaskSchema)
    ).toBe(true)
  })

  it('should return false if task is an unscheduled scheduling task', () => {
    expect(
      isUnscheduledSchedulingTask({
        type: 'NORMAL',
        scheduleMeetingWithinDays: 1,
        meetingTaskId: '123',
      } as NormalTaskSchema)
    ).toBe(false)
  })
})

describe('isScheduledSchedulingTask', () => {
  it('should return true if task is a scheduled scheduling task', () => {
    expect(
      isScheduledSchedulingTask({
        type: 'NORMAL',
        scheduleMeetingWithinDays: 1,
        meetingTaskId: '123',
      } as NormalTaskSchema)
    ).toBe(true)
  })
})
