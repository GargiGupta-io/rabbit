import {
  FLOW_KEY_VIRTUAL_PREFIX,
  type TaskDefinitionRelativeInterval,
} from '@motion/shared/flows'
import { isPlaceholderId } from '@motion/shared/identifiers'
import {
  type ProjectSchema,
  type StageDefinitionSchema,
  type VariableDefinitionSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import {
  mockStageDefinitionVariables,
  projectDefinitionSchemaMock,
  projectDefinitionSchemaMockWithUnusedVariables,
  stageDefinitionSchemaMock,
} from '../../../../mocks'
import {
  type FlowTemplateStage,
  type TaskDefinitionFormRelativeInterval,
} from '../form-fields'
import {
  convertFormRelativeIntervalToRelativeInterval,
  convertFormStagesToStageDefinition,
  convertRelativeIntervalToFormRelativeInterval,
  convertStageDefinitionToFormStage,
  getStageTense,
  getStageVariant,
  isStageActive,
  isValidStageDeadline,
  isVariableTypeUsedInDefinition,
  isVariableUsedInStage,
  stripVirtualAndSystemVariables,
} from '../stages'

describe('stages utils', () => {
  describe('convertRelativeIntervalToFormRelativeInterval', () => {
    it('converts STAGE_START interval correctly', () => {
      const input: TaskDefinitionRelativeInterval = {
        referenceType: 'STAGE_START',
        duration: {
          unit: 'DAYS',
          value: 2,
        },
      }

      const result = convertRelativeIntervalToFormRelativeInterval(input)

      expect(result).toEqual({
        referenceType: 'STAGE_START',
        duration: {
          unit: 'DAYS',
          value: 2,
          sign: 1,
        },
      })
    })

    it('converts STAGE_DUE interval correctly', () => {
      const input: TaskDefinitionRelativeInterval = {
        referenceType: 'STAGE_DUE',
        duration: {
          unit: 'DAYS',
          value: -2,
        },
      }

      const result = convertRelativeIntervalToFormRelativeInterval(input)

      expect(result).toEqual({
        referenceType: 'STAGE_DUE',
        duration: {
          unit: 'DAYS',
          value: 2,
          sign: -1,
        },
      })
    })
  })

  describe('convertFormRelativeIntervalToRelativeInterval', () => {
    it('converts form interval back to relative interval', () => {
      const input: TaskDefinitionFormRelativeInterval = {
        referenceType: 'STAGE_START',
        duration: {
          unit: 'DAYS',
          value: 2,
          sign: 1,
        },
      }

      const result = convertFormRelativeIntervalToRelativeInterval(input)

      expect(result).toEqual({
        referenceType: 'STAGE_START',
        duration: {
          unit: 'DAYS',
          value: 2,
        },
      })
    })

    it('handles negative durations correctly', () => {
      const input: TaskDefinitionFormRelativeInterval = {
        referenceType: 'STAGE_START',
        duration: {
          unit: 'DAYS',
          value: 2,
          sign: -1,
        },
      }

      const result = convertFormRelativeIntervalToRelativeInterval(input)

      expect(result).toEqual({
        referenceType: 'STAGE_START',
        duration: {
          unit: 'DAYS',
          value: -2,
        },
      })
    })
  })

  describe('isValidStageDeadline', () => {
    const mockProject = {
      startDate: '2024-01-01T00:00:00.000Z',
      dueDate: '2024-01-31T00:00:00.000Z',
      stages: [
        { id: 'stage1', dueDate: '2024-01-10T00:00:00.000Z' },
        { id: 'stage2', dueDate: '2024-01-20T00:00:00.000Z' },
        { id: 'stage3', dueDate: '2024-01-30T00:00:00.000Z' },
      ],
    }

    it('returns false for dates before project start', () => {
      const date = DateTime.fromISO('2023-12-31T00:00:00.000Z')

      expect(isValidStageDeadline(date, 'stage1', mockProject)).toBe(false)
    })

    it('returns false for dates after project end', () => {
      const date = DateTime.fromISO('2024-02-01T00:00:00.000Z')

      expect(isValidStageDeadline(date, 'stage3', mockProject)).toBe(false)
    })

    it('returns true for valid dates within stage bounds', () => {
      const date = DateTime.fromISO('2024-01-15T00:00:00.000Z')

      expect(isValidStageDeadline(date, 'stage2', mockProject)).toBe(true)
    })
  })

  describe('getStageVariant', () => {
    it('returns completed for completed stages', () => {
      expect(
        getStageVariant({ completedTime: '2024-01-01T00:00:00.000Z' })
      ).toBe('completed')
    })

    it('returns skipped for canceled stages', () => {
      expect(
        getStageVariant({ canceledTime: '2024-01-01T00:00:00.000Z' })
      ).toBe('skipped')
    })

    it('returns default for active stages', () => {
      expect(getStageVariant({})).toBe('default')
    })
  })

  describe('getStageTense', () => {
    const mockProject = {
      activeStageDefinitionId: 'stage2',
      stages: [
        { stageDefinitionId: 'stage1' },
        { stageDefinitionId: 'stage2' },
        { stageDefinitionId: 'stage3' },
      ],
    } as ProjectSchema

    it('returns past for stages before active stage', () => {
      expect(getStageTense(mockProject, 'stage1')).toBe('past')
    })

    it('returns current for active stage', () => {
      expect(getStageTense(mockProject, 'stage2')).toBe('current')
    })

    it('returns future for stages after active stage', () => {
      expect(getStageTense(mockProject, 'stage3')).toBe('future')
    })
  })

  describe('isStageActive', () => {
    const mockProject = {
      activeStageDefinitionId: 'stage1',
    } as ProjectSchema

    it('returns true for active stage', () => {
      expect(isStageActive(mockProject, 'stage1')).toBe(true)
    })

    it('returns false for inactive stage', () => {
      expect(isStageActive(mockProject, 'stage2')).toBe(false)
    })

    it('returns false for null project', () => {
      expect(isStageActive(null, 'stage1')).toBe(false)
    })
  })

  describe('convertStageDefinitionToFormStage', () => {
    it('converts stage definition to form stage', () => {
      const result = convertStageDefinitionToFormStage({
        stage: stageDefinitionSchemaMock,
        workspaceCustomFields: [],
      })

      const expected = {
        color: 'gray',
        duration: {
          unit: 'DAYS',
          value: 1,
        },
        id: 'stage-id-1',
        name: 'Stage Mock',
        workspaceId: 'workspace-id-1',
        variables: mockStageDefinitionVariables,
        tasks: [
          {
            assigneeUserId: 'user-id-1',
            assigneeVariableKey: 'role-key-1',
            blockedByTaskIds: [],
            customFieldValuesFieldArray: [],
            deadlineType: 'SOFT',
            description: 'Task Mock',
            dueRelativeInterval: {
              duration: {
                sign: -1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_DUE',
            },
            duration: 1,
            id: 'task-id-1',
            isAutoScheduled: false,
            labelIds: [],
            minimumDuration: null,
            name: 'Task Mock {{text-variable-key-1}}',
            priorityLevel: 'MEDIUM',
            scheduleMeetingWithinDays: null,
            startRelativeInterval: {
              duration: {
                sign: 1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_START',
            },
            statusId: 'status-id-1',
            uploadedFileIds: [],
          },
          {
            assigneeUserId: 'user-id-1',
            assigneeVariableKey: 'role-key-1',
            blockedByTaskIds: [],
            customFieldValuesFieldArray: [],
            deadlineType: 'SOFT',
            description: 'Task Mock',
            dueRelativeInterval: {
              duration: {
                sign: -1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_DUE',
            },
            duration: 1,
            id: 'task-id-2',
            isAutoScheduled: false,
            labelIds: [],
            minimumDuration: null,
            name: 'Task Mock',
            priorityLevel: 'MEDIUM',
            scheduleMeetingWithinDays: null,
            startRelativeInterval: {
              duration: {
                sign: 1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_START',
            },
            statusId: 'status-id-1',
            uploadedFileIds: [],
          },
        ],
      }

      expect(result).toEqual(expected)
    })

    it('should set stage autoAdvance to true', () => {
      const result = convertStageDefinitionToFormStage({
        stage: {
          ...stageDefinitionSchemaMock,
        },
        workspaceCustomFields: [],
      })

      const expected = {
        color: 'gray',

        duration: {
          unit: 'DAYS',
          value: 1,
        },
        id: 'stage-id-1',
        name: 'Stage Mock',
        workspaceId: 'workspace-id-1',
        variables: mockStageDefinitionVariables,
        tasks: [
          {
            assigneeUserId: 'user-id-1',
            assigneeVariableKey: 'role-key-1',
            blockedByTaskIds: [],
            customFieldValuesFieldArray: [],
            deadlineType: 'SOFT',
            description: 'Task Mock',
            dueRelativeInterval: {
              duration: {
                sign: -1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_DUE',
            },
            duration: 1,
            id: 'task-id-1',
            isAutoScheduled: false,
            labelIds: [],
            minimumDuration: null,
            name: 'Task Mock {{text-variable-key-1}}',
            priorityLevel: 'MEDIUM',
            scheduleMeetingWithinDays: null,
            startRelativeInterval: {
              duration: {
                sign: 1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_START',
            },
            statusId: 'status-id-1',
            uploadedFileIds: [],
          },
          {
            assigneeUserId: 'user-id-1',
            assigneeVariableKey: 'role-key-1',
            blockedByTaskIds: [],
            customFieldValuesFieldArray: [],
            deadlineType: 'SOFT',
            description: 'Task Mock',
            dueRelativeInterval: {
              duration: {
                sign: -1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_DUE',
            },
            duration: 1,
            id: 'task-id-2',
            isAutoScheduled: false,
            labelIds: [],
            minimumDuration: null,
            name: 'Task Mock',
            priorityLevel: 'MEDIUM',
            scheduleMeetingWithinDays: null,
            startRelativeInterval: {
              duration: {
                sign: 1,
                unit: 'DAYS',
                value: 0,
              },
              referenceId: null,
              referenceType: 'STAGE_START',
            },
            statusId: 'status-id-1',
            uploadedFileIds: [],
          },
        ],
      }

      expect(result).toEqual(expected)
    })
  })

  describe('convertFormStagesToStageDefinition', () => {
    const formStages = [
      {
        id: 'stage1',
        dueDate: '2024-01-10T00:00:00.000Z',
        name: 'Stage Mock',
        duration: {
          unit: 'DAYS',
          value: 1,
        },
        statusId: 'status-id-1',
        color: 'gray',
        tasks: [
          {
            id: 'task-id-1',
            name: 'Task Mock',
            description: 'Task Mock',
            priorityLevel: 'MEDIUM',
            labelIds: [],
            assigneeUserId: 'user-id-1',
            assigneeVariableKey: 'variable-key-1',
            duration: 1,
            minimumDuration: 1,
            isAutoScheduled: false,
            blockedByTaskIds: [],
            statusId: 'status-id-1',
            scheduleMeetingWithinDays: null,
            uploadedFileIds: [],
            deadlineType: 'SOFT',
            customFieldValuesFieldArray: [],
            startRelativeInterval: {
              referenceType: 'STAGE_START' as const,
              duration: {
                unit: 'DAYS',
                value: 1,
                sign: 1,
              },
            },
            dueRelativeInterval: {
              referenceType: 'STAGE_DUE' as const,
              duration: {
                unit: 'DAYS' as const,
                value: 1,
                sign: -1,
              },
            },
          },
        ],
        workspaceId: 'workspace-id-1',
        variables: [],
      } as FlowTemplateStage,
    ]

    it('converts form stages to stage definition', () => {
      const result = convertFormStagesToStageDefinition(formStages, {})

      const expected = [
        {
          color: 'gray',
          dueDate: '2024-01-10T00:00:00.000Z',
          duration: { unit: 'DAYS', value: 1 },
          id: 'stage1',
          name: 'Stage Mock',
          statusId: 'status-id-1',
          workspaceId: 'workspace-id-1',
          variables: [],
          tasks: [
            {
              id: 'task-id-1',
              name: 'Task Mock',
              customFieldValues: {},
              dueRelativeInterval: {
                duration: { unit: 'DAYS', value: -1 },
                referenceType: 'STAGE_DUE',
              },
              startRelativeInterval: {
                duration: { unit: 'DAYS', value: 1 },
                referenceType: 'STAGE_START',
              },
              assigneeUserId: 'user-id-1',
              assigneeVariableKey: 'variable-key-1',
              blockedByTaskIds: [],
              deadlineType: 'SOFT',
              description: 'Task Mock',
              duration: 1,
              isAutoScheduled: false,
              labelIds: [],
              minimumDuration: 1,
              priorityLevel: 'MEDIUM',
              scheduleMeetingWithinDays: null,
              statusId: 'status-id-1',
              uploadedFileIds: [],
            },
          ],
        },
      ]

      expect(result).toEqual(expected)
    })

    it('resets task IDs when tasks are moved to different stages', () => {
      const twoStages = [
        {
          ...formStages[0],
          id: 'stage1',
          tasks: [
            {
              ...formStages[0].tasks[0],
              id: 'task-1',
            },
          ],
        },
        {
          ...formStages[0],
          id: 'stage2',
          tasks: [
            {
              ...formStages[0].tasks[0],
              id: 'task-2',
            },
          ],
        },
      ]

      // Map indicating task-1 was originally in stage 1 (index 0)
      // and task-2 was originally in stage 0
      const originalTaskOrderMap: Record<string, readonly [string, number]> = {
        'task-1': ['stage1', 0],
        'task-2': ['stage1', 0],
      }

      const result = convertFormStagesToStageDefinition(
        twoStages,
        originalTaskOrderMap
      )

      // task-1 should keep its ID since it's in its original stage
      expect(result[0].tasks[0].id).toBe('task-1')

      // task-2 should have a new placeholder ID since it moved from stage 0 to stage 1
      expect(result[1].tasks[0].id).not.toBe('task-2')
      expect(isPlaceholderId(result[1].tasks[0].id)).toBe(true)
    })

    it('preserves task IDs when tasks remain in their original stages', () => {
      const twoStages = [
        {
          ...formStages[0],
          id: 'stage1',
          tasks: [
            {
              ...formStages[0].tasks[0],
              id: 'task-1',
            },
          ],
        },
        {
          ...formStages[0],
          id: 'stage2',
          tasks: [
            {
              ...formStages[0].tasks[0],
              id: 'task-2',
            },
          ],
        },
      ]

      // Map indicating each task is in its original stage
      const originalTaskOrderMap: Record<string, readonly [string, number]> = {
        'task-1': ['stage1', 0],
        'task-2': ['stage2', 0],
      }

      const result = convertFormStagesToStageDefinition(
        twoStages,
        originalTaskOrderMap
      )

      // Both tasks should keep their original IDs
      expect(result[0].tasks[0].id).toBe('task-1')
      expect(result[1].tasks[0].id).toBe('task-2')
    })

    it('handles tasks not in originalTaskOrderMap', () => {
      const twoStages = [
        {
          ...formStages[0],
          id: 'stage1',
          tasks: [
            {
              ...formStages[0].tasks[0],
              id: 'new-task',
            },
          ],
        },
      ]

      // Empty map - task not tracked
      const originalTaskOrderMap = {}

      const result = convertFormStagesToStageDefinition(
        twoStages,
        originalTaskOrderMap
      )

      // Task should keep its ID since it's not in the tracking map
      expect(result[0].tasks[0].id).toBe('new-task')
    })
  })

  describe('stripVirtualAndSystemVariables', () => {
    it('removes variables system and virtual variables', () => {
      const stageDefinition: StageDefinitionSchema = {
        ...stageDefinitionSchemaMock,
        variables: [
          { key: 'flow_key_project_name', name: 'System Variable' },
          { key: FLOW_KEY_VIRTUAL_PREFIX + 'test', name: 'Virtual Variable' },
        ] as VariableDefinitionSchema[],
        tasks: [
          {
            ...stageDefinitionSchemaMock.tasks[0],
            name: 'Task with {{used_var}}',
            description: 'Description with {{used_in_desc}}',
          },
        ],
      }

      const result = stripVirtualAndSystemVariables(stageDefinition)

      expect(result.variables).toHaveLength(0)
      expect(result.variables).toEqual([])
    })

    it('keeps all variables when all are used', () => {
      const stageDefinition: StageDefinitionSchema = {
        ...stageDefinitionSchemaMock,
        variables: [
          { key: '{{var1}}', name: 'Variable 1' },
          { key: '{{var2}}', name: 'Variable 2' },
        ] as VariableDefinitionSchema[],
        tasks: [
          {
            ...stageDefinitionSchemaMock.tasks[0],
            name: 'Task with {{var1}}',
            description: 'Description with {{var2}}',
          },
        ],
      }

      const result = stripVirtualAndSystemVariables(stageDefinition)

      expect(result.variables).toHaveLength(2)
      expect(result.variables).toEqual(stageDefinition.variables)
    })
  })

  describe('isVariableUsedInStage', () => {
    const mockStage = {
      tasks: [
        {
          name: 'Task with {{text_var}}',
          description: 'Description with {{desc_var}}',
          assigneeVariableKey: 'role_var',
        },
        {
          name: 'Another task',
          description: 'Another description',
          assigneeVariableKey: null,
        },
      ],
    } as Pick<StageDefinitionSchema, 'tasks'>

    describe('text variables', () => {
      it('returns true when variable is used in task name', () => {
        expect(
          isVariableUsedInStage({
            stage: mockStage,
            variableKey: 'text_var',
            type: 'text',
          })
        ).toBe(true)
      })

      it('returns true when variable is used in task description', () => {
        expect(
          isVariableUsedInStage({
            stage: mockStage,
            variableKey: 'desc_var',
            type: 'text',
          })
        ).toBe(true)
      })

      it('returns false when text variable is not used', () => {
        expect(
          isVariableUsedInStage({
            stage: mockStage,
            variableKey: 'unused_var',
            type: 'text',
          })
        ).toBe(false)
      })

      it('returns false when text variable is used as role', () => {
        expect(
          isVariableUsedInStage({
            stage: mockStage,
            variableKey: 'role_var',
            type: 'text',
          })
        ).toBe(false)
      })
    })

    describe('role variables', () => {
      it('returns true when variable is used as assignee', () => {
        expect(
          isVariableUsedInStage({
            stage: mockStage,
            variableKey: 'role_var',
            type: 'role',
          })
        ).toBe(true)
      })

      it('returns false when role variable is not used', () => {
        expect(
          isVariableUsedInStage({
            stage: mockStage,
            variableKey: 'unused_role',
            type: 'role',
          })
        ).toBe(false)
      })

      it('returns false when role variable appears in text fields', () => {
        const stageWithRoleInText = {
          tasks: [
            {
              name: 'Task with {{role_var}}',
              description: 'Description',
              assigneeVariableKey: null,
            },
          ],
        } as Pick<StageDefinitionSchema, 'tasks'>

        expect(
          isVariableUsedInStage({
            stage: stageWithRoleInText,
            variableKey: 'role_var',
            type: 'role',
          })
        ).toBe(false)
      })
    })
  })

  describe('isVariableTypeUsedInDefinition', () => {
    it('returns true when role arg is used in projectDefinition', () => {
      expect(
        isVariableTypeUsedInDefinition({
          type: 'role',
          projectDefinition: projectDefinitionSchemaMock,
        })
      ).toBe(true)
    })

    it('returns true when text arg is used in projectDefinition', () => {
      expect(
        isVariableTypeUsedInDefinition({
          projectDefinition: projectDefinitionSchemaMock,
          type: 'text',
        })
      ).toBe(true)
    })

    it('returns false when role arg is not used in projectDefinition', () => {
      expect(
        isVariableTypeUsedInDefinition({
          projectDefinition: projectDefinitionSchemaMockWithUnusedVariables,
          type: 'role',
        })
      ).toBe(false)
    })

    it('returns false when text arg is not used in projectDefinition', () => {
      expect(
        isVariableTypeUsedInDefinition({
          projectDefinition: projectDefinitionSchemaMockWithUnusedVariables,
          type: 'text',
        })
      ).toBe(false)
    })
  })
})
