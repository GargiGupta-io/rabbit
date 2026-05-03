import { type PMTaskType } from '@motion/rpc-types/legacy'
import {
  MAX_TASK_DURATION,
  NO_DURATION,
  SHORT_TASK_DURATION,
} from '@motion/shared/pm'
import { assert } from '@motion/utils/assert'
import {
  type RecurringInstanceSchema,
  type RecurringTaskSchema,
  type StatusSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  mockChunkTask,
  mockMeetingTask,
  mockNormalTask,
  mockRecurringInstanceTask,
  mockSchedulingTask,
  RecurringTaskSchemaMock,
  TaskSchemaMock,
} from '../../../mocks'
import { RecurringInstanceMock } from '../../../mocks/pm/recurring-instance'
import {
  canAddTime,
  canBeArchived,
  canCancelTask,
  canCompleteTask,
  canCreateProjectFromTask,
  canDoASAP,
  canDoLater,
  canDuplicateTask,
  canEditTaskDeadline,
  canEditTaskStartDate,
  canHaveBlockers,
  canSaveAsTemplate,
  canStartTask,
  canStopTask,
  canTaskBeExtended,
  getChunkIdsForTask,
  getRemainingDuration,
  getTaskParentId,
  isChunkable,
  isTaskFutureSchedulable,
  isTaskSchema,
  isTaskUnfit,
  type RecurrenceInfo,
} from '../helpers'

describe('isTaskSchema', () => {
  it('should return true if the task is normal, chunk or instance', () => {
    expect(isTaskSchema({ type: 'CHUNK' } as TaskSchema)).toBe(true)
    expect(isTaskSchema({ type: 'NORMAL' } as TaskSchema)).toBe(true)
    expect(isTaskSchema({ type: 'RECURRING_INSTANCE' } as TaskSchema)).toBe(
      true
    )
  })

  it('should return false when null, undefined or recurring task', () => {
    expect(isTaskSchema(null)).toBe(false)
    expect(isTaskSchema(undefined)).toBe(false)
    expect(
      isTaskSchema({ type: 'RECURRING_TASK' } as RecurringTaskSchema)
    ).toBe(false)
  })
})

describe('isTaskUnfit()', () => {
  test('should return true if task is unfit', () => {
    const unfitTask = {
      isUnfit: true,
      scheduledStart: '2024-01-19T12:00:00Z',
      scheduledEnd: '2024-01-19T14:00:00Z',
    }

    const result = isTaskUnfit(unfitTask)

    expect(result).toBe(true)
  })

  test('should return true if scheduledEnd is falsy', () => {
    const taskWithFalsyEnd = {
      isUnfit: false,
      scheduledStart: '2024-01-19T12:00:00Z',
      scheduledEnd: undefined,
    }

    const result = isTaskUnfit(taskWithFalsyEnd)

    expect(result).toBe(true)
  })

  test('should return true if scheduledStart is falsy', () => {
    const taskWithFalsyStart = {
      isUnfit: false,
      scheduledStart: undefined,
      scheduledEnd: '2024-01-19T14:00:00Z',
    }

    const result = isTaskUnfit(taskWithFalsyStart)

    expect(result).toBe(true)
  })

  test('should return true if both scheduledStart and scheduledEnd are falsy', () => {
    const taskWithFalsyStartAndEnd = {
      isUnfit: false,
      scheduledStart: undefined,
      scheduledEnd: undefined,
    }

    const result = isTaskUnfit(taskWithFalsyStartAndEnd)

    expect(result).toBe(true)
  })

  test('should return false if task is fit', () => {
    const fitTask = {
      isUnfit: false,
      scheduledStart: '2024-01-19T12:00:00Z',
      scheduledEnd: '2024-01-19T14:00:00Z',
    }

    const result = isTaskUnfit(fitTask)

    expect(result).toBe(false)
  })
})

describe('isChunkable()', () => {
  test('should return true if task has a minimumDuration', () => {
    const result = isChunkable({ minimumDuration: 1 })

    expect(result).toBe(true)
  })

  test('should return false if task has no minimumDuration', () => {
    const result = isChunkable({ minimumDuration: NO_DURATION })

    expect(result).toBe(false)
  })
})

