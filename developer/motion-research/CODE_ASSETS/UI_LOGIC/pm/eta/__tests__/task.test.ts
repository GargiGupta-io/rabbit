import { type StatusSchema, type TaskSchema } from '@motion/rpc-types'
import { StatusType } from '@motion/shared/common'

import { DateTime } from 'luxon'

import {
  getExtendedTaskDeadlineStatus,
  getTaskEtaTooltip,
  getTaskNoEtaReason,
  normalizeTaskDeadlineStatus,
} from '../task'

const DEFAULT_AUTO_SCHEDULE_RANGE = 92

const mockPluralize = (num: number, singular: string, plural: string) =>
  `${num} ${num === 1 ? singular : plural}`

describe('normalizeTaskDeadlineStatus - task', () => {
  it('should return at-risk if task has missed deadline', () => {
    const task = {
      deadlineStatus: 'missed-deadline',
    } as TaskSchema

    const result = normalizeTaskDeadlineStatus(task)

    expect(result).toEqual('missed-deadline')
  })

  it('should return at-risk if task is scheduled past deadline', () => {
    const task = {
      deadlineStatus: 'scheduled-past-deadline',
    } as TaskSchema

    const result = normalizeTaskDeadlineStatus(task)

    expect(result).toEqual('scheduled-past-deadline')
  })

  it('should return the same status if task is not at risk', () => {
    const task = {
      deadlineStatus: 'on-track',
    } as TaskSchema

    const result = normalizeTaskDeadlineStatus(task)

    expect(result).toEqual('on-track')
  })

  it('should return none if no undefined', () => {
    const task = {
      deadlineStatus: undefined,
    } as TaskSchema

    const result = normalizeTaskDeadlineStatus(task)

    expect(result).toEqual('none')
  })

  it('should return none if none provided', () => {
    const task = {} as TaskSchema

    const result = normalizeTaskDeadlineStatus(task)

    expect(result).toEqual('none')
  })
})

describe('getDeadlineStatusWithReason - task', () => {
  it('should return none if task is null', () => {
    const task = null

    const result = getExtendedTaskDeadlineStatus(task)

    expect(result).toEqual('none')
  })

  it('should return deadlineStatus if task is not null', () => {
    const task = {
      deadlineStatus: 'on-track',
    } as TaskSchema

    const result = getExtendedTaskDeadlineStatus(task)

    expect(result).toEqual('on-track')
  })

  it('should return none if no status provided', () => {
    const task = {
      statusId: 'blah',
      deadlineStatus: 'none',
    } as TaskSchema

    const result = getExtendedTaskDeadlineStatus(task)

    expect(result).toEqual('none')
  })

  it('should return completed if task is completed', () => {
    const CompletedStatus = {
      id: 'completed',
      type: StatusType.COMPLETED,
    } as StatusSchema

    const task = {
      deadlineStatus: 'none',
      completedTime: '2022-01-01T00:00:00Z',
      statusId: CompletedStatus.id,
    } as TaskSchema

    const result = getExtendedTaskDeadlineStatus(task, [CompletedStatus])

    expect(result).toEqual('completed')
  })

  it('should return canceled if task is canceled', () => {
    const CanceledStatus = {
      id: 'canceled',
      type: StatusType.CANCELED,
    } as StatusSchema

    const task = {
      deadlineStatus: 'none',
      statusId: CanceledStatus.id,
    } as TaskSchema

    const result = getExtendedTaskDeadlineStatus(task, [CanceledStatus])

    expect(result).toEqual('canceled')
  })
})

