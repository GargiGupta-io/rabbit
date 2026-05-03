import { PMItemType, type PMTaskType } from '@motion/rpc-types/legacy'

import { DateTime } from 'luxon'

import {
  PMASAPScheduledTaskMock,
  PMCompletedTaskMock,
  PMHighScheduledTomorrowTaskMock,
  PMRecurringInstance,
  PMScheduledAfterDueTaskMock,
  PMStaleScheduledTaskMock,
  PMUncompletedTaskMock,
  ReminderFutureTaskMock,
  ReminderPastDueTaskMock,
  ReminderPresentTaskMock,
  UnfitPastDueTaskMock,
  UnfitSchedulableTaskMock,
  UnfitTaskMock,
} from '../../mocks/pm'
import { calculateScheduledType } from '../task-scheduled-end'

describe('calculateScheduledType()', () => {
  it('should return type pending for nonAutoscheduled task that is becoming autoscheduled', () => {
    const task = {
      ...PMUncompletedTaskMock,
      isAutoScheduled: false,
    } as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('pending')
  })

  it('should return type notScheduled for nonAutoscheduled/nonComplete tasks', () => {
    const task = PMUncompletedTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: false,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('notScheduled')
  })

  it('should return type completed for completed tasks', () => {
    const task = PMCompletedTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: false,
      isCompleted: true,
      scheduledDate,
    })

    expect(type).toEqual('completed')
  })

  it('should return type asap for asap tasks', () => {
    const task = PMASAPScheduledTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('asap')
  })

  it('should return type asap for autoscheduled asap tasks', () => {
    const task = PMASAPScheduledTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('asap')
  })

  it('should return type not scheduled for non autoscheduled asap tasks', () => {
    const task = PMASAPScheduledTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: false,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('notScheduled')
  })

  it('should return type beforeDue for a task scheduled before the deadline', () => {
    const task = PMHighScheduledTomorrowTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('beforeDue')
  })

  it('should return type pastDue for a task scheduled after the deadline', () => {
    const task = PMScheduledAfterDueTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('pastDue')
  })

  it('should return type unfit for an unfit task', () => {
    const task = UnfitTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('unfit')
  })

  it('should return type unfitPastDue for an unfit past due task', () => {
    const task = UnfitPastDueTaskMock as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('unfitPastDue')
  })

  it('should return type unfitSchedulable for an unfit schedulable task', () => {
    const task = UnfitSchedulableTaskMock as PMTaskType
    const scheduledDate = null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('unfitSchedulable')
  })

  it('should return type reminder for a reminder task that is due today', () => {
    const task = ReminderPresentTaskMock as PMTaskType
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate: null,
    })

    expect(type).toEqual('reminder')
  })

  it('should return type past due for a reminder task that is due yesterday', () => {
    const task = ReminderPastDueTaskMock as PMTaskType
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate: null,
    })

    expect(type).toEqual('pastDue')
  })

  it('should return type reminder for a reminder task that is due tomorrow', () => {
    const task = ReminderFutureTaskMock as PMTaskType
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate: null,
    })

    expect(type).toEqual('reminder')
  })

  it('should return type unfit instance for a recurring task with no scheduled date', () => {
    const task = {
      ...PMRecurringInstance,
      scheduledStatus: 'UNFIT_PAST_DUE',
    } as PMTaskType
    const scheduledDate = null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('unfitInstance')
  })

  it('should return stale for old task', () => {
    const task = PMStaleScheduledTaskMock as PMTaskType
    const scheduledDate = null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('stale')
  })

  it('should return type pending for newly created task', () => {
    const task = {
      ...PMUncompletedTaskMock,
      isAutoScheduled: true,
      needsReschedule: true,
    } as PMTaskType

    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate: null,
    })

    expect(type).toEqual('pending')
  })

  it('should return type notScheduled for a task with a different itemType', () => {
    const task = {
      ...PMUncompletedTaskMock,
      isAutoScheduled: true,
      itemType: PMItemType.project,
    } as PMTaskType
    const scheduledDate = task.scheduledStart
      ? DateTime.fromISO(task.scheduledStart)
      : null
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate,
    })

    expect(type).toEqual('notScheduled')
  })

  it('should return type unfit when isUnfit is true in task', () => {
    const task = {
      ...PMUncompletedTaskMock,
      isAutoScheduled: true,
      isUnfit: true,
    } as PMTaskType
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate: null,
    })

    expect(type).toEqual('unfit')
  })

  it('should return type notScheduled for task that is not scheduled', () => {
    const task = {
      ...PMUncompletedTaskMock,
      isAutoScheduled: true,
      itemType: PMItemType.task,
      isUnfit: false,
    } as PMTaskType
    const type = calculateScheduledType(task, {
      isAutoScheduled: true,
      isCompleted: false,
      scheduledDate: null,
    })

    expect(type).toEqual('notScheduled')
  })
})
