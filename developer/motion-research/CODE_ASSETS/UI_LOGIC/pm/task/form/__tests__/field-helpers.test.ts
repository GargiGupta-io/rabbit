import { AutoScheduleSetting, StatusType } from '@motion/shared/common'
import { type StatusSchema } from '@motion/zod/client'

import { isAutoScheduledToggleEnabled } from '../field-helpers'

describe('isAutoScheduledToggleEnabled()', () => {
  const backlogStatus: StatusSchema = {
    color: '#47C96B',
    id: 'backlogStatus',
    name: 'Backlog',
    isSystemStatus: false,
    sortPosition: '00005',
    workspaceId: 'abc',
    isResolvedStatus: false,
    isDefaultStatus: true,
    autoScheduleEnabled: false,
    deleted: false,

    type: StatusType.DEFAULT,
    autoScheduleSetting: AutoScheduleSetting.ENABLED,
  }
  const completedStatus: StatusSchema = {
    ...backlogStatus,
    id: 'completedStatus',
    name: 'Completed',
    type: StatusType.COMPLETED,
  }

  test('statuses with autoScheduleEnabled defined as true should return { disabled : false } with a tooltip text', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...backlogStatus,
          autoScheduleSetting: AutoScheduleSetting.ENABLED,
        },
        isAutoScheduled: true,
      })
    ).toEqual({
      disabled: false,
    })
  })

  test('statuses with autoScheduleEnabled defined as false and isAutoScheduled as false should return  { disabled: true } ', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...backlogStatus,
          autoScheduleSetting: AutoScheduleSetting.DISABLED,
        },
        isAutoScheduled: false,
      })
    ).toEqual({
      disabled: true,
      tooltipText: 'Auto-schedule for this status is disabled in Settings',
    })
  })

  test('statuses with autoScheduleEnabled defined as false and isAutoScheduled as true should return  { disabled: false } ', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...backlogStatus,
          autoScheduleSetting: AutoScheduleSetting.DISABLED,
        },
        isAutoScheduled: true,
      })
    ).toEqual({
      disabled: false,
    })
  })

  test('statuses that are completed should return { disabled: true }  with a tooltip text', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...completedStatus,
          autoScheduleSetting: AutoScheduleSetting.DISABLED,
        },
        isAutoScheduled: true,
      })
    ).toEqual({
      disabled: true,
      tooltipText: "Completed tasks can't be auto-scheduled",
    })
  })

  test('tasks that are recurring instances should return { disabled: true }  with a tooltip text', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...backlogStatus,
          autoScheduleSetting: AutoScheduleSetting.ENABLED,
        },
        type: 'RECURRING_INSTANCE',
        isAutoScheduled: true,
      })
    ).toEqual({
      disabled: true,
      tooltipText:
        'Edit the parent to toggle auto-scheduling for all instances',
    })
  })

  test('tasks that have a completedTime should return { disabled: true } with a tooltip text', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...backlogStatus,
          autoScheduleSetting: AutoScheduleSetting.ENABLED,
        },
        completedTime: '123',
        isAutoScheduled: true,
      })
    ).toEqual({
      disabled: true,
      tooltipText: "Completed tasks can't be auto-scheduled",
    })
  })

  test('tasks with a completed duration equal to their total duration { disabled: true } with a tooltip text', () => {
    expect(
      isAutoScheduledToggleEnabled({
        status: {
          ...backlogStatus,
          autoScheduleSetting: AutoScheduleSetting.ENABLED,
        },
        isAutoScheduled: true,
        completedDuration: 45,
        duration: 45,
      })
    ).toEqual({
      disabled: true,
      tooltipText:
        "Tasks with completed duration equal to their total duration can't be auto-scheduled",
    })
  })
})