describe('getNoEtaReason - task', () => {
  it('returns nothing if eta is not none', () => {
    const task = {
      deadlineStatus: 'on-track',
    } as TaskSchema

    const result = getTaskNoEtaReason(task, [], DEFAULT_AUTO_SCHEDULE_RANGE)

    expect(result).toBeNull()
  })

  it('returns completed text if task is complete', () => {
    const task = {
      deadlineStatus: 'none',
      completedTime: '2022-01-01T00:00:00Z',
    } as TaskSchema

    const result = getTaskNoEtaReason(task, [], DEFAULT_AUTO_SCHEDULE_RANGE)

    expect(result).toEqual('Task complete')
  })

  it('returns not scheduled text if task is not scheduled', () => {
    const task = {
      deadlineStatus: 'none',
      isAutoScheduled: false,
      completedTime: null,
    } as TaskSchema

    const result = getTaskNoEtaReason(task, [], DEFAULT_AUTO_SCHEDULE_RANGE)

    expect(result).toEqual('No ETA because this task is not auto-scheduled')
  })

  it('returns not auto-schedulable text if task is not auto-schedulable', () => {
    const task = {
      deadlineStatus: 'none',
      scheduledStatus: 'UNFIT_SCHEDULABLE',
      completedTime: null,
    } as TaskSchema

    const result = getTaskNoEtaReason(task, [], DEFAULT_AUTO_SCHEDULE_RANGE)

    expect(result).toEqual(
      `No ETA because Motion only schedules tasks for the next ${DEFAULT_AUTO_SCHEDULE_RANGE} days. Once this task can be fit within the next ${DEFAULT_AUTO_SCHEDULE_RANGE} day period, it will be auto-scheduled.`
    )
  })

  it('returns canceled text if task is canceled', () => {
    const CanceledStatus = {
      id: 'canceled',
      type: StatusType.CANCELED,
    } as StatusSchema

    const task = {
      deadlineStatus: 'none',
      statusId: CanceledStatus.id,
    } as TaskSchema

    const result = getTaskNoEtaReason(
      task,
      [CanceledStatus],
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result).toEqual('Task canceled')
  })
})

describe('getTaskEtaTooltip', () => {
  const mockTask = {
    id: '1',
    type: 'NORMAL',
    estimatedCompletionTime: DateTime.fromISO(
      '2024-01-01T12:00:00.000Z'
    ).toISO(),
    dueDate: DateTime.fromISO('2024-01-02T12:00:00.000Z').toISO(),
  }

  it('should return no ETA reason when deadlineStatus is none and not auto scheduled', () => {
    const task = {
      ...mockTask,
      deadlineStatus: 'none',
      isAutoScheduled: false,
    } as TaskSchema
    const result = getTaskEtaTooltip(
      task,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result).toEqual({
      title: 'No ETA because this task is not auto-scheduled',
      action: undefined,
      etaText: undefined,
    })
  })

  it('should return missed deadline tooltip when deadlineStatus is missed-deadline', () => {
    const task = {
      ...mockTask,
      deadlineStatus: 'missed-deadline',
    } as TaskSchema
    const result = getTaskEtaTooltip(
      task,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('Missed deadline')
  })

  it('should return scheduled past deadline tooltip when deadlineStatus is scheduled-past-deadline', () => {
    const task = {
      ...mockTask,
      deadlineStatus: 'scheduled-past-deadline',
    } as TaskSchema
    const result = getTaskEtaTooltip(
      task,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('Scheduled past deadline')
  })

  it('should return on track tooltip when deadlineStatus is on-track', () => {
    const task = { ...mockTask, deadlineStatus: 'on-track' } as TaskSchema
    const result = getTaskEtaTooltip(
      task,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('On track')
  })

  it('should handle tasks with no estimatedCompletionTime', () => {
    const task = {
      ...mockTask,
      estimatedCompletionTime: null,
      deadlineStatus: 'on-track',
    } as TaskSchema
    const result = getTaskEtaTooltip(
      task,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('On track')
  })

  it('should handle tasks with no dueDate', () => {
    const task = {
      ...mockTask,
      dueDate: null,
      deadlineStatus: 'on-track',
    } as TaskSchema
    const result = getTaskEtaTooltip(
      task,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('On track')
  })
})
