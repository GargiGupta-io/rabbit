import {
  type ProjectSchema,
  type RecurringTaskSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { getTaskDefaultDates } from '../get-task-default-dates'

describe('getTaskDefaultDates', () => {
  const mockToday = '2023-05-01'

  beforeEach(() => {
    vi.clearAllMocks()
    tk.freeze(new Date(mockToday))
  })

  afterEach(() => {
    tk.reset()
  })

  describe('Default behavior', () => {
    it('should return default dates when project or stageDefinitionId is null', () => {
      const mockTomorrow = '2023-05-02T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
      })

      expect(result).toEqual({
        startDate: mockToday,
        dueDate: mockTomorrow,
      })
    })

    it('should use default dates when stage is not found', () => {
      const mockProject = {
        stages: [{ stageDefinitionId: 'stage1', dueDate: '2023-05-10' }],
      } as ProjectSchema
      const mockTomorrow = '2023-05-02T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: mockProject,
        stageDefinitionId: 'nonexistent',
      })

      expect(result).toEqual({
        startDate: mockToday,
        dueDate: mockTomorrow,
      })
    })
  })

  describe('Project and stage handling', () => {
    it('should return correct dates for a valid project and stage', () => {
      const mockStartDate = '2023-05-05'
      const mockProject = {
        stages: [
          { stageDefinitionId: 'stage1', dueDate: '2023-05-10' },
          { stageDefinitionId: 'stage2', dueDate: '2023-05-20' },
        ],
        startDate: mockStartDate,
      } as ProjectSchema

      tk.freeze(DateTime.fromISO(mockStartDate).toJSDate())

      const result = getTaskDefaultDates({
        project: mockProject,
        stageDefinitionId: 'stage2',
      })

      expect(result).toEqual({
        startDate: '2023-05-10', // This is now correct based on the new logic
        dueDate: '2023-05-20T23:59:59.999+00:00',
      })
    })

    it('should prioritize dueDateOverride over flow project due date', () => {
      const mockProject = {
        stages: [
          { stageDefinitionId: 'stage1', dueDate: '2023-05-10' },
          { stageDefinitionId: 'stage2', dueDate: '2023-05-20' },
        ],
        startDate: '2023-05-01',
      } as ProjectSchema

      const dueDateOverride = '2023-06-01T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: mockProject,
        stageDefinitionId: 'stage2',
        dueDateOverride,
      })

      expect(result.startDate).toBe('2023-05-10') // Flow project start date
      expect(result.dueDate).toBe(dueDateOverride)
    })

    it('should prioritize startOverride over flow project start date', () => {
      const mockProject = {
        stages: [
          { stageDefinitionId: 'stage1', dueDate: '2023-05-10' },
          { stageDefinitionId: 'stage2', dueDate: '2023-05-20' },
        ],
        startDate: '2023-05-01',
      } as ProjectSchema

      const startOverride = '2023-05-15'

      const result = getTaskDefaultDates({
        project: mockProject,
        stageDefinitionId: 'stage2',
        startOverride,
      })

      expect(result.startDate).toBe(startOverride)
      expect(result.dueDate).toBe('2023-05-20T23:59:59.999+00:00')
    })
  })

  describe('Task-based date handling', () => {
    it('should use task to determine initial start date', () => {
      const mockTask: TaskSchema = {
        id: 'task1',
        startDate: '2023-05-03',
      } as TaskSchema

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockTask,
      })

      expect(result.startDate).toBe('2023-05-03')
      expect(result.dueDate).toBe('2023-05-04T23:59:59.999+00:00')
    })

    it('should use task fields when both are provided', () => {
      const mockTask: TaskSchema = {
        id: 'task1',
        startDate: '2023-05-03',
        dueDate: '2023-05-05T23:59:59.999+00:00',
      } as TaskSchema

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockTask,
      })

      expect(result.startDate).toBe('2023-05-03')
      expect(result.dueDate).toBe('2023-05-05T23:59:59.999+00:00')
    })

    it('should use task dueDate when provided', () => {
      const mockTask: TaskSchema = {
        id: 'task1',
        startDate: '2023-05-03',
        dueDate: '2023-05-10T23:59:59.999+00:00',
      } as TaskSchema

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockTask,
      })

      expect(result.startDate).toBe('2023-05-03')
      expect(result.dueDate).toBe('2023-05-10T23:59:59.999+00:00')
    })

    it('should correctly determine initial start date from task', () => {
      const mockTask: TaskSchema = {
        id: 'task1',
        startDate: '2023-05-03',
      } as TaskSchema

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockTask,
      })

      expect(result.startDate).toBe('2023-05-03')
      expect(result.dueDate).toBe('2023-05-04T23:59:59.999+00:00')
    })

    it('should handle RecurringTaskSchema', () => {
      const mockRecurringTask: RecurringTaskSchema = {
        id: 'recurringTask1',
        type: 'RECURRING_TASK',
        startingOn: '2023-05-08',
      } as RecurringTaskSchema

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockRecurringTask,
      })

      expect(result.startDate).toBe('2023-05-08')
      expect(result.dueDate).toBe('2023-05-09T23:59:59.999+00:00')
    })
  })

  describe('Override handling', () => {
    it('should use startOverride when provided', () => {
      const startOverride = '2023-05-15'
      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        startOverride,
      })

      expect(result.startDate).toBe(startOverride)
    })

    it('should use dueDateOverride when provided', () => {
      const dueDateOverride = '2023-05-20T23:59:59.999+00:00'
      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        dueDateOverride,
      })

      expect(result.dueDate).toBe(dueDateOverride)
    })

    it('should use startOverride and dueDateOverride when both are provided', () => {
      const startOverride = '2023-06-01T00:00:00.000Z'
      const dueDateOverride = '2023-06-05T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        startOverride,
        dueDateOverride,
      })

      expect(result.startDate).toBe(startOverride)
      expect(result.dueDate).toBe(dueDateOverride)
    })

    it('should prioritize startOverride over task-based start date', () => {
      const mockTask: TaskSchema = {
        id: 'task1',
        startDate: '2023-05-03',
      } as TaskSchema

      const startOverride = '2023-05-15'

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockTask,
        startOverride,
      })

      expect(result.startDate).toBe(startOverride)
    })

    it('should prioritize dueDateOverride over task dueDate', () => {
      const mockTask: TaskSchema = {
        id: 'task1',
        startDate: '2023-05-03',
        dueDate: '2023-05-10T23:59:59.999+00:00',
      } as TaskSchema

      const dueDateOverride = '2023-05-15T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        task: mockTask,
        dueDateOverride,
      })

      expect(result.startDate).toBe('2023-05-03')
      expect(result.dueDate).toBe(dueDateOverride)
    })
  })

  describe('Date adjustment and validation', () => {
    it('should not adjust due date when it is later than start date', () => {
      const startDate = '2023-05-01T00:00:00.000Z'
      const dueDate = '2023-05-03T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        startOverride: startDate,
        dueDateOverride: dueDate,
      })

      expect(result.startDate).toBe(startDate)
      expect(result.dueDate).toBe(dueDate)
    })

    it('should not adjust due date when overridden', () => {
      const startOverride = '2023-05-10T00:00:00.000Z'
      const dueDateOverride = '2023-05-05T23:59:59.999+00:00'

      const result = getTaskDefaultDates({
        project: null,
        stageDefinitionId: null,
        startOverride,
        dueDateOverride,
      })

      expect(result.startDate).toBe(startOverride)
      expect(result.dueDate).toBe(dueDateOverride)
    })
  })
})
