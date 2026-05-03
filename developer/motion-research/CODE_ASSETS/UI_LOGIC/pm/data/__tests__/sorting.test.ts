import { type TaskSchema } from '@motion/rpc-types'

import {
  defaultTaskSortFn,
  sortByCreatedTime,
  sortByDueDate,
  sortByEstimatedCompletionTime,
  sortByPriority,
  sortByScheduledEnd,
  sortByStartDate,
} from '../sorting'

describe('sortByCreatedTime', () => {
  it('should sort tasks by created time', () => {
    const tasks = [
      { id: '3', createdTime: '2024-01-03T00:00:00.000Z' },
      { id: '1', createdTime: '2024-01-01T00:00:00.000Z' },
      { id: '2', createdTime: '2024-01-02T16:14:30.335Z' },
    ] as TaskSchema[]

    const result = [...tasks].sort(sortByCreatedTime)

    expect(result).toEqual([
      { id: '1', createdTime: '2024-01-01T00:00:00.000Z' },
      { id: '2', createdTime: '2024-01-02T16:14:30.335Z' },
      { id: '3', createdTime: '2024-01-03T00:00:00.000Z' },
    ])
  })
})

describe('sortByDueDate', () => {
  it('sort by ASAP first, then due date, then no due date', () => {
    const tasks = [
      { id: '1', priorityLevel: 'MEDIUM', dueDate: null },
      { id: '2', priorityLevel: 'ASAP', dueDate: '2024-01-03T16:14:30.335Z' },
      { id: '3', priorityLevel: 'LOW', dueDate: '2024-01-01T00:00:00.000Z' },
    ] as TaskSchema[]

    const result = [...tasks].sort(sortByDueDate)

    expect(result).toEqual([
      { id: '2', priorityLevel: 'ASAP', dueDate: '2024-01-03T16:14:30.335Z' },
      { id: '3', priorityLevel: 'LOW', dueDate: '2024-01-01T00:00:00.000Z' },
      { id: '1', priorityLevel: 'MEDIUM', dueDate: null },
    ])
  })
})

describe('sortByEstimatedCompletionTime', () => {
  it('should sort tasks by estimated completion time', () => {
    const tasks = [
      { id: '1', estimatedCompletionTime: '2024-01-01T00:00:00.000Z' },
      { id: '2', estimatedCompletionTime: null },
      { id: '3', estimatedCompletionTime: '2024-01-03T16:14:30.335Z' },
    ] as TaskSchema[]

    const result = [...tasks].sort(sortByEstimatedCompletionTime)

    expect(result).toEqual([
      { id: '1', estimatedCompletionTime: '2024-01-01T00:00:00.000Z' },
      { id: '3', estimatedCompletionTime: '2024-01-03T16:14:30.335Z' },
      { id: '2', estimatedCompletionTime: null },
    ])
  })
})

describe('sortByScheduledEnd', () => {
  it('should sort tasks by scheduled end', () => {
    const tasks = [
      { id: '1', scheduledEnd: '2024-01-01T00:00:00.000Z' },
      { id: '2', scheduledEnd: null },
      { id: '3', scheduledEnd: '2024-01-03T16:14:30.335Z' },
    ] as TaskSchema[]

    const result = [...tasks].sort(sortByScheduledEnd)

    expect(result).toEqual([
      { id: '1', scheduledEnd: '2024-01-01T00:00:00.000Z' },
      { id: '3', scheduledEnd: '2024-01-03T16:14:30.335Z' },
      { id: '2', scheduledEnd: null },
    ])
  })
})

describe('defaultTaskSortFn', () => {
  it('should sort tasks by default sort function', () => {
    const tasks = [
      {
        id: '3',
        estimatedCompletionTime: '2024-01-03T16:14:30.335Z',
        scheduledEnd: '2024-01-03T16:14:30.335Z',
        createdTime: '2024-01-03T16:14:30.335Z',
      },
      {
        id: '1',
        estimatedCompletionTime: '2024-01-01T00:00:00.000Z',
        scheduledEnd: '2024-01-01T00:00:00.000Z',
        createdTime: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        estimatedCompletionTime: null,
        scheduledEnd: null,
        createdTime: '2024-01-02T00:00:00.000Z',
      },
    ] as TaskSchema[]

    const result = [...tasks].sort(defaultTaskSortFn)

    expect(result).toEqual([
      {
        id: '1',
        estimatedCompletionTime: '2024-01-01T00:00:00.000Z',
        scheduledEnd: '2024-01-01T00:00:00.000Z',
        createdTime: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        estimatedCompletionTime: null,
        scheduledEnd: null,
        createdTime: '2024-01-02T00:00:00.000Z',
      },
      {
        id: '3',
        estimatedCompletionTime: '2024-01-03T16:14:30.335Z',
        scheduledEnd: '2024-01-03T16:14:30.335Z',
        createdTime: '2024-01-03T16:14:30.335Z',
      },
    ])
  })
})

describe('sortByStartDate', () => {
  it('sort by ASAP first, then due date, then no due date', () => {
    const tasks = [
      { id: '1', priorityLevel: 'MEDIUM', startDate: null },
      { id: '2', priorityLevel: 'ASAP', startDate: '2024-01-03T16:14:30.335Z' },
      { id: '3', priorityLevel: 'LOW', startDate: '2024-01-01T00:00:00.000Z' },
      { id: '4', priorityLevel: 'HIGH', startDate: '2024-01-05T16:14:30.335Z' },
    ] as TaskSchema[]

    const result = [...tasks].sort(sortByStartDate)

    expect(result).toEqual([
      { id: '2', priorityLevel: 'ASAP', startDate: '2024-01-03T16:14:30.335Z' },
      { id: '3', priorityLevel: 'LOW', startDate: '2024-01-01T00:00:00.000Z' },
      { id: '4', priorityLevel: 'HIGH', startDate: '2024-01-05T16:14:30.335Z' },
      { id: '1', priorityLevel: 'MEDIUM', startDate: null },
    ])
  })
})

describe('sortByPriority', () => {
  it('sort by "ASAP", "HIGH", "MEDIUM", "LOW"', () => {
    const tasks = [
      { id: '1', priorityLevel: 'MEDIUM' },
      { id: '2', priorityLevel: 'ASAP' },
      { id: '3', priorityLevel: 'LOW' },
    ] as TaskSchema[]

    const result = [...tasks].sort(sortByPriority)

    expect(result).toEqual([
      { id: '2', priorityLevel: 'ASAP' },
      { id: '1', priorityLevel: 'MEDIUM' },
      { id: '3', priorityLevel: 'LOW' },
    ])
  })
})
