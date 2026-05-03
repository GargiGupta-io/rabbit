import { createNoneId } from '@motion/shared/identifiers'
import {
  type GetTasksV2FilterWithOperatorsSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { createTaskFilterFn } from '../local'

const TEST_TIME = DateTime.fromISO('2024-04-28T00:00:00.000Z')

const TEST_TASK: TaskSchema = createTask({})

const TEST_USER_ID = 'u-1'

const TASK_FILTER_CONTEXT = {
  userId: TEST_USER_ID,
  canceledStatusIds: [],
}

describe('local filter', () => {
  it('should allow when only filtering by id', () => {
    const filter = createFilter({ ids: ['t-1'] })
    const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

    expect(fn(TEST_TASK)).toEqual(true)
  })

  it('should block by id', () => {
    const filter = createFilter({ ids: ['t-2'] })
    const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

    expect(fn(TEST_TASK)).toEqual(false)
  })

  it('should block by workspaceId', () => {
    const filter = createFilter({ workspaceIds: ['w-2'] })
    const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

    expect(fn(TEST_TASK)).toEqual(false)
  })

  it('should block by assignee', () => {
    const filter = createFilter({ assigneeUserIds: createIn(['w-2']) })
    const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

    expect(fn(TEST_TASK)).toEqual(false)
  })

  it('should block by status', () => {
    const filter = createFilter({ statusIds: createIn(['w-2']) })
    const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

    expect(fn(TEST_TASK)).toEqual(false)
  })

  it('should block by project', () => {
    const filter = createFilter({ projectIds: createIn(['w-2']) })
    const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

    expect(fn(TEST_TASK)).toEqual(false)
  })

  describe('completed filter', () => {
    it('should filter completed tasks', () => {
      const filter = createFilter({ completed: 'only' })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const completedTask = createTask({ completedTime: TEST_TIME.toISO() })
      const incompleteTask = createTask({ completedTime: null })

      expect(fn(completedTask)).toEqual(true)
      expect(fn(incompleteTask)).toEqual(false)
    })

    it('should filter incomplete tasks', () => {
      const filter = createFilter({ completed: 'exclude' })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const completedTask = createTask({ completedTime: TEST_TIME.toISO() })
      const incompleteTask = createTask({ completedTime: null })

      expect(fn(completedTask)).toEqual(false)
      expect(fn(incompleteTask)).toEqual(true)
    })

    it('default exclude when completed is undefined', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const completedTask = createTask({ completedTime: TEST_TIME.toISO() })
      const incompleteTask = createTask({ completedTime: null })

      expect(fn(completedTask)).toEqual(false)
      expect(fn(incompleteTask)).toEqual(true)
    })
  })

  describe('stageDefinitionIds filter', () => {
    it('should allow tasks created with matching stage', () => {
      const filter = createFilter({
        stageDefinitionIds: createIn([null, 's-1']),
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task1 = createTask({
        type: 'NORMAL',
        stageDefinitionId: null,
      })

      const task2 = createTask({
        type: 'NORMAL',
        stageDefinitionId: 's-1',
      })

      expect(fn(task1)).toEqual(true)
      expect(fn(task2)).toEqual(true)
    })

    it('should block tasks created by non-matching stage', () => {
      const filter = createFilter({ stageDefinitionIds: createIn(['s-2']) })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task1 = createTask({
        type: 'NORMAL',
        stageDefinitionId: null,
      })

      const task2 = createTask({
        type: 'NORMAL',
        stageDefinitionId: 's-1',
      })

      expect(fn(task1)).toEqual(false)
      expect(fn(task2)).toEqual(false)
    })

    it('should handle inverse filter', () => {
      const filter = createFilter({
        stageDefinitionIds: {
          operator: 'in',
          value: ['u-2'],
          inverse: true,
        },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task1 = createTask({
        type: 'NORMAL',
        stageDefinitionId: null,
      })

      const task2 = createTask({
        type: 'NORMAL',
        stageDefinitionId: 's-1',
      })

      expect(fn(task1)).toEqual(true)
      expect(fn(task2)).toEqual(true)
    })
  })

  describe('isUnvisitedStage filter', () => {
    it('should filter unvisited stages', () => {
      const filter = createFilter({ isUnvisitedStage: 'only' })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const unvisitedTask = createTask({
        type: 'NORMAL',
        isUnvisitedStage: true,
      })
      const visitedTask = createTask({
        type: 'NORMAL',
        isUnvisitedStage: false,
      })

      expect(fn(unvisitedTask)).toEqual(true)
      expect(fn(visitedTask)).toEqual(false)
    })

    it('should exclude unvisited stages', () => {
      const filter = createFilter({ isUnvisitedStage: 'exclude' })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const unvisitedTask = createTask({
        type: 'NORMAL',
        isUnvisitedStage: true,
      })
      const visitedTask = createTask({
        type: 'NORMAL',
        isUnvisitedStage: false,
      })

      expect(fn(unvisitedTask)).toEqual(false)
      expect(fn(visitedTask)).toEqual(true)
    })

    it('should include all stages when isUnvisitedStage is undefined', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const unvisitedTask = createTask({
        type: 'NORMAL',
        isUnvisitedStage: true,
      })
      const visitedTask = createTask({
        type: 'NORMAL',
        isUnvisitedStage: false,
      })

      expect(fn(unvisitedTask)).toEqual(true)
      expect(fn(visitedTask)).toEqual(true)
    })

    it('should only apply to NORMAL type tasks', () => {
      const filter = createFilter({ isUnvisitedStage: 'only' })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const chunkTask = createTask({
        type: 'CHUNK',
        isUnvisitedStage: false,
      })
      const recurringTask = createTask({
        type: 'RECURRING_INSTANCE',
        isUnvisitedStage: false,
      })

      expect(fn(chunkTask)).toEqual(true)
      expect(fn(recurringTask)).toEqual(true)
    })
  })

  describe('isBlocked filter', () => {
    it('should filter blocked tasks', () => {
      const filter = createFilter({
        isBlocked: { operator: 'equals', value: true },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const blockedTask = createTask({
        type: 'NORMAL',
        blockedByTaskIds: ['t-2'],
      })
      const nonBlockedTask = createTask({
        type: 'NORMAL',
      })

      expect(fn(blockedTask)).toEqual(true)
      expect(fn(nonBlockedTask)).toEqual(false)
    })

    it('should filter non-blocked tasks', () => {
      const filter = createFilter({
        isBlocked: { operator: 'equals', value: false },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const blockedTask = createTask({
        type: 'NORMAL',
        blockedByTaskIds: ['t-2'],
      })
      const nonBlockedTask = createTask({
        type: 'NORMAL',
      })

      expect(fn(blockedTask)).toEqual(false)
      expect(fn(nonBlockedTask)).toEqual(true)
    })

    it('should include all tasks when isBlocked is undefined', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const blockedTask = createTask({
        type: 'NORMAL',
        blockedByTaskIds: ['t-2'],
      })
      const nonBlockedTask = createTask({
        type: 'NORMAL',
      })

      expect(fn(blockedTask)).toEqual(true)
      expect(fn(nonBlockedTask)).toEqual(true)
    })

    it('should only apply to NORMAL type tasks', () => {
      const filter = createFilter({
        isBlocked: { operator: 'equals', value: true },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const chunkTask = createTask({
        type: 'CHUNK',
      })
      const recurringTask = createTask({
        type: 'RECURRING_INSTANCE',
      })

      expect(fn(chunkTask)).toEqual(true)
      expect(fn(recurringTask)).toEqual(true)
    })
  })

  describe('isBlocking filter', () => {
    it('should filter blocking tasks', () => {
      const filter = createFilter({
        isBlocking: { operator: 'equals', value: true },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const blockingTask = createTask({
        type: 'NORMAL',
        blockingTaskIds: ['t-2'],
      })
      const nonBlockingTask = createTask({
        type: 'NORMAL',
      })

      expect(fn(blockingTask)).toEqual(true)
      expect(fn(nonBlockingTask)).toEqual(false)
    })

    it('should filter non-blocking tasks', () => {
      const filter = createFilter({
        isBlocking: { operator: 'equals', value: false },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const blockingTask = createTask({
        type: 'NORMAL',
        blockingTaskIds: ['t-2'],
      })
      const nonBlockingTask = createTask({
        type: 'NORMAL',
      })

      expect(fn(blockingTask)).toEqual(false)
      expect(fn(nonBlockingTask)).toEqual(true)
    })

    it('should include all tasks when isBlocking is undefined', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const blockingTask = createTask({
        type: 'NORMAL',
        blockingTaskIds: ['t-2'],
      })
      const nonBlockingTask = createTask({
        type: 'NORMAL',
      })

      expect(fn(blockingTask)).toEqual(true)
      expect(fn(nonBlockingTask)).toEqual(true)
    })

    it('should only apply to NORMAL type tasks', () => {
      const filter = createFilter({
        isBlocking: { operator: 'equals', value: true },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const chunkTask = createTask({
        type: 'CHUNK',
      })
      const recurringTask = createTask({
        type: 'RECURRING_INSTANCE',
      })

      expect(fn(chunkTask)).toEqual(true)
      expect(fn(recurringTask)).toEqual(true)
    })
  })

  describe('hasAttachments filter', () => {
    it('should filter tasks with attachments', () => {
      const filter = createFilter({
        hasAttachments: { operator: 'equals', value: true },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const taskWithFiles = createTask({
        type: 'NORMAL',
        uploadedFileIds: ['f-2'],
      })
      const taskWithoutFiles = createTask({
        type: 'NORMAL',
      })

      expect(fn(taskWithFiles)).toEqual(true)
      expect(fn(taskWithoutFiles)).toEqual(false)
    })

    it('should filter tasks without attachments', () => {
      const filter = createFilter({
        hasAttachments: { operator: 'equals', value: false },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const taskWithFiles = createTask({
        type: 'NORMAL',
        uploadedFileIds: ['f-2'],
      })
      const taskWithoutFiles = createTask({
        type: 'NORMAL',
      })

      expect(fn(taskWithFiles)).toEqual(false)
      expect(fn(taskWithoutFiles)).toEqual(true)
    })

    it('should include all tasks when hasAttachments is undefined', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const taskWithFiles = createTask({
        type: 'NORMAL',
        uploadedFileIds: ['f-2'],
      })
      const taskWithoutFiles = createTask({
        type: 'NORMAL',
      })

      expect(fn(taskWithFiles)).toEqual(true)
      expect(fn(taskWithoutFiles)).toEqual(true)
    })

    it('should not apply to CHUNK type tasks', () => {
      const filter = createFilter({
        hasAttachments: { operator: 'equals', value: true },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const chunkTask = createTask({
        type: 'CHUNK',
      })

      expect(fn(chunkTask)).toEqual(true)
    })
  })

  describe('labels', () => {
    it('should filter labels (negative)', () => {
      const filter = createFilter({ labelIds: createIn(['w-2']) })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(false)
    })

    it('should filter labels (positive)', () => {
      const filter = createFilter({ labelIds: createIn(['l-1']) })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(true)
    })

    it('should filter multiple labels (positive)', () => {
      const filter = createFilter({ labelIds: createIn(['l-1', 'l-2']) })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(true)
    })

    it('should filter no label', () => {
      const task = createTask({ labelIds: [] })
      const filter = createFilter({
        labelIds: createIn([createNoneId(task.workspaceId)]),
      })

      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(task)).toEqual(true)
    })
  })

  describe('date fields', () => {
    it('should filter by eq date', () => {
      const filter = createFilter({
        createdTime: { operator: 'equals', value: TEST_TIME.toISO() },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(true)
    })

    it('should filter by range date', () => {
      const filter = createFilter({
        createdTime: {
          operator: 'range',
          value: {
            from: TEST_TIME.minus({ days: 1 }).toISO(),
            to: TEST_TIME.plus({ days: 1 }).toISO(),
          },
        },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(true)
    })

    it('should filter by empty', () => {
      const filter = createFilter({
        updatedTime: { operator: 'empty' },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(true)
    })

    it('should filter by defined', () => {
      const filter = createFilter({
        updatedTime: { operator: 'defined' },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      expect(fn(TEST_TASK)).toEqual(false)
    })
  })

  describe('user filter', () => {
    it('should handle @me', () => {
      const filter = createFilter({ createdByUserIds: createIn(['@me']) })
      const fn = createTaskFilterFn(filter, {
        userId: TEST_TASK.createdByUserId,
        canceledStatusIds: [],
      })

      expect(fn(TEST_TASK)).toEqual(true)
    })

    it('should handle @me with custom fields', () => {
      const filter = createFilter({
        customFields: [{ manager: createIn(['@me']) }],
      })
      const task = createTask({
        customFieldValues: {
          manager: { type: 'person', value: TEST_TASK.createdByUserId },
        },
      })
      const fn = createTaskFilterFn(filter, {
        userId: TEST_TASK.createdByUserId,
        canceledStatusIds: [],
      })

      expect(fn(task)).toEqual(true)
    })
  })

  describe('createdByUserIds filter', () => {
    it('should allow tasks created by matching user', () => {
      const filter = createFilter({ createdByUserIds: createIn(['u-1']) })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task = createTask({ createdByUserId: 'u-1' })

      expect(fn(task)).toEqual(true)
    })

    it('should block tasks created by non-matching user', () => {
      const filter = createFilter({ createdByUserIds: createIn(['u-2']) })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task = createTask({ createdByUserId: 'u-1' })

      expect(fn(task)).toEqual(false)
    })

    it('should handle inverse filter', () => {
      const filter = createFilter({
        createdByUserIds: {
          operator: 'in',
          value: ['u-2'],
          inverse: true,
        },
      })
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task = createTask({ createdByUserId: 'u-1' })

      expect(fn(task)).toEqual(true)
    })
  })

  describe('user filter with null userId', () => {
    it('should handle @me when userId is null', () => {
      const filter = createFilter({ createdByUserIds: createIn(['@me']) })
      const fn = createTaskFilterFn(filter, {
        userId: null,
        canceledStatusIds: [],
      })
      const task = createTask({ createdByUserId: 'u-1' })

      expect(fn(task)).toEqual(false)
    })

    it('should handle @me with custom fields when userId is null', () => {
      const filter = createFilter({
        customFields: [{ manager: createIn(['@me']) }],
      })
      const task = createTask({
        customFieldValues: {
          manager: { type: 'person', value: 'u-1' },
        },
      })
      const fn = createTaskFilterFn(filter, {
        userId: null,
        canceledStatusIds: [],
      })

      expect(fn(task)).toEqual(false)
    })

    it('should still handle regular user IDs when userId is null', () => {
      const filter = createFilter({ createdByUserIds: createIn(['u-1']) })
      const fn = createTaskFilterFn(filter, {
        userId: null,
        canceledStatusIds: [],
      })
      const task = createTask({ createdByUserId: 'u-1' })

      expect(fn(task)).toEqual(true)
    })
  })

  describe('canceled filter', () => {
    it('should filter out tasks with canceled status', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, {
        userId: TEST_USER_ID,
        canceledStatusIds: ['canceled-status-1'],
      })

      const canceledTask = createTask({ statusId: 'canceled-status-1' })
      const nonCanceledTask = createTask({ statusId: 'active-status-1' })

      expect(fn(canceledTask)).toEqual(false)
      expect(fn(nonCanceledTask)).toEqual(true)
    })

    it('should handle multiple canceled status IDs', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, {
        userId: TEST_USER_ID,
        canceledStatusIds: ['canceled-status-1', 'canceled-status-2'],
      })

      const task1 = createTask({ statusId: 'canceled-status-1' })
      const task2 = createTask({ statusId: 'canceled-status-2' })
      const activeTask = createTask({ statusId: 'active-status-1' })

      expect(fn(task1)).toEqual(false)
      expect(fn(task2)).toEqual(false)
      expect(fn(activeTask)).toEqual(true)
    })

    it('should not filter when no canceled status IDs are provided', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, TASK_FILTER_CONTEXT)

      const task = createTask({ statusId: 'any-status-1' })

      expect(fn(task)).toEqual(true)
    })

    it('should filter to only canceled tasks', () => {
      const filter = createFilter({ canceled: 'only' })
      const fn = createTaskFilterFn(filter, {
        userId: TEST_USER_ID,
        canceledStatusIds: ['canceled-status-1'],
      })

      const canceledTask = createTask({ statusId: 'canceled-status-1' })
      const nonCanceledTask = createTask({ statusId: 'non-canceled-status-1' })

      expect(fn(canceledTask)).toEqual(true)
      expect(fn(nonCanceledTask)).toEqual(false)
    })

    it('should filter non-canceled tasks', () => {
      const filter = createFilter({ canceled: 'exclude' })
      const fn = createTaskFilterFn(filter, {
        userId: TEST_USER_ID,
        canceledStatusIds: ['canceled-status-1'],
      })

      const canceledTask = createTask({ statusId: 'canceled-status-1' })
      const nonCanceledTask = createTask({ statusId: 'non-canceled-status-1' })

      expect(fn(canceledTask)).toEqual(false)
      expect(fn(nonCanceledTask)).toEqual(true)
    })

    it('default exclude when canceled is undefined', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, {
        userId: TEST_USER_ID,
        canceledStatusIds: ['canceled-status-1'],
      })

      const canceledTask = createTask({ statusId: 'canceled-status-1' })
      const nonCanceledTask = createTask({ statusId: 'non-canceled-status-1' })

      expect(fn(canceledTask)).toEqual(false)
      expect(fn(nonCanceledTask)).toEqual(true)
    })

    it('should not filter when status id does not match', () => {
      const filter = createFilter({})
      const fn = createTaskFilterFn(filter, {
        userId: TEST_USER_ID,
        canceledStatusIds: ['canceled-status-1'],
      })

      const task = createTask({ statusId: 'non-canceled-status-1' })

      expect(fn(task)).toEqual(true)
    })
  })
})

function createFilter(
  data: GetTasksV2FilterWithOperatorsSchema
): GetTasksV2FilterWithOperatorsSchema {
  return data
}

function createIn<T extends string | null>(values: T[]) {
  return {
    operator: 'in' as const,
    value: values,
  }
}

function createTask(data: Partial<TaskSchema>): TaskSchema {
  return Object.assign(
    {},
    {
      id: 't-1',
      assigneeUserId: 'u-1',
      statusId: 's-1',
      archivedTime: null,
      blockingTaskIds: [],
      blockedByTaskIds: [],
      chunkIds: [],
      completedDuration: 0,
      completedTime: null,
      createdByUserId: 'u-1',
      createdTime: TEST_TIME.toISO(),
      customFieldValues: {},
      deadlineType: 'SOFT',
      description: '',
      dueDate: null,
      duration: null,
      ignoreWarnOnPastDue: true,
      isAutoScheduled: true,
      isBusy: false,
      isFixedTimeTask: false,
      isFutureSchedulable: false,
      isUnfit: false,
      labelIds: ['l-1'],
      manuallyStarted: false,
      minimumDuration: null,
      name: 'My task',
      needsReschedule: false,
      priorityLevel: 'MEDIUM',
      projectId: null,
      rank: null,
      scheduledEnd: null,
      scheduledStart: null,
      type: 'NORMAL',
      scheduleId: null,
      scheduleOverridden: false,
      snoozeUntil: null,
      startDate: null,
      updatedTime: null,
      workspaceId: 'w-1',
    },
    data
  ) as TaskSchema
}