describe('isTaskFutureSchedulable', () => {
  it('should return true if scheduledStatus is UNFIT_SCHEDULABLE', () => {
    const task1 = { scheduledStatus: 'UNFIT_SCHEDULABLE' } as PMTaskType

    expect(isTaskFutureSchedulable(task1)).toBe(true)
  })

  it('should return false if scheduledStatus is not UNFIT_SCHEDULABLE', () => {
    const task2 = { scheduledStatus: 'FIT_SCHEDULABLE' }
    const task3 = { scheduledStatus: 'SCHEDULED' }
    const task4 = { scheduledStatus: 'UNSCHEDULED' }

    // @ts-expect-error - testing the function handling bad data
    expect(isTaskFutureSchedulable(task2)).toBe(false)
    // @ts-expect-error - testing the function handling bad data
    expect(isTaskFutureSchedulable(task3)).toBe(false)
    // @ts-expect-error - testing the function handling bad data
    expect(isTaskFutureSchedulable(task4)).toBe(false)
  })
})

describe('getTaskParentId', () => {
  test('returns null if task is null', () => {
    expect(getTaskParentId(null)).toBeNull()
  })

  test('returns null if task is undefined', () => {
    expect(getTaskParentId(undefined)).toBeNull()
  })

  test('returns parentChunkTaskId if task type is CHUNK', () => {
    const task = {
      type: 'CHUNK',
      parentChunkTaskId: 'chunk_parent_id',
    } as TaskSchema

    expect(getTaskParentId(task)).toBe('chunk_parent_id')
  })

  test('returns parentRecurringTaskId if task type is RECURRING_INSTANCE', () => {
    const task = {
      type: 'RECURRING_INSTANCE',
      parentRecurringTaskId: 'recurring_parent_id',
    } as TaskSchema

    expect(getTaskParentId(task)).toBe('recurring_parent_id')
  })
})

describe('getChunkIdsForTask()', () => {
  it('returns [] if task is null or undefined', () => {
    expect(getChunkIdsForTask(null)).toEqual([])
    expect(getChunkIdsForTask(undefined)).toEqual([])
  })

  it('returns [] for chunks and recurring tasks', () => {
    expect(
      getChunkIdsForTask({
        type: 'CHUNK',
      } as TaskSchema)
    ).toEqual([])
    expect(
      getChunkIdsForTask({
        type: 'RECURRING_TASK',
      } as RecurringTaskSchema)
    ).toEqual([])
  })

  it('returns the list of chunkIds for normal and instance tasks', () => {
    expect(
      getChunkIdsForTask({
        type: 'NORMAL',
        chunkIds: [] as string[],
      } as TaskSchema)
    ).toEqual([])

    expect(
      getChunkIdsForTask({
        type: 'NORMAL',
        chunkIds: ['123', '456'],
      } as TaskSchema)
    ).toEqual(['123', '456'])

    expect(
      getChunkIdsForTask({
        type: 'RECURRING_INSTANCE',
        chunkIds: ['123', '456'],
      } as TaskSchema)
    ).toEqual(['123', '456'])
  })
})

