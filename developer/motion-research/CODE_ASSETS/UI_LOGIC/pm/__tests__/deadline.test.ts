import { type PMTaskType } from '@motion/rpc-types/legacy'
import { type TaskSchema } from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { BasePMTaskMock, PMASAPChunkedTaskMock } from '../../mocks'
import {
  getStartDateOrToday,
  getTaskScheduledDateString,
  isTaskPastDue,
  isTaskScheduled,
  pmComputeDeadlineDiff,
  shouldAllowASAP,
  shouldAllowPromoteToHardDeadline,
  sortTaskChunksByScheduledEnd,
} from '../deadline'

describe('pmComputeDeadlineDiff', () => {
  it('should return the difference in minutes between two dates', () => {
    const dueDate = '2023-10-11T14:30:00'
    const scheduledStart = '2023-10-11T14:00:00'

    expect(pmComputeDeadlineDiff(dueDate, scheduledStart)).toBe(30)
  })

  it('should return a negative value if the dueDate is before the scheduledStart', () => {
    const dueDate = '2023-10-11T13:30:00'
    const scheduledStart = '2023-10-11T14:00:00'

    expect(pmComputeDeadlineDiff(dueDate, scheduledStart)).toBe(-30)
  })

  it('should return the exact difference even if it is hours apart', () => {
    const dueDate = '2023-10-11T16:00:00'
    const scheduledStart = '2023-10-11T14:00:00'

    expect(pmComputeDeadlineDiff(dueDate, scheduledStart)).toBe(120) // 2 hours = 120 minutes
  })
})

describe('sortTaskChunksByScheduledEnd', () => {
  const baseTask: PMTaskType = {
    id: 'base',
    name: 'BaseTask',
    priorityLevel: 'LOW',
    createdTime: '2023-10-10T12:00:00',
    workspaceId: 'workspace1',
    minimumDuration: null,
    createdByUserId: 'user1',
    isAutoScheduled: true,
    statusId: '',
  }

  it('should sort tasks based on scheduledEnd', () => {
    const task1 = { ...baseTask, id: '1', scheduledEnd: '2023-10-11T15:00:00' }
    const task2 = { ...baseTask, id: '2', scheduledEnd: '2023-10-11T14:00:00' }
    const task3 = { ...baseTask, id: '3' }

    const tasks = [task1, task2, task3]
    tasks.sort(sortTaskChunksByScheduledEnd)

    expect(tasks).toEqual([task2, task1, task3])
  })

  it('should place tasks without scheduledEnd at the end', () => {
    const task1 = { ...baseTask, id: '1', scheduledEnd: '2023-10-11T14:00:00' }
    const task2 = { ...baseTask, id: '2' }

    const tasks = [task1, task2]
    tasks.sort(sortTaskChunksByScheduledEnd)

    expect(tasks).toEqual([task1, task2])
  })

  it('should place tasks with earlier scheduledEnd before tasks without scheduledEnd', () => {
    const task1 = { ...baseTask, id: '1' }
    const task2 = { ...baseTask, id: '2', scheduledEnd: '2023-10-11T14:00:00' }

    const tasks = [task1, task2]
    tasks.sort(sortTaskChunksByScheduledEnd)

    expect(tasks).toEqual([task2, task1])
  })

  it('should not change the order if both tasks have the same scheduledEnd', () => {
    const task1 = { ...baseTask, id: '1', scheduledEnd: '2023-10-11T14:00:00' }
    const task2 = { ...baseTask, id: '2', scheduledEnd: '2023-10-11T14:00:00' }

    const tasks = [task1, task2]
    tasks.sort(sortTaskChunksByScheduledEnd)

    expect(tasks).toEqual([task1, task2])
  })

  it('should place tasks without scheduledEnd at the end, even if they are interspersed', () => {
    const task1 = { ...baseTask, id: '1', scheduledEnd: '2023-10-11T16:00:00' }
    const task2 = { ...baseTask, id: '2', scheduledEnd: '2023-10-11T14:00:00' }
    const task3 = { ...baseTask, id: '3' }
    const task4 = { ...baseTask, id: '4' }

    const tasks = [task1, task2, task3, task4]
    tasks.sort(sortTaskChunksByScheduledEnd)

    expect(tasks).toEqual([task2, task1, task3, task4])
  })

  it('should sort tasks correctly when chunkA.scheduledEnd is greater than chunkB.scheduledEnd', () => {
    const task1 = { ...baseTask, id: '1', scheduledEnd: '2023-10-11T15:00:00' }
    const task2 = { ...baseTask, id: '2', scheduledEnd: '2023-10-11T14:00:00' }

    const tasks = [task2, task1]
    tasks.sort(sortTaskChunksByScheduledEnd)

    expect(tasks).toEqual([task2, task1])
  })
})

