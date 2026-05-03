import { type StatusSchema, type TaskSchema } from '@motion/rpc-types'
import { DEFAULT_DURATION } from '@motion/shared/pm'

import {
  getDuplicatedOrExistingTaskFields,
  type GetDuplicatedOrExistingTaskFieldsParams,
  getDuplicatedTaskData,
} from '../get-duplicated-task-data'

const mockWorkspaceStatuses: StatusSchema[] = [
  {
    id: 'status-1',
    name: 'Todo',
    color: '#000000',
    workspaceId: 'workspace-1',
    type: 'DEFAULT',
  },
  {
    id: 'status-2',
    name: 'Done',
    color: '#000000',
    workspaceId: 'workspace-1',
    type: 'COMPLETED',
  },
] as StatusSchema[]

const mockTask: TaskSchema = {
  id: 'task-1',
  type: 'NORMAL',
  name: 'Test Task',
  description: 'Test Description',
  workspaceId: 'workspace-1',
  statusId: 'status-1',
  isAutoScheduled: true,
  completedTime: null,
  completedDuration: 0,
  priorityLevel: 'MEDIUM',
  assigneeUserId: null,
  deadlineType: 'SOFT',
  scheduleId: 'schedule-1',
} as TaskSchema

const mockParentTask: TaskSchema = {
  ...mockTask,
  id: 'parent-1',
  name: 'Parent Task',
  description: 'Parent Description',
} as TaskSchema

describe('getDuplicatedTaskData', () => {
  it('should duplicate task with default values', () => {
    const result = getDuplicatedTaskData(mockTask, {
      workspaceId: 'workspace-1',
      forTaskId: 'task-1',
      status: mockWorkspaceStatuses[0],
      workspaceStatuses: mockWorkspaceStatuses,
    })

    expect(result).toEqual({
      name: 'Test Task (duplicate)',
      description: expect.stringContaining(
        'Test Description<p>Duplicated from:'
      ),
      duration: DEFAULT_DURATION,
      minimumDuration: null,
      status: mockWorkspaceStatuses[0],
      isAutoScheduled: true,
      completedTime: null,
      completedDuration: 0,
    })
  })

  it('should use provided task title', () => {
    const result = getDuplicatedTaskData(mockTask, {
      workspaceId: 'workspace-1',
      forTaskId: 'task-1',
      taskTitle: 'Custom Title',
      status: mockWorkspaceStatuses[0],
      workspaceStatuses: mockWorkspaceStatuses,
    })

    expect(result.name).toBe('Custom Title')
  })

  it('should reset completed status when duplicating completed task', () => {
    const result = getDuplicatedTaskData(mockTask, {
      workspaceId: 'workspace-1',
      forTaskId: 'task-1',
      status: mockWorkspaceStatuses[1], // Done status
      workspaceStatuses: mockWorkspaceStatuses,
    })

    expect(result.status).toBe(mockWorkspaceStatuses[0]) // Should reset to Todo
    expect(result.completedTime).toBeNull()
    expect(result.completedDuration).toBe(0)
  })
})

describe('getDuplicatedOrExistingTaskFields', () => {
  const baseParams = {
    isDuplicatingTask: false,
    task: mockTask,
    isInstance: false,
    workspaceId: 'workspace-1',
    searchParams: { forTaskId: 'task-1' },
    status: mockWorkspaceStatuses[0],
    isAutoScheduledFromStatus: true,
    workspaceStatuses: mockWorkspaceStatuses,
  } satisfies GetDuplicatedOrExistingTaskFieldsParams

  it('should return duplicated task fields when duplicating', () => {
    const result = getDuplicatedOrExistingTaskFields({
      ...baseParams,
      isDuplicatingTask: true,
    })

    expect(result.id).toBeUndefined()
    expect(result.name).toBe('Test Task (duplicate)')
    expect(result.description).toContain('Duplicated from:')
  })

  it('should return existing task fields when not duplicating', () => {
    const result = getDuplicatedOrExistingTaskFields({
      ...baseParams,
      isDuplicatingTask: false,
    })

    expect(result.id).toBe('task-1')
    expect(result.name).toBe('Test Task')
    expect(result.description).toBe('Test Description')
  })

  it('should use parent task description for instances', () => {
    const result = getDuplicatedOrExistingTaskFields({
      ...baseParams,
      isDuplicatingTask: false,
      isInstance: true,
      parentTask: mockParentTask,
    })

    expect(result.description).toBe('Parent Description')
  })

  it('should use provided task title', () => {
    const result = getDuplicatedOrExistingTaskFields({
      ...baseParams,
      isDuplicatingTask: false,
      taskTitle: 'Custom Title',
    })

    expect(result.name).toBe('Custom Title')
  })
})