describe('canTaskBeExtended', () => {
  const baseTask = {
    id: 'task1',
    type: 'RECURRING_INSTANCE',
    name: 'Sample Task',
    priorityLevel: 'LOW',
    createdTime: '2023-10-10T12:00:00',
    workspaceId: 'workspace1',
    minimumDuration: null,
    createdByUserId: 'user1',
    isAutoScheduled: true,
    statusId: '123',
  } as TaskSchema

  const futureDate = '2023-08-05'
  const pastDate = '2023-07-25'
  const currentDate = '2023-08-01'

  beforeEach(() => {
    const frozenTime = new Date(currentDate)
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  it('should return true for a non-recurring task with no endDate or dueDate', () => {
    const task = {
      ...baseTask,
      endDate: null,
      dueDate: null,
    } as TaskSchema
    const recurringInfo = null

    expect(canTaskBeExtended(task, recurringInfo)).toBe(true)
  })

  it('should return true for a non-recurring task with a dueDate but no endDate', () => {
    const task = {
      ...baseTask,
      endDate: null,
      dueDate: futureDate,
    } as TaskSchema
    const recurringInfo = null

    expect(canTaskBeExtended(task, recurringInfo)).toBe(true)
  })

  it('should return true for a non-recurring task with an endDate but no dueDate', () => {
    const task = {
      ...baseTask,
      endDate: futureDate,
      dueDate: null,
    } as TaskSchema
    const recurringInfo = null

    expect(canTaskBeExtended(task, recurringInfo)).toBe(true)
  })

  it('should return true for a non-recurring task with dueDate before endDate', () => {
    const task = {
      ...baseTask,
      endDate: futureDate,
      dueDate: pastDate,
    } as TaskSchema
    const recurringInfo = null

    expect(canTaskBeExtended(task, recurringInfo)).toBe(true)
  })

  it('should return false for a recurring task with weekly frequency', () => {
    const task = {
      ...baseTask,
      endDate: null,
      dueDate: null,
    } as TaskSchema

    const recurringInfo = {
      frequency: 'WEEKLY',
      days: ['MO'],
    } satisfies RecurrenceInfo

    expect(canTaskBeExtended(task, recurringInfo)).toBe(false)
  })

  it('should return true for a recurring task with a non-weekly frequency', () => {
    const task = {
      ...baseTask,
      endDate: null,
      dueDate: null,
    } as TaskSchema
    const recurringInfo = {
      frequency: 'DAILY',
      days: ['MO'],
    } satisfies RecurrenceInfo

    expect(canTaskBeExtended(task, recurringInfo)).toBe(true)
  })

  it('should return true for a task with no endDate and dueDate', () => {
    const task = {
      ...baseTask,
      endDate: null,
      dueDate: null,
    } as TaskSchema
    const recurringInfo = {
      frequency: 'MONTHLY',
      days: ['MO'],
    } satisfies RecurrenceInfo

    expect(canTaskBeExtended(task, recurringInfo)).toBe(true)
  })

  it('should return false for a task with endDate before dueDate', () => {
    const task = {
      ...baseTask,
      endDate: pastDate,
      dueDate: futureDate,
    } as TaskSchema
    const recurringInfo = {
      frequency: 'MONTHLY',
      days: ['MO'],
    } satisfies RecurrenceInfo

    expect(canTaskBeExtended(task, recurringInfo)).toBe(false)
  })

  it('should return false for an undefined task', () => {
    const task = undefined
    const recurringInfo = {
      frequency: 'MONTHLY',
      days: ['MO'],
    } satisfies RecurrenceInfo

    expect(canTaskBeExtended(task, recurringInfo)).toBe(false)
  })
})

describe('canEditTaskStartDate', () => {
  it('should return true if task is not a recurring instance', () => {
    const task = {
      ...TaskSchemaMock,
    }

    expect(canEditTaskStartDate(task)).toBe(true)
  })

  it('should return true if task is a recurring task', () => {
    const recurringTask = {
      ...RecurringTaskSchemaMock,
      type: 'RECURRING_TASK',
    } as RecurringTaskSchema

    expect(canEditTaskStartDate(recurringTask)).toBe(true)
  })

  it('should return false if task is a short task', () => {
    const shortTask = {
      ...TaskSchemaMock,
      duration: SHORT_TASK_DURATION,
    } as TaskSchema

    expect(canEditTaskStartDate(shortTask)).toBe(false)
  })

  it('should return false if task is completed', () => {
    const completedTask = {
      ...TaskSchemaMock,
      completedTime: '2024-06-04T06:59:00.000Z',
    } as TaskSchema

    expect(canEditTaskStartDate(completedTask)).toBe(false)
  })

  it('should return false if task is a chunk', () => {
    const chunkTask = {
      ...TaskSchemaMock,
      type: 'CHUNK',
      parentChunkTaskId: 'parentChunkTaskId',
    } as TaskSchema

    expect(canEditTaskStartDate(chunkTask)).toBe(false)
  })

  it('should return false if task is a recurring instance', () => {
    const recurringInstance = {
      ...RecurringInstanceMock,
    } as RecurringInstanceSchema

    expect(canEditTaskStartDate(recurringInstance)).toBe(false)
  })
})

describe('canEditTaskDeadline', () => {
  // all the same conditions as canEditTaskStartDate except recurring task schema is false and instance is true
  it('should return true if task is not a recurring instance', () => {
    const task = {
      ...TaskSchemaMock,
    }

    expect(canEditTaskDeadline(task)).toBe(true)
  })

  it('should return false if task is a recurring task', () => {
    const recurringTask = {
      ...RecurringTaskSchemaMock,
      type: 'RECURRING_TASK',
    } as RecurringTaskSchema

    expect(canEditTaskDeadline(recurringTask)).toBe(false)
  })

  it('should return false if task is a short task', () => {
    const shortTask = {
      ...TaskSchemaMock,
      duration: SHORT_TASK_DURATION,
    } as TaskSchema

    expect(canEditTaskDeadline(shortTask)).toBe(false)
  })

  it('should return false if task is completed', () => {
    const completedTask = {
      ...TaskSchemaMock,
      completedTime: '2024-06-04T06:59:00.000Z',
    } as TaskSchema

    expect(canEditTaskDeadline(completedTask)).toBe(false)
  })

  it('should return false if task is a chunk', () => {
    const chunkTask = {
      ...TaskSchemaMock,
      type: 'CHUNK',
      parentChunkTaskId: 'parentChunkTaskId',
    } as TaskSchema

    expect(canEditTaskDeadline(chunkTask)).toBe(false)
  })

  it('should return false if task is a recurring instance', () => {
    const recurringInstance = {
      ...RecurringInstanceMock,
    } as RecurringInstanceSchema

    expect(canEditTaskDeadline(recurringInstance)).toBe(true)
  })
})

describe('canSaveAsTemplate', () => {
  it('should return false for null or undefined task', () => {
    expect(canSaveAsTemplate(null)).toBe(false)
    expect(canSaveAsTemplate(undefined)).toBe(false)
  })

  it('should return false for non-NORMAL task types', () => {
    expect(canSaveAsTemplate(mockRecurringInstanceTask)).toBe(false)
  })

  it('should return false for meeting tasks', () => {
    expect(canSaveAsTemplate(mockMeetingTask)).toBe(false)
  })

  it('should return false for scheduling tasks', () => {
    expect(canSaveAsTemplate(mockSchedulingTask)).toBe(false)
  })

  it('should return true for normal tasks', () => {
    expect(canSaveAsTemplate(mockNormalTask)).toBe(true)
  })
})

describe('canDuplicateTask', () => {
  it('should return false for null/undefined task', () => {
    expect(canDuplicateTask(null)).toBe(false)
    expect(canDuplicateTask(undefined)).toBe(false)
  })

  it('should return false for non-NORMAL task types', () => {
    expect(canDuplicateTask(mockRecurringInstanceTask)).toBe(false)
  })

  it('should return false for meeting tasks', () => {
    expect(canDuplicateTask(mockMeetingTask)).toBe(false)
  })

  it('should return false for scheduling tasks', () => {
    expect(canDuplicateTask(mockSchedulingTask)).toBe(false)
  })

  it('should return true for normal tasks', () => {
    expect(canDuplicateTask(mockNormalTask)).toBe(true)
  })
})

describe('canCancelTask', () => {
  const mockStatus = { id: 'status-1', type: null } as StatusSchema
  const mockCanceledStatus = {
    id: 'status-2',
    type: 'CANCELED',
  } as StatusSchema

  it('should return false for null/undefined task', () => {
    expect(canCancelTask(null, { status: mockStatus })).toBe(false)
    expect(canCancelTask(undefined, { status: mockStatus })).toBe(false)
  })

  it('should return false for CHUNK task types', () => {
    expect(canCancelTask(mockChunkTask, { status: mockStatus })).toBe(false)
  })

  it('should return false for meeting tasks', () => {
    expect(canCancelTask(mockMeetingTask, { status: mockStatus })).toBe(false)
  })

  it('should return false for scheduling tasks', () => {
    expect(canCancelTask(mockSchedulingTask, { status: mockStatus })).toBe(
      false
    )
  })

  it('should return false for completed tasks', () => {
    const completedTask = {
      ...mockNormalTask,
      completedTime: new Date().toISOString(),
    }

    expect(canCancelTask(completedTask, { status: mockStatus })).toBe(false)
  })

  it('should return false for archived tasks', () => {
    const archivedTask = {
      ...mockNormalTask,
      archivedTime: new Date().toISOString(),
    }

    expect(canCancelTask(archivedTask, { status: mockStatus })).toBe(false)
  })

  it('should return false for already canceled tasks', () => {
    expect(canCancelTask(mockNormalTask, { status: mockCanceledStatus })).toBe(
      false
    )
  })

  it('should return true for normal, active tasks', () => {
    expect(canCancelTask(mockNormalTask, { status: mockStatus })).toBe(true)
  })

  it('should return true for instance tasks', () => {
    expect(
      canCancelTask(mockRecurringInstanceTask, { status: mockStatus })
    ).toBe(true)
  })

  it('should return true for recurring tasks', () => {
    expect(canCancelTask(RecurringTaskSchemaMock, { status: mockStatus })).toBe(
      true
    )
  })
})

describe('canBeArchived()', () => {
  it('should return false for null/undefined task', () => {
    expect(canBeArchived(null)).toBe(false)
    expect(canBeArchived(undefined)).toBe(false)
  })

  it('should return false for chunk or meeting tasks, and true for a typical recurring instance', () => {
    expect(canBeArchived(mockRecurringInstanceTask)).toBe(true)
    expect(canBeArchived(mockChunkTask)).toBe(false)
    expect(canBeArchived(mockMeetingTask)).toBe(false)
  })

  it('should return true for auto-scheduled normal or instance tasks that are not meeting/chunk tasks', () => {
    expect(canBeArchived({ ...mockNormalTask, isAutoScheduled: true })).toBe(
      true
    )
    expect(
      canBeArchived({ ...mockRecurringInstanceTask, isAutoScheduled: true })
    ).toBe(true)
  })

  it('should return true for non auto-scheduled normal or instance tasks', () => {
    expect(canBeArchived({ ...mockNormalTask, isAutoScheduled: false })).toBe(
      true
    )
    expect(
      canBeArchived({ ...mockRecurringInstanceTask, isAutoScheduled: false })
    ).toBe(true)
  })
})

describe('canHaveBlockers()', () => {
  it('returns false for null/undefined task', () => {
    expect(canHaveBlockers(null)).toBe(false)
    expect(canHaveBlockers(undefined)).toBe(false)
  })

  it('returns false for recurring or chunk', () => {
    expect(canHaveBlockers(RecurringTaskSchemaMock)).toBe(false)
    expect(canHaveBlockers(mockRecurringInstanceTask)).toBe(false)
    expect(canHaveBlockers(mockChunkTask)).toBe(false)
  })

  it('returns false for archived normal tasks', () => {
    expect(
      canHaveBlockers({
        ...mockNormalTask,
        archivedTime: DateTime.now().toISO(),
      })
    ).toBe(false)
  })

  it('returns false for tasks without a project', () => {
    expect(canHaveBlockers({ ...mockNormalTask, projectId: null })).toBe(false)
  })

  it('returns true for normal tasks in a project', () => {
    expect(
      canHaveBlockers({
        ...mockNormalTask,
        archivedTime: null,
        projectId: 'project-1',
      })
    ).toBe(true)
  })
})

describe('canDoASAP()', () => {
  it('returns false for null/undefined task', () => {
    expect(canDoASAP(null)).toBe(false)
    expect(canDoASAP(undefined)).toBe(false)
  })

  it('returns false for recurring', () => {
    expect(canDoASAP(mockRecurringInstanceTask)).toBe(false)
    expect(canDoASAP(RecurringTaskSchemaMock)).toBe(false)
  })

  it('returns false for short tasks', () => {
    expect(
      canDoASAP({ ...mockNormalTask, duration: SHORT_TASK_DURATION })
    ).toBe(false)
  })

  it('returns false for ASAP tasks', () => {
    expect(canDoASAP({ ...mockNormalTask, priorityLevel: 'ASAP' })).toBe(false)
  })

  it('returns false for completed tasks', () => {
    expect(
      canDoASAP({ ...mockNormalTask, completedTime: DateTime.now().toISO() })
    ).toBe(false)
  })

  it('returns false for non scheduled tasks', () => {
    expect(canDoASAP({ ...mockNormalTask, isAutoScheduled: false })).toBe(false)
  })

  it('returns true for uncompleted tasks', () => {
    expect(
      canDoASAP({
        ...mockNormalTask,
        completedTime: null,
        duration: 60,
        priorityLevel: 'MEDIUM',
      })
    ).toBe(true)
  })

  it('returns true for uncompleted chunk', () => {
    expect(
      canDoASAP({
        ...mockChunkTask,
        completedTime: null,
        duration: 30,
        priorityLevel: 'MEDIUM',
      })
    ).toBe(true)
  })
})

describe('canDoLater()', () => {
  it('returns false for null/undefined task', () => {
    expect(canDoLater(null)).toBe(false)
    expect(canDoLater(undefined)).toBe(false)
  })

  it('returns false for recurring task', () => {
    expect(canDoLater(RecurringTaskSchemaMock)).toBe(false)
  })

  it('returns false for short tasks', () => {
    expect(
      canDoLater({ ...mockNormalTask, duration: SHORT_TASK_DURATION })
    ).toBe(false)
  })

  it('returns false for completed tasks', () => {
    expect(
      canDoLater({ ...mockNormalTask, completedTime: DateTime.now().toISO() })
    ).toBe(false)
  })

  it('returns false for non scheduled tasks', () => {
    expect(canDoLater({ ...mockNormalTask, isAutoScheduled: false })).toBe(
      false
    )
  })

  it('returns true for uncompleted tasks', () => {
    expect(
      canDoLater({
        ...mockNormalTask,
        completedTime: null,
        duration: 60,
      })
    ).toBe(true)
  })

  it('returns true for uncompleted chunk', () => {
    expect(
      canDoLater({
        ...mockChunkTask,
        completedTime: null,
        duration: 30,
      })
    ).toBe(true)
  })

  it('returns true for uncompleted instance', () => {
    expect(
      canDoLater({
        ...mockRecurringInstanceTask,
        completedTime: null,
        duration: 30,
      })
    ).toBe(true)
  })
})

describe('canAddTime()', () => {
  it('returns false for null/undefined task', () => {
    expect(canAddTime(null)).toBe(false)
    expect(canAddTime(undefined)).toBe(false)
  })

  it('returns false for short tasks', () => {
    expect(
      canAddTime({ ...mockNormalTask, duration: SHORT_TASK_DURATION })
    ).toBe(false)
  })

  it('returns false for completed tasks', () => {
    expect(
      canAddTime({ ...mockNormalTask, completedTime: DateTime.now().toISO() })
    ).toBe(false)
  })

  it('returns false for tasks having max duration already', () => {
    expect(canAddTime({ ...mockNormalTask, duration: MAX_TASK_DURATION })).toBe(
      false
    )
  })

  it('returns false for tasks within 15 min of the max duration', () => {
    expect(
      canAddTime({ ...mockNormalTask, duration: MAX_TASK_DURATION - 10 })
    ).toBe(false)
  })

  it('returns true for uncompleted tasks', () => {
    expect(
      canAddTime({
        ...mockNormalTask,
        completedTime: null,
        duration: 60,
      })
    ).toBe(true)
  })

  it('returns true for uncompleted chunk', () => {
    expect(
      canAddTime({
        ...mockChunkTask,
        completedTime: null,
        duration: 30,
      })
    ).toBe(true)
  })

  it('returns true for uncompleted instance', () => {
    expect(
      canAddTime({
        ...mockRecurringInstanceTask,
        completedTime: null,
        duration: 30,
      })
    ).toBe(true)
  })

  it('returns true for recurring', () => {
    expect(
      canAddTime({
        ...RecurringTaskSchemaMock,
        duration: 30,
      })
    ).toBe(true)
  })
})

describe('canCreateProjectFromTask()', () => {
  it('returns false for null/undefined task', () => {
    expect(canCreateProjectFromTask(null)).toBe(false)
    expect(canCreateProjectFromTask(undefined)).toBe(false)
  })

  it('returns false for chunk, and recurring tasks', () => {
    expect(canCreateProjectFromTask(mockChunkTask)).toBe(false)
    expect(canCreateProjectFromTask(mockRecurringInstanceTask)).toBe(false)
    expect(canCreateProjectFromTask(RecurringTaskSchemaMock)).toBe(false)
  })

  it('returns false for scheduling and meeting tasks', () => {
    expect(canCreateProjectFromTask(mockSchedulingTask)).toBe(false)
    expect(canCreateProjectFromTask(mockMeetingTask)).toBe(false)
  })

  it('returns true for normal tasks', () => {
    expect(canCreateProjectFromTask(mockNormalTask)).toBe(true)
  })
})

describe('canStartTask()', () => {
  it('returns false for null/undefined task', () => {
    expect(canStartTask(null)).toBe(false)
    expect(canStartTask(undefined)).toBe(false)
  })

  it('returns false for recurring, scheduling or meeting tasks', () => {
    expect(canStartTask(RecurringTaskSchemaMock)).toBe(false)
    expect(canStartTask(mockSchedulingTask)).toBe(false)
    expect(canStartTask(mockMeetingTask)).toBe(false)
  })

  it('returns false when already manually started', () => {
    expect(canStartTask({ ...mockNormalTask, manuallyStarted: true })).toBe(
      false
    )
  })

  it('returns false when already completed or archived', () => {
    expect(
      canStartTask({ ...mockNormalTask, completedTime: DateTime.now().toISO() })
    ).toBe(false)
    expect(
      canStartTask({ ...mockNormalTask, archivedTime: DateTime.now().toISO() })
    ).toBe(false)
  })

  it('returns true for normal tasks', () => {
    expect(canStartTask(mockNormalTask)).toBe(true)
  })
})

describe('canStopTask()', () => {
  it('returns false for null/undefined task', () => {
    expect(canStopTask(null)).toBe(false)
    expect(canStopTask(undefined)).toBe(false)
  })

  it('returns false for recurring, scheduling or meeting tasks', () => {
    expect(canStopTask(RecurringTaskSchemaMock)).toBe(false)
    expect(canStopTask(mockSchedulingTask)).toBe(false)
    expect(canStopTask(mockMeetingTask)).toBe(false)
  })

  it('returns false when already completed or archived', () => {
    expect(
      canStopTask({ ...mockNormalTask, completedTime: DateTime.now().toISO() })
    ).toBe(false)
    expect(
      canStopTask({ ...mockNormalTask, archivedTime: DateTime.now().toISO() })
    ).toBe(false)
  })

  it('returns false when duration is none or reminders', () => {
    expect(canStopTask({ ...mockNormalTask, duration: NO_DURATION })).toBe(
      false
    )
    expect(
      canStopTask({ ...mockNormalTask, duration: SHORT_TASK_DURATION })
    ).toBe(false)
  })

  it('returns true for normal tasks', () => {
    expect(canStopTask(mockNormalTask)).toBe(true)
  })
})

describe('canCompleteTask()', () => {
  it('returns false for null/undefined task', () => {
    expect(canCompleteTask(null)).toBe(false)
    expect(canCompleteTask(undefined)).toBe(false)
  })

  it('returns false for scheduling or meeting tasks', () => {
    expect(canCompleteTask(mockSchedulingTask)).toBe(false)
    expect(canCompleteTask(mockMeetingTask)).toBe(false)
  })

  it('returns false when already completed or archived', () => {
    expect(
      canCompleteTask({
        ...mockNormalTask,
        completedTime: DateTime.now().toISO(),
      })
    ).toBe(false)
    expect(
      canCompleteTask({
        ...mockNormalTask,
        archivedTime: DateTime.now().toISO(),
      })
    ).toBe(false)
  })

  it('returns true for normal tasks, chunks or recurring tasks', () => {
    expect(canCompleteTask(mockNormalTask)).toBe(true)
    expect(canCompleteTask(mockChunkTask)).toBe(true)
    expect(canCompleteTask(RecurringTaskSchemaMock)).toBe(true)
  })
})

describe('getRemainingDuration()', () => {
  it('returns undefined for undefined task', () => {
    expect(getRemainingDuration(undefined)).toBe(undefined)
  })

  it('returns recurring instance duration for recurring instance tasks', () => {
    expect(getRemainingDuration(mockRecurringInstanceTask)).toBe(
      mockRecurringInstanceTask.duration
    )
  })

  it('returns the chunk duration for chunk tasks', () => {
    expect(getRemainingDuration(mockChunkTask)).toBe(mockChunkTask.duration)
  })

  it('returns the remaining duration for normal tasks', () => {
    assert(mockNormalTask.duration != null)

    expect(getRemainingDuration(mockNormalTask)).toBe(
      mockNormalTask.duration - mockNormalTask.completedDuration
    )
  })
})
