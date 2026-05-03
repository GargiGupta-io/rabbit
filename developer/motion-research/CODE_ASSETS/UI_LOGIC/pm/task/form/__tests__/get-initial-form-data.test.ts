import { AutoScheduleSetting, StatusType } from '@motion/shared/common'
import { DEFAULT_DURATION, NO_CHUNK_DURATION } from '@motion/shared/pm'
import {
  type RecurringInstanceSchema,
  type RecurringTaskSchema,
  type StatusSchema,
  type TaskSchema,
  type UserSettingsSchema,
  type WorkspaceSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { mapRelativeDateOptionToAbsoluteDate } from '../../../../utils'
import { type AllAvailableCustomFieldSchema } from '../../../custom-fields'
import { DEFAULT_SCHEDULE_ID } from '../../fields'
import {
  type BaseTaskData,
  getInitialFormData,
  type GetInitialFormDataOptions,
  validateBaseData,
} from '../get-initial-form-data'
import { resolveFormTaskId } from '../resolve-form-task-id'
import { resolveFormWorkspaceAndProjectId } from '../resolve-form-workspace-and-project-id'

describe('form data', () => {
  beforeEach(() => {
    tk.freeze('2024-01-01')
  })

  afterEach(() => {
    tk.reset()
  })

  const mockTaskDefaults = {
    global: {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      assigneeUserId: 'user-2',
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      isAutoScheduled: true,
      duration: 60,
      minimumDuration: 30,
      relativeStartOn: 'next-14-days',
      relativeDueDate: 'next-month',
      ignoreWarnOnPastDue: false,
      deadlineType: 'HARD',
      scheduleId: 'schedule-1',
      customFieldValues: {
        'field-1': { type: 'text', value: 'default-value' },
      },
      level: 'GLOBAL',
    },
  } satisfies UserSettingsSchema['taskDefaultSettings']

  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Test Workspace',
    statusIds: ['status-1'],
  } as WorkspaceSchema

  const mockStatuses = [
    {
      id: 'status-1',
      name: 'Todo',
      type: StatusType.DEFAULT,
      autoScheduleSetting: AutoScheduleSetting.ENABLED,
      isDefaultStatus: true,
    },
    {
      id: 'status-2',
      name: 'Completed',
      type: StatusType.COMPLETED,
      autoScheduleSetting: AutoScheduleSetting.DISABLED,
    },
  ] as StatusSchema[]

  const mockSchedules = {
    'schedule-1': { id: 'schedule-1', name: 'Schedule 1' },
    'schedule-2': { id: 'schedule-2', name: 'Schedule 2' },
  } as any

  const baseOptions = {
    searchParams: {},
    isLoading: false,
    hasError: false,
    currentUserId: 'user-1',
    workspaceStatuses: mockStatuses,
    workspaceCustomFields: [],
    workspaceLabels: [],
    workspaceId: mockWorkspace.id,
    schedules: mockSchedules,
  }

  describe('getInitialFormData', () => {
    describe('error cases', () => {
      it('should throw an error if task type is CHUNK', () => {
        const options = {
          ...baseOptions,
          task: { type: 'CHUNK' } as TaskSchema,
        }

        expect(() => getInitialFormData(options)).toThrow(
          'Cannot open a chunk in the task modal'
        )
      })

      it('should throw an error if workspaceId is null', () => {
        const options = {
          ...baseOptions,
          workspaceId: undefined,
        } as unknown as GetInitialFormDataOptions

        expect(() => getInitialFormData(options)).toThrow(
          'Workspace id not defined'
        )
      })

      it('should throw an error if priority is invalid', () => {
        const options = {
          ...baseOptions,
          searchParams: { forPriority: 'INVALID_PRIORITY' },
        }

        expect(() => getInitialFormData(options)).toThrow('Priority unknown')
      })
    })

    describe('new task creation', () => {
      it('should set default values for a new task', () => {
        const result = getInitialFormData(baseOptions)

        expect(result).toMatchObject({
          id: undefined,
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          projectId: null,
          statusId: mockStatuses[0].id,
          assigneeUserId: baseOptions.currentUserId,
          isAutoScheduled: true,
          name: '',
          description: '',
          priorityLevel: 'MEDIUM',
          labelIds: [],
          blockingTaskIds: [],
          blockedByTaskIds: [],
        })
      })

      it('should handle fixed time task creation', () => {
        const now = DateTime.now()
        const scheduledStart = now.plus({ hours: 1 }).toISO()
        const scheduledEnd = now.plus({ hours: 2 }).toISO()

        const result = getInitialFormData({
          ...baseOptions,
          scheduledStart,
          scheduledEnd,
        })

        expect(result).toMatchObject({
          isFixedTimeTask: true,
          scheduledStart,
          scheduledEnd,
          isAutoScheduled: true,
          duration: 60, // 1 hour difference
        })
      })

      it('should use provided search params for new task', () => {
        const result = getInitialFormData({
          ...baseOptions,
          searchParams: {
            forAssignee: 'user-2',
            forPriority: 'HIGH',
            forLabel: 'label-1',
            forStatus: 'status-2',
          },
        })

        expect(result).toMatchObject({
          assigneeUserId: 'user-2',
          priorityLevel: 'HIGH',
          labelIds: ['label-1'],
          statusId: 'status-2',
        })
      })

      it('should handle unassigned tasks', () => {
        const result = getInitialFormData({
          ...baseOptions,
          searchParams: {
            forAssignee: 'unassigned',
          },
        })

        expect(result.assigneeUserId).toBeNull()
      })
    })

    describe('task duplication', () => {
      const existingTask = {
        id: 'task-1',
        type: 'NORMAL',
        workspaceId: mockWorkspace.id,
        name: 'Original Task',
        description: '<p>Original description</p>',
        statusId: 'status-2', // Completed status
        isAutoScheduled: false,
        duration: 120,
        completedDuration: 120,
        completedTime: DateTime.now().toISO(),
        labelIds: ['label-1'],
        customFieldValues: {},
      } as TaskSchema

      it('should properly duplicate a task', () => {
        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          searchParams: {
            forTaskId: 'task-1',
          },
        })

        expect(result).toMatchObject({
          id: undefined, // New task should not have an id
          name: 'Original Task (duplicate)',
          description: expect.stringContaining('Duplicated from:'),
          statusId: mockStatuses[0].id, // Should reset to default status
          isAutoScheduled: true, // Should reset for new default status
          completedDuration: 0, // Should reset completion
          completedTime: null, // Should reset completion
          labelIds: ['label-1'], // Should keep labels
        })
      })

      it('should preserve custom title when duplicating', () => {
        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          searchParams: {
            forTaskId: 'task-1',
          },
          taskTitle: 'Custom Title',
        })

        expect(result.name).toBe('Custom Title')
      })
    })

    describe('task defaults', () => {
      beforeEach(() => {
        tk.freeze('2024-01-01')
      })

      afterEach(() => {
        tk.reset()
      })

      it('should apply task defaults for new tasks', () => {
        const result = getInitialFormData({
          ...baseOptions,
          userDefinedTaskDefaults: mockTaskDefaults,
          workspaceCustomFields: [
            {
              id: 'field-1',
              name: 'Field 1',
              type: 'text',
              workspaceId: 'workspace-1',
            } as AllAvailableCustomFieldSchema,
          ],
        })

        expect(result).toMatchObject({
          assigneeUserId: 'user-2',
          priorityLevel: 'HIGH',
          duration: 60,
          minimumDuration: 30,
          deadlineType: 'HARD',
          scheduleId: 'schedule-1',
          startDate:
            mapRelativeDateOptionToAbsoluteDate('next-14-days')?.toISODate(),
          dueDate: mapRelativeDateOptionToAbsoluteDate('next-month', {
            bound: 'end',
          })
            ?.endOf('day')
            .toISO(),
        })

        expect(result.customFieldValuesFieldArray[0]).toMatchObject({
          value: 'default-value',
        })
      })

      it('should not apply task defaults when editing existing tasks', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          name: 'Existing Task',
          priorityLevel: 'LOW',
          duration: 30,
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          searchParams: { task: 'task-1' },
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(result).toMatchObject({
          priorityLevel: 'LOW',
          duration: 30,
        })
      })
    })

    describe('duration handling', () => {
      it('should set default duration for new tasks', () => {
        const result = getInitialFormData(baseOptions)

        expect(result.duration).toBe(DEFAULT_DURATION)
      })

      it('should preserve duration for existing tasks', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          duration: 120,
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          searchParams: {
            task: 'task-1',
          },
          task: existingTask,
        })

        expect(result.duration).toBe(120)
      })

      it('should calculate duration for fixed time tasks', () => {
        const now = DateTime.now()
        const scheduledStart = now.toISO()
        const scheduledEnd = now.plus({ minutes: 90 }).toISO()

        const result = getInitialFormData({
          ...baseOptions,
          scheduledStart,
          scheduledEnd,
        })

        expect(result.duration).toBe(90)
        expect(result.isFixedTimeTask).toBe(true)
      })

      it('should use fixed time duration over existing task duration', () => {
        const now = DateTime.now()
        const scheduledStart = now.toISO()
        const scheduledEnd = now.plus({ minutes: 45 }).toISO()

        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          duration: 120,
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          scheduledStart,
          scheduledEnd,
        })

        expect(result.duration).toBe(45) // Should use fixed time duration
        expect(result.isFixedTimeTask).toBe(true)
      })

      it('should use task defaults duration for new tasks when available', () => {
        const taskDefaultsWithDuration = {
          global: {
            ...mockTaskDefaults.global,
            duration: 180,
          },
        }

        const result = getInitialFormData({
          ...baseOptions,
          userDefinedTaskDefaults: taskDefaultsWithDuration,
        })

        expect(result.duration).toBe(180)
      })

      it('should not apply task defaults duration when editing existing task', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          duration: 120,
        } as TaskSchema

        const taskDefaultsWithDuration = {
          global: {
            ...mockTaskDefaults.global,
            duration: 180,
          },
        }

        const result = getInitialFormData({
          ...baseOptions,
          searchParams: {
            task: 'task-1',
          },
          task: existingTask,
          userDefinedTaskDefaults: taskDefaultsWithDuration,
        })

        expect(result.duration).toBe(120) // Should keep existing task duration
      })
    })

    describe('auto scheduling', () => {
      it('should set isAutoScheduled true for fixed time tasks regardless of status', () => {
        const now = DateTime.now()
        const scheduledStart = now.toISO()
        const scheduledEnd = now.plus({ minutes: 45 }).toISO()

        // Even with a completed status (which normally disables auto-scheduling)
        const result = getInitialFormData({
          ...baseOptions,
          searchParams: { forStatus: 'status-2' }, // Completed status
          scheduledStart,
          scheduledEnd,
        })

        expect(result.isAutoScheduled).toBe(true)
        expect(result.isFixedTimeTask).toBe(true)
      })

      it('should set isAutoScheduled based on status for non-fixed time tasks', () => {
        // Default status (auto-schedule enabled)
        const resultWithDefaultStatus = getInitialFormData(baseOptions)

        expect(resultWithDefaultStatus.isAutoScheduled).toBe(true)

        // Completed status (auto-schedule disabled)
        const resultWithCompletedStatus = getInitialFormData({
          ...baseOptions,
          searchParams: { forStatus: 'status-2' },
        })

        expect(resultWithCompletedStatus.isAutoScheduled).toBe(false)
      })

      it('should preserve isAutoScheduled when editing existing task', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          statusId: 'status-1',
          isAutoScheduled: false, // Explicitly set to false
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          searchParams: { task: 'task-1' },
          task: existingTask,
        })

        expect(result.isAutoScheduled).toBe(false)
      })

      it('should set isAutoScheduled true when duplicating to default status', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          statusId: 'status-2', // Completed status
          isAutoScheduled: false,
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          searchParams: { forTaskId: 'task-1' }, // Indicates duplication
        })

        expect(result.statusId).toBe('status-1') // Should reset to default status
        expect(result.isAutoScheduled).toBe(true) // Should be auto-scheduled for default status
      })
    })

    describe('recurring task parent handling', () => {
      beforeEach(() => {
        tk.freeze('2024-01-01')
      })

      afterEach(() => {
        tk.reset()
      })

      const recurringParentTask = {
        id: 'task-1',
        type: 'RECURRING_TASK',
        workspaceId: mockWorkspace.id,
        name: 'Recurring Parent Task',
        startingOn: '2024-01-15',
        frequency: 'WEEKLY',
        days: ['MO', 'WE', 'FR'],
        statusId: 'status-1',
        isAutoScheduled: true,
        duration: 60,
        labelIds: ['label-1'],
        deadlineType: 'HARD',
        assigneeUserId: 'user-1',
        createdByUserId: 'user-1',
        description: '',
        priorityLevel: 'HIGH',
        scheduleId: 'schedule-1',
        minimumDuration: 30,
        ignoreWarnOnPastDue: false,
        needsUpdate: false,
        recurrenceMeta: null,
        excludedDates: null,
        idealTime: null,
        timeStart: '8:00 am',
        timeEnd: '5:00 pm',
      } satisfies RecurringTaskSchema

      it('should preserve recurring task parent dates when editing', () => {
        const result = getInitialFormData({
          ...baseOptions,
          task: recurringParentTask,
          searchParams: { task: 'task-1' },
        })

        expect(result).toMatchObject({
          startDate: '2024-01-15',
          frequency: 'WEEKLY',
          days: ['MO', 'WE', 'FR'],
        })
      })

      it('should not apply task defaults to recurring parent dates', () => {
        const result = getInitialFormData({
          ...baseOptions,
          task: recurringParentTask,
          searchParams: { task: 'task-1' },
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(result.startDate).toBe('2024-01-15')
      })

      it('should handle duplicating a recurring parent task', () => {
        const result = getInitialFormData({
          ...baseOptions,
          task: recurringParentTask,
          searchParams: { forTaskId: 'task-1' },
        })

        expect(result).toMatchObject({
          id: undefined,
          type: 'RECURRING_TASK',
          name: 'Recurring Parent Task (duplicate)',
          startDate: '2024-01-15',
          frequency: 'WEEKLY',
          days: ['MO', 'WE', 'FR'],
          statusId: mockStatuses[0].id,
          isAutoScheduled: true,
        })
      })
    })

    describe('duration and minimum duration handling', () => {
      it('should set default duration and minimum duration for new tasks', () => {
        const result = getInitialFormData(baseOptions)

        expect(result.duration).toBe(DEFAULT_DURATION)
        expect(result.minimumDuration).toBe(NO_CHUNK_DURATION)
      })

      it('should preserve duration and minimum duration for existing tasks', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          duration: 120,
          minimumDuration: 45,
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          searchParams: {
            task: 'task-1',
          },
          task: existingTask,
        })

        expect(result.duration).toBe(120)
        expect(result.minimumDuration).toBe(45)
      })

      it('should calculate duration and minimum duration for fixed time tasks', () => {
        const now = DateTime.now()
        const scheduledStart = now.toISO()
        const scheduledEnd = now.plus({ minutes: 120 }).toISO()

        const result = getInitialFormData({
          ...baseOptions,
          scheduledStart,
          scheduledEnd,
        })

        expect(result.duration).toBe(120)
        expect(result.minimumDuration).toBe(60) // Default chunk duration for 120 min task
        expect(result.isFixedTimeTask).toBe(true)
      })

      it('should use fixed time duration and minimum duration over existing task values', () => {
        const now = DateTime.now()
        const scheduledStart = now.toISO()
        const scheduledEnd = now.plus({ minutes: 45 }).toISO()

        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          duration: 120,
          minimumDuration: 60,
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          scheduledStart,
          scheduledEnd,
        })

        expect(result.duration).toBe(45) // Should use fixed time duration
        expect(result.minimumDuration).toBe(null) // Should recalculate minimum duration based on fixed time
        expect(result.isFixedTimeTask).toBe(true)
      })

      it('should use task defaults duration and minimum duration for new tasks when available', () => {
        const taskDefaultsWithDurations = {
          global: {
            ...mockTaskDefaults.global,
            duration: 180,
            minimumDuration: 60,
          },
        }

        const result = getInitialFormData({
          ...baseOptions,
          userDefinedTaskDefaults: taskDefaultsWithDurations,
        })

        expect(result.duration).toBe(180)
        expect(result.minimumDuration).toBe(60)
      })

      it('should not apply task defaults duration and minimum duration when editing existing task', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          duration: 120,
          minimumDuration: 45,
        } as TaskSchema

        const taskDefaultsWithDurations = {
          global: {
            ...mockTaskDefaults.global,
            duration: 180,
            minimumDuration: 60,
          },
        }

        const result = getInitialFormData({
          ...baseOptions,
          searchParams: {
            task: 'task-1',
          },
          task: existingTask,
          userDefinedTaskDefaults: taskDefaultsWithDurations,
        })

        expect(result.duration).toBe(120) // Should keep existing task duration
        expect(result.minimumDuration).toBe(45) // Should keep existing minimum duration
      })

      it('should handle zero minimum duration in task defaults', () => {
        const taskDefaultsWithZeroMinimum = {
          global: {
            ...mockTaskDefaults.global,
            duration: 60,
            minimumDuration: 0,
          },
        }

        const result = getInitialFormData({
          ...baseOptions,
          userDefinedTaskDefaults: taskDefaultsWithZeroMinimum,
        })

        expect(result.duration).toBe(60)
        expect(result.minimumDuration).toBe(0)
      })
    })

    describe('assigneeUserId assignment', () => {
      it('should assign currentUserId for fixed-time tasks', () => {
        const now = DateTime.now()
        const scheduledStart = now.plus({ hours: 1 }).toISO()
        const scheduledEnd = now.plus({ hours: 2 }).toISO()

        const result = getInitialFormData({
          ...baseOptions,
          scheduledStart,
          scheduledEnd,
          currentUserId: 'user-1',
          userDefinedTaskDefaults: {
            global: {
              assigneeUserId: 'user-2',
            } as any,
          },
        })

        expect(result.assigneeUserId).toBe('user-1') // Should use currentUserId
      })

      it('should assign baseData.assigneeUserId for non-fixed-time tasks', () => {
        const result = getInitialFormData({
          ...baseOptions,
          currentUserId: 'user-1',
          userDefinedTaskDefaults: {
            global: {
              assigneeUserId: 'user-2',
            } as any,
          },
        })

        expect(result.assigneeUserId).toBe('user-2') // Should use baseData.assigneeUserId
      })
    })

    describe('schedule handling', () => {
      it('should use default schedule when schedules are not provided', () => {
        const { schedules, ...rest } = baseOptions
        const result = getInitialFormData({
          ...rest,
          userDefinedTaskDefaults: {
            global: {
              scheduleId: 'schedule-1',
            } as any,
          },
        } as any)

        expect(result.scheduleId).toBe(DEFAULT_SCHEDULE_ID)
      })

      it('should use default schedule when provided schedule is invalid', () => {
        const result = getInitialFormData({
          ...baseOptions,
          userDefinedTaskDefaults: {
            global: {
              scheduleId: 'invalid-schedule',
            } as any,
          },
          schedules: mockSchedules,
        })

        expect(result.scheduleId).toBe(DEFAULT_SCHEDULE_ID)
      })

      it('should preserve valid schedule from task defaults', () => {
        const result = getInitialFormData({
          ...baseOptions,
          userDefinedTaskDefaults: {
            global: {
              scheduleId: 'schedule-1',
            } as any,
          },
          schedules: mockSchedules,
        })

        expect(result.scheduleId).toBe('schedule-1')
      })

      it('should preserve valid schedule from existing task', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          scheduleId: 'schedule-2',
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          searchParams: { task: 'task-1' },
          schedules: mockSchedules,
        })

        expect(result.scheduleId).toBe('schedule-2')
      })
    })

    describe('task data usage determination', () => {
      it('should use task data when task exists and taskId matches', () => {
        const existingTask = {
          id: 'task-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          name: 'Existing Task',
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: existingTask,
          searchParams: { task: 'task-1' },
        })

        // Should preserve existing task data
        expect(result.name).toBe('Existing Task')
        expect(result.id).toBe('task-1')
      })

      it('should use task data when task exists and templateId is provided', () => {
        const templateTask = {
          id: 'template-1',
          type: 'NORMAL',
          workspaceId: mockWorkspace.id,
          name: 'Template Task',
          description: 'Template Description',
        } as TaskSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: templateTask,
          searchParams: { templateId: 'template-1' },
        })

        // Should use template task data
        expect(result.name).toBe('Template Task')
        expect(result.description).toBe('Template Description')
      })

      it('should not use task data when no task exists', () => {
        const result = getInitialFormData({
          ...baseOptions,
          task: undefined,
          searchParams: { task: 'task-1' }, // Even with taskId
        })

        // Should use new task defaults
        expect(result.id).toBeUndefined()
        expect(result.name).toBe('')
        expect(result.priorityLevel).toBe('MEDIUM')
      })

      it('should handle recurring task instances correctly', () => {
        const recurringInstance = {
          id: 'instance-1',
          type: 'RECURRING_INSTANCE',
          workspaceId: mockWorkspace.id,
          name: 'Recurring Instance',
          parentTaskId: 'parent-1',
        } as unknown as RecurringInstanceSchema

        const result = getInitialFormData({
          ...baseOptions,
          task: recurringInstance,
          searchParams: { task: 'instance-1' },
        })

        // Should preserve instance data
        expect(result.id).toBe('instance-1')
        expect(result.type).toBe('RECURRING_INSTANCE')
        expect(result.name).toBe('Recurring Instance')
      })
    })
  })

  describe('resolveFormTaskId', () => {
    describe('state handling', () => {
      it('should prioritize chunkId from state', () => {
        const result = resolveFormTaskId({
          searchParams: {
            forTaskId: 'task-1',
            task: 'task-2',
          },
          state: { chunkId: 'chunk-1' },
        })

        expect(result).toBe('chunk-1')
      })

      it('should handle undefined state', () => {
        const result = resolveFormTaskId({
          searchParams: { forTaskId: 'task-1' },
          state: undefined,
        })

        expect(result).toBe('task-1')
      })
    })

    describe('search params handling', () => {
      it('should prioritize forTaskId over task param', () => {
        const result = resolveFormTaskId({
          searchParams: {
            forTaskId: 'task-1',
            task: 'task-2',
          },
        })

        expect(result).toBe('task-1')
      })

      it('should use task param if forTaskId is not present', () => {
        const result = resolveFormTaskId({
          searchParams: { task: 'task-1' },
        })

        expect(result).toBe('task-1')
      })

      it('should return undefined for new tasks', () => {
        const result = resolveFormTaskId({
          searchParams: { task: 'new' },
        })

        expect(result).toBeUndefined()
      })

      it('should handle empty search params', () => {
        const result = resolveFormTaskId({
          searchParams: {},
        })

        expect(result).toBeUndefined()
      })
    })
  })

  describe('resolveFormWorkspaceAndProjectId', () => {
    const defaultWorkspace = { id: 'default-workspace' } as WorkspaceSchema
    const mockTask = {
      id: 'task-1',
      workspaceId: 'task-workspace',
      projectId: 'task-project',
    } as TaskSchema

    describe('workspace resolution', () => {
      it('should prioritize task workspace when task exists', () => {
        const result = resolveFormWorkspaceAndProjectId({
          searchParams: {
            forTaskId: 'task-1',
            forWorkspace: 'search-workspace',
          },
          urlParams: { workspaceId: 'url-workspace' },
          task: mockTask,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(result.workspaceId).toBe('task-workspace')
      })

      it('should follow priority order: searchParams > urlParams > taskDefaults > defaultWorkspace', () => {
        const result = resolveFormWorkspaceAndProjectId({
          searchParams: { forWorkspace: 'search-workspace' },
          urlParams: { workspaceId: 'url-workspace' },
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(result.workspaceId).toBe('search-workspace')

        // Test fallback to urlParams
        const resultWithoutSearch = resolveFormWorkspaceAndProjectId({
          searchParams: {},
          urlParams: { workspaceId: 'url-workspace' },
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(resultWithoutSearch.workspaceId).toBe('url-workspace')

        // Test fallback to taskDefaults
        const resultWithoutUrl = resolveFormWorkspaceAndProjectId({
          searchParams: {},
          urlParams: {},
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(resultWithoutUrl.workspaceId).toBe('workspace-1')

        // Test fallback to defaultWorkspace
        const resultWithoutDefaults = resolveFormWorkspaceAndProjectId({
          searchParams: {},
          urlParams: {},
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: undefined,
        })

        expect(resultWithoutDefaults.workspaceId).toBe('default-workspace')
      })
    })

    describe('project resolution', () => {
      it('should handle tasks without projectId', () => {
        const taskWithoutProject = {
          ...mockTask,
        } as unknown as TaskSchema
        // @ts-expect-error - fine
        delete taskWithoutProject.projectId

        const result = resolveFormWorkspaceAndProjectId({
          searchParams: { forTaskId: 'task-1' },
          urlParams: {},
          task: taskWithoutProject,
          defaultWorkspace,
        })

        expect(result.projectId).toBeNull()
      })

      it('should follow priority order: searchParams > urlParams > taskDefaults', () => {
        const result = resolveFormWorkspaceAndProjectId({
          searchParams: { forProject: 'search-project' },
          urlParams: { projectId: 'url-project' },
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(result.projectId).toBe('search-project')

        // Test fallback to urlParams
        const resultWithoutSearch = resolveFormWorkspaceAndProjectId({
          searchParams: {},
          urlParams: { projectId: 'url-project' },
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(resultWithoutSearch.projectId).toBe('url-project')

        // Test fallback to taskDefaults
        const resultWithoutUrl = resolveFormWorkspaceAndProjectId({
          searchParams: {},
          urlParams: {},
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: mockTaskDefaults,
        })

        expect(resultWithoutUrl.projectId).toBe('project-1')
      })

      it('should return null when no project information is available', () => {
        const result = resolveFormWorkspaceAndProjectId({
          searchParams: {},
          urlParams: {},
          task: undefined,
          defaultWorkspace,
          userDefinedTaskDefaults: undefined,
        })

        expect(result.projectId).toBeNull()
      })
    })
  })

  describe('fixed time task handling', () => {
    const now = DateTime.now()

    it('should properly configure fixed time task fields', () => {
      const scheduledStart = now.toISO()
      const scheduledEnd = now.plus({ minutes: 90 }).toISO()

      const result = getInitialFormData({
        ...baseOptions,
        scheduledStart,
        scheduledEnd,
      })

      expect(result).toMatchObject({
        isFixedTimeTask: true,
        scheduledStart,
        scheduledEnd,
        duration: 90,
        isAutoScheduled: true, // Fixed time tasks are always auto-scheduled
        assigneeUserId: baseOptions.currentUserId, // Should assign to current user
      })
    })

    it('should override existing task duration with fixed time duration', () => {
      const scheduledStart = now.toISO()
      const scheduledEnd = now.plus({ minutes: 45 }).toISO()
      const existingTask = {
        id: 'task-1',
        type: 'NORMAL',
        workspaceId: mockWorkspace.id,
        duration: 120,
      } as TaskSchema

      const result = getInitialFormData({
        ...baseOptions,
        task: existingTask,
        scheduledStart,
        scheduledEnd,
      })

      expect(result.duration).toBe(45)
      expect(result.isFixedTimeTask).toBe(true)
    })

    it('should force auto-scheduling even with completed status', () => {
      const scheduledStart = now.toISO()
      const scheduledEnd = now.plus({ minutes: 60 }).toISO()

      const result = getInitialFormData({
        ...baseOptions,
        scheduledStart,
        scheduledEnd,
        searchParams: { forStatus: 'status-2' }, // Completed status
      })

      expect(result.isAutoScheduled).toBe(true)
      expect(result.statusId).toBe('status-2')
    })
  })

  describe('task status handling', () => {
    it('should set isAutoScheduled based on status type', () => {
      // Default status (auto-schedule enabled)
      const resultWithDefaultStatus = getInitialFormData(baseOptions)

      expect(resultWithDefaultStatus.isAutoScheduled).toBe(true)
      expect(resultWithDefaultStatus.statusId).toBe('status-1')

      // Completed status (auto-schedule disabled)
      const resultWithCompletedStatus = getInitialFormData({
        ...baseOptions,
        searchParams: { forStatus: 'status-2' },
      })

      expect(resultWithCompletedStatus.isAutoScheduled).toBe(false)
      expect(resultWithCompletedStatus.statusId).toBe('status-2')
    })

    it('should preserve status when duplicating non-completed task', () => {
      const existingTask = {
        id: 'task-1',
        type: 'NORMAL',
        workspaceId: mockWorkspace.id,
        statusId: 'status-1',
        isAutoScheduled: true,
      } as TaskSchema

      const result = getInitialFormData({
        ...baseOptions,
        task: existingTask,
        searchParams: { forTaskId: 'task-1' },
      })

      expect(result.statusId).toBe('status-1')
      expect(result.isAutoScheduled).toBe(true)
    })

    it('should reset to default status when duplicating completed task', () => {
      const existingTask = {
        id: 'task-1',
        type: 'NORMAL',
        workspaceId: mockWorkspace.id,
        statusId: 'status-2', // Completed status
        isAutoScheduled: false,
      } as TaskSchema

      const result = getInitialFormData({
        ...baseOptions,
        task: existingTask,
        searchParams: { forTaskId: 'task-1' },
      })

      expect(result.statusId).toBe('status-1') // Default status
      expect(result.isAutoScheduled).toBe(true)
    })
  })

  describe('task duplication', () => {
    const existingTask = {
      id: 'task-1',
      type: 'NORMAL',
      workspaceId: mockWorkspace.id,
      name: 'Original Task',
      description: '<p>Original description</p>',
      labelIds: ['label-1'],
      statusId: 'status-2',
      duration: 60,
      completedDuration: 60,
      completedTime: '2024-01-01T00:00:00.000Z',
    } as TaskSchema

    it('should properly duplicate task fields', () => {
      const result = getInitialFormData({
        ...baseOptions,
        task: existingTask,
        searchParams: { forTaskId: 'task-1' },
      })

      expect(result).toMatchObject({
        id: undefined,
        name: 'Original Task (duplicate)',
        description: expect.stringContaining('Duplicated from:'),
        labelIds: ['label-1'],
        duration: 60,
        completedDuration: 0,
        completedTime: null,
      })
    })

    it('should use provided title when duplicating', () => {
      const result = getInitialFormData({
        ...baseOptions,
        task: existingTask,
        searchParams: { forTaskId: 'task-1' },
        taskTitle: 'Custom Title',
      })

      expect(result.name).toBe('Custom Title')
    })

    it('should reset completion-related fields when duplicating', () => {
      const result = getInitialFormData({
        ...baseOptions,
        task: existingTask,
        searchParams: { forTaskId: 'task-1' },
      })

      expect(result.completedTime).toBeNull()
      expect(result.completedDuration).toBe(0)
    })
  })

  describe('recurring task handling', () => {
    const recurringTask = {
      id: 'task-1',
      type: 'RECURRING_TASK',
      workspaceId: mockWorkspace.id,
      name: 'Recurring Task',
      frequency: 'WEEKLY',
      days: ['MO', 'WE', 'FR'],
      startingOn: '2024-01-15',
      timeStart: '9:00 am',
      timeEnd: '6:00 pm',
    } as RecurringTaskSchema

    it('should preserve recurring task specific fields when editing', () => {
      const result = getInitialFormData({
        ...baseOptions,
        task: recurringTask,
        searchParams: { task: 'task-1' },
      })

      expect(result).toMatchObject({
        type: 'RECURRING_TASK',
        frequency: 'WEEKLY',
        days: ['MO', 'WE', 'FR'],
        timeStart: '9:00 am',
        timeEnd: '6:00 pm',
      })
    })

    it('should inherit time settings from parent task when available', () => {
      const parentTask = {
        ...recurringTask,
        timeStart: '10:00 am',
        timeEnd: '7:00 pm',
      }

      const result = getInitialFormData({
        ...baseOptions,
        task: recurringTask,
        parentTask,
        searchParams: { task: 'task-1' },
      })

      expect(result).toMatchObject({
        timeStart: '10:00 am',
        timeEnd: '7:00 pm',
      })
    })
  })

  describe('validateBaseData', () => {
    const baseData: BaseTaskData = {
      assigneeUserId: 'user-1',
      priorityLevel: 'MEDIUM' as const,
      duration: DEFAULT_DURATION,
      minimumDuration: NO_CHUNK_DURATION,
      deadlineType: 'SOFT' as const,
      scheduleId: 'schedule-1',
      ignoreWarnOnPastDue: false,
      statusId: 'status-1',
      labelIds: ['label-1', 'label-2'],
      customFieldValues: {
        'field-1': {
          type: 'text',
          value: 'test',
          instanceId: 'field-1',
          name: 'Field 1',
        },
      },
      isAutoScheduled: true,
    }

    const validateOptions = {
      workspaceStatuses: mockStatuses,
      workspaceLabels: [
        {
          id: 'label-1',
          name: 'Label 1',
          workspaceId: 'workspace-1',
          color: '#000000',
          sortPosition: '1',
          deleted: false,
        },
        {
          id: 'label-3',
          name: 'Label 3',
          workspaceId: 'workspace-1',
          color: '#000000',
          sortPosition: '1',
          deleted: false,
        },
      ],
      workspaceCustomFields: [
        {
          id: 'field-1',
          name: 'Field 1',
          type: 'text',
          workspaceId: 'workspace-1',
        },
      ] as AllAvailableCustomFieldSchema[],
      schedules: mockSchedules,
      searchParams: {},
      isFixedTimeTask: false,
      currentUserId: 'user-1',
    }

    it('should throw error for invalid priority', () => {
      expect(() =>
        validateBaseData(baseData, {
          ...validateOptions,
          searchParams: { forPriority: 'INVALID' },
        })
      ).toThrow('Priority unknown')
    })

    it('should validate and filter label IDs', () => {
      const result = validateBaseData(baseData, validateOptions)

      // Should only keep labels that exist in workspace
      expect(result.labelIds).toEqual(['label-1'])
    })

    it('should override with search params when provided', () => {
      const result = validateBaseData(baseData, {
        ...validateOptions,
        searchParams: {
          forStatus: 'status-2',
          forLabel: 'label-3',
          forPriority: 'HIGH',
          forAssignee: 'user-2',
          forCustomField: {
            'field-1': { type: 'text', value: 'override' },
          },
        },
      })

      expect(result).toMatchObject({
        statusId: 'status-2',
        labelIds: ['label-3'],
        priorityLevel: 'HIGH',
        assigneeUserId: 'user-2',
      })
      expect(result.customFieldValuesFieldArray[0]).toMatchObject({
        value: 'override',
      })
    })

    it('should handle unassigned assignee', () => {
      const result = validateBaseData(baseData, {
        ...validateOptions,
        searchParams: { forAssignee: 'unassigned' },
      })

      expect(result.assigneeUserId).toBeNull()
    })

    it('should handle fixed time task assignment', () => {
      const result = validateBaseData(baseData, {
        ...validateOptions,
        isFixedTimeTask: true,
      })

      expect(result.assigneeUserId).toBe('user-1') // Should use currentUserId
      expect(result.isAutoScheduled).toBe(true) // Should always be true for fixed time
    })

    describe('status and auto-scheduling', () => {
      it('should determine auto-scheduling based on status for non-fixed tasks when isAutoScheduled is not provided', () => {
        const { isAutoScheduled, ...baseWithoutAutoScheduled } = baseData

        // Default status (auto-schedule enabled)
        const resultDefault = validateBaseData(baseWithoutAutoScheduled, {
          ...validateOptions,
          searchParams: { forStatus: 'status-1' },
        })

        expect(resultDefault.isAutoScheduled).toBe(true)

        // Completed status (auto-schedule disabled)
        const resultCompleted = validateBaseData(baseWithoutAutoScheduled, {
          ...validateOptions,
          searchParams: { forStatus: 'status-2' },
        })

        expect(resultCompleted.isAutoScheduled).toBe(false)
      })

      it('should force auto-scheduling for fixed time tasks regardless of status', () => {
        const result = validateBaseData(baseData, {
          ...validateOptions,
          isFixedTimeTask: true,
          searchParams: { forStatus: 'status-2' }, // Completed status
        })

        expect(result.isAutoScheduled).toBe(true)
      })

      it('should use default status when provided status is invalid', () => {
        const result = validateBaseData(
          { ...baseData, statusId: 'invalid-status' },
          validateOptions
        )

        expect(result.statusId).toBe('status-1') // Default status
      })
    })

    describe('schedule validation', () => {
      it('should validate schedule ID', () => {
        // Valid schedule
        const resultValid = validateBaseData(baseData, validateOptions)

        expect(resultValid.scheduleId).toBe('schedule-1')

        // Invalid schedule
        const resultInvalid = validateBaseData(
          { ...baseData, scheduleId: 'invalid-schedule' },
          validateOptions
        )

        expect(resultInvalid.scheduleId).toBe(DEFAULT_SCHEDULE_ID)
      })

      it('should handle undefined schedules', () => {
        const result = validateBaseData(baseData, {
          ...validateOptions,
          schedules: undefined,
        })

        expect(result.scheduleId).toBe(DEFAULT_SCHEDULE_ID)
      })
    })

    describe('custom fields handling', () => {
      it('should map custom field values correctly', () => {
        const result = validateBaseData(baseData, {
          ...validateOptions,
          workspaceCustomFields: [
            {
              id: 'field-1',
              name: 'Field 1',
              type: 'text',
              workspaceId: 'workspace-1',
            } as AllAvailableCustomFieldSchema,
            {
              id: 'field-2',
              name: 'Field 2',
              type: 'number',
              workspaceId: 'workspace-1',
              metadata: { format: 'plain' },
            } as AllAvailableCustomFieldSchema,
          ],
        })

        expect(result.customFieldValuesFieldArray).toHaveLength(2)
        expect(result.customFieldValuesFieldArray[0]).toMatchObject({
          instanceId: 'field-1',
          value: 'test',
        })
        expect(result.customFieldValuesFieldArray[1]).toMatchObject({
          instanceId: 'field-2',
          value: null,
        })
      })

      it('should override custom field values from search params', () => {
        const result = validateBaseData(baseData, {
          ...validateOptions,
          searchParams: {
            forCustomField: {
              'field-1': { type: 'text', value: 'new value' },
            },
          },
        })

        expect(result.customFieldValuesFieldArray[0]).toMatchObject({
          instanceId: 'field-1',
          value: 'new value',
        })
      })
    })
  })
})
