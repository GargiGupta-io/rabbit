import {
  PMItemType,
  type PMTaskType,
  type RecurringTask,
} from '@motion/rpc-types/legacy'

import { renderHook } from '@testing-library/react'

import { PMScheduledTaskMock } from '../../mocks'
import {
  getScheduledChunkIds,
  isRecurringTaskParent,
  shouldWarnIfPastDueForRecurringFrequency,
  useChunkInfo,
} from '../task-utils'

describe('isRecurringTask', () => {
  it('should not warn if recur freq is daily', () => {
    expect(shouldWarnIfPastDueForRecurringFrequency('daily')).toBeFalsy()
  })

  it('should not warn if recur freq is weekly', () => {
    expect(shouldWarnIfPastDueForRecurringFrequency('weekly')).toBeFalsy()
  })

  it('should warn if recur freq is biweekly', () => {
    expect(shouldWarnIfPastDueForRecurringFrequency('biweekly')).toBeTruthy()
  })

  it('should warn if recur freq is monthly', () => {
    expect(shouldWarnIfPastDueForRecurringFrequency('monthly')).toBeTruthy()
  })

  it('should warn if recur freq is quarterly', () => {
    expect(shouldWarnIfPastDueForRecurringFrequency('quarterly')).toBeTruthy()
  })

  it('should return true if the task is recurring', () => {
    const task = {
      itemType: PMItemType.recurringTask,
    } as RecurringTask

    expect(isRecurringTaskParent(task)).toBe(true)
  })

  it('should return false if the task is not recurring', () => {
    const task = {
      itemType: PMItemType.task,
    } as PMTaskType

    expect(isRecurringTaskParent(task)).toBe(false)
  })
})

describe('useChunkInfo', () => {
  const baseTask = {
    id: 'base',
    name: 'BaseTask',
    createdByUserId: 'user1',
    createdTime: '2023-10-10T12:00:00',
    workspaceId: 'workspace1',
    minimumDuration: null,
    priorityLevel: 'ASAP',
    isAutoScheduled: true,
    statusId: '',
  } satisfies PMTaskType

  it('should return default values when task and parentChunkTask are undefined', () => {
    const { result } = renderHook(() => useChunkInfo())

    expect(result.current.chunkNumber).toBe(0)
    expect(result.current.chunkTotal).toBe(0)
    expect(result.current.chunks).toEqual([])
  })

  it('should return default values when parentChunkTask has no chunks', () => {
    const parentChunkTask = { chunks: [] }
    const { result } = renderHook(() =>
      useChunkInfo(undefined, parentChunkTask)
    )

    expect(result.current.chunkNumber).toBe(0)
    expect(result.current.chunkTotal).toBe(0)
    expect(result.current.chunks).toEqual([])
  })

  it('should correctly calculate chunkNumber, chunkTotal, and chunks', () => {
    const parentChunkTask = {
      chunks: [
        { ...baseTask, id: 'chunk2', scheduledStart: '2023-11-23T10:00:00' },
        { ...baseTask, id: 'chunk3', scheduledStart: '2023-11-24T12:00:00' },
        { ...baseTask, id: 'chunk1', scheduledStart: '2023-11-22T08:00:00' },
      ],
    }
    const task = { id: 'chunk2' }
    const { result } = renderHook(() => useChunkInfo(task, parentChunkTask))

    expect(result.current.chunkNumber).toBe(2)
    expect(result.current.chunkTotal).toBe(3)

    // test the sorting
    expect(result.current.chunks[0].id).toBe('chunk1')
    expect(result.current.chunks[1].id).toBe('chunk2')
    expect(result.current.chunks[2].id).toBe('chunk3')
  })
})

describe(`getScheduledChunkIds`, () => {
  it('should return an empty array if task has no chunks', () => {
    const task = {
      ...PMScheduledTaskMock,
      chunks: [],
    }

    const result = getScheduledChunkIds(task)

    expect(result).toEqual([])
  })

  it('should return an array of scheduled chunk ids ', () => {
    const task = {
      ...PMScheduledTaskMock,
      chunks: [
        {
          ...PMScheduledTaskMock,
          id: 'chunk1',
          scheduledStart: '2023-12-01T08:00:00.000Z',
        },
        { ...PMScheduledTaskMock, id: 'chunk2', scheduledStart: null },
        {
          ...PMScheduledTaskMock,
          id: 'chunk3',
          scheduledStart: '2023-12-02T08:00:00.000Z',
        },
        { ...PMScheduledTaskMock, id: 'chunk4', scheduledStart: null },
      ],
    } as PMTaskType

    const result = getScheduledChunkIds(task)

    expect(result).toEqual(['chunk1', 'chunk3'])
  })
})