describe('shouldAllowPromoteToHardDeadline', () => {
  const baseTask = {
    id: 'task1',
    name: 'Sample Task',
    priorityLevel: 'LOW',
    createdTime: '2023-10-10T12:00:00',
    workspaceId: 'workspace1',
    minimumDuration: null,
    createdByUserId: 'user1',
    isAutoScheduled: true,
    statusId: '',
  } satisfies PMTaskType

  const futureDate = '2023-08-02'
  const pastDate = '2023-07-31'
  const currentDate = '2023-08-01'

  beforeEach(() => {
    const frozenTime = new Date(currentDate)
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  it('should return true for future deadlines that are not HARD', () => {
    const task = {
      ...baseTask,
      dueDate: futureDate,
      deadlineType: 'SOFT',
    } satisfies PMTaskType

    expect(shouldAllowPromoteToHardDeadline(task)).toBeTruthy()
  })

  it('should return false for past deadlines', () => {
    const task = {
      ...baseTask,
      dueDate: pastDate,
      deadlineType: 'SOFT',
    } satisfies PMTaskType

    expect(shouldAllowPromoteToHardDeadline(task)).toBeFalsy()
  })

  it('should return false for tasks with HARD deadline type', () => {
    const task = {
      ...baseTask,
      dueDate: futureDate,
      deadlineType: 'HARD',
    } satisfies PMTaskType

    expect(shouldAllowPromoteToHardDeadline(task)).toBeFalsy()
  })

  it('should return true for tasks without a deadline date', () => {
    const task = {
      ...baseTask,
      dueDate: null,
      deadlineType: 'SOFT',
    } satisfies PMTaskType

    expect(shouldAllowPromoteToHardDeadline(task)).toBeTruthy()
  })

  it('should always return false for recurring task instances', () => {
    const task = {
      ...baseTask,
      dueDate: null,
      deadlineType: 'SOFT',
      type: 'RECURRING_INSTANCE',
    } satisfies PMTaskType

    expect(shouldAllowPromoteToHardDeadline(task)).toBeFalsy()
  })

  it('should return false for tasks with HARD deadline type regardless of due date', () => {
    const task = {
      ...baseTask,
      dueDate: pastDate,
      deadlineType: 'HARD',
    } satisfies PMTaskType

    expect(shouldAllowPromoteToHardDeadline(task)).toBeFalsy()
  })
})

describe('shouldAllowASAP', () => {
  const baseTask = {
    id: 'task1',
    name: 'Sample Task',
    priorityLevel: 'LOW',
    createdTime: '2023-10-10T12:00:00',
    workspaceId: 'workspace1',
    minimumDuration: null,
    createdByUserId: 'user1',
    isAutoScheduled: true,
    statusId: '123',
  } satisfies PMTaskType

  it('should return true for non recurring tasks', () => {
    const normalTask = {
      ...baseTask,
      parentRecurringTaskId: undefined,
      type: 'NORMAL',
    } satisfies PMTaskType

    expect(shouldAllowASAP(normalTask)).toBeTruthy()

    const chunkTask = {
      ...baseTask,
      parentRecurringTaskId: undefined,
      type: 'CHUNK',
    } satisfies PMTaskType

    expect(shouldAllowASAP(chunkTask)).toBeTruthy()
  })

  it('should return false for tasks with a recurring type', () => {
    const taskWithParent = {
      ...baseTask,
      parentRecurringTaskId: 'parentId',
      type: 'RECURRING_INSTANCE',
    } satisfies PMTaskType

    expect(shouldAllowASAP(taskWithParent)).toBeFalsy()
  })
})

describe('getStartDateOrToday', () => {
  const currentDateTime = DateTime.fromISO('2023-11-22T12:00:00') // Hard-coded time for testing
  const tomorrow = currentDateTime.plus({ days: 1 })

  beforeEach(() => {
    tk.freeze(currentDateTime.toJSDate())
  })

  afterEach(() => {
    tk.reset()
  })

  it('should return the startDate if it exists', () => {
    const task = {
      startDate: tomorrow.toISO(),
    } as const
    const result = getStartDateOrToday(task.startDate)

    expect(result).toEqual(tomorrow.startOf('day'))
  })

  it('should return today if startDate is not defined', () => {
    const result = getStartDateOrToday(null)

    expect(result).toEqual(currentDateTime.startOf('day'))
  })
})

describe('isTaskScheduled', () => {
  it('should return false for undefined task', () => {
    const result = isTaskScheduled(undefined)

    expect(result).toBe(false)
  })

  it('should return false for task with undefined scheduledStart', () => {
    const task = {
      ...BasePMTaskMock,
      scheduledStart: undefined,
    }
    const result = isTaskScheduled(task)

    expect(result).toBe(false)
  })

  it('should return true for task with scheduledStart', () => {
    const task = {
      ...BasePMTaskMock,
      scheduledStart: '2023-11-22T12:00:00',
    }

    const result = isTaskScheduled(task)

    expect(result).toBe(true)
  })

  it('should return true for task with chunks', () => {
    const task = {
      ...PMASAPChunkedTaskMock,
    } as PMTaskType
    const result = isTaskScheduled(task)

    expect(result).toBe(true)
  })
})

describe(getTaskScheduledDateString, () => {
  it('should return "Pending" for task with no scheduledStart', () => {
    expect(getTaskScheduledDateString({} as TaskSchema)).toBe('Pending')
  })

  it('should return unfit for an unfit task', () => {
    expect(
      getTaskScheduledDateString({
        scheduledStatus: 'UNFIT_PAST_DUE',
      } as TaskSchema)
    ).toBe('Could not fit task')
  })

  it('should return the date for a task with a scheduled completion', () => {
    expect(
      getTaskScheduledDateString({
        estimatedCompletionTime: '2023-11-22T12:00:00',
      } as TaskSchema)
    ).toBe('Wed Nov 22, 2023 at 12:00PM')
  })
})

describe(isTaskPastDue, () => {
  it('should return false for ASAP tasks', () => {
    expect(isTaskPastDue({ priorityLevel: 'ASAP' } as TaskSchema)).toBeFalsy()
  })

  it('should return false for needsReschedule tasks', () => {
    expect(isTaskPastDue({ needsReschedule: true } as TaskSchema)).toBeFalsy()
  })

  it('should return false for ON_TRACK tasks', () => {
    expect(
      isTaskPastDue({
        scheduledStatus: 'ON_TRACK',
      } as TaskSchema)
    ).toEqual(false)
  })

  it('should return true for PAST_DUE tasks', () => {
    expect(
      isTaskPastDue({
        scheduledStatus: 'PAST_DUE',
      } as TaskSchema)
    ).toEqual(true)
  })

  it('should return true for UNFIT_PAST_DUE tasks', () => {
    expect(
      isTaskPastDue({
        scheduledStatus: 'UNFIT_PAST_DUE',
      } as TaskSchema)
    ).toEqual(true)
  })

  it('should return false for UNFIT_SCHEDULABLE tasks', () => {
    expect(
      isTaskPastDue({
        scheduledStatus: 'UNFIT_SCHEDULABLE',
      } as TaskSchema)
    ).toEqual(false)
  })
})
