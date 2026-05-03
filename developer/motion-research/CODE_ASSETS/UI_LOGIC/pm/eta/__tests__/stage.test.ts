import { type StageSchema } from '@motion/rpc-types'
import {
  FLOW_KEY_VIRTUAL_PREFIX,
  PROJECT_NAME_FLOW_KEY,
} from '@motion/shared/flows'
import {
  type StageDefinitionSchema,
  type TaskDefinitionSchema,
  type VariableDefinitionSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { stripVirtualAndSystemVariables } from '../../project/flows/stages'
import {
  getExtendedStageDeadlineStatus,
  getStageEtaTooltip,
  getStageNoEtaReason,
  normalizeStageDeadlineStatus,
} from '../stage'

describe('normalizeStageDeadlineStatus - stage', () => {
  it('should return at-risk if stage has missed deadline', () => {
    const stage = {
      deadlineStatus: 'missed-deadline',
    } as StageSchema

    const result = normalizeStageDeadlineStatus(stage)

    expect(result).toEqual('at-risk')
  })

  it('should return at-risk if stage is scheduled past deadline', () => {
    const stage = {
      deadlineStatus: 'scheduled-past-deadline',
    } as StageSchema

    const result = normalizeStageDeadlineStatus(stage)

    expect(result).toEqual('at-risk')
  })

  it('should return the same status if stage is not at risk', () => {
    const stage = {
      deadlineStatus: 'on-track',
    } as StageSchema

    const result = normalizeStageDeadlineStatus(stage)

    expect(result).toEqual('on-track')
  })
})

describe('getDeadlineStatusWithReason - stage', () => {
  it('should return none if stage is not provided', () => {
    const stage = null

    const result = getExtendedStageDeadlineStatus(stage)

    expect(result).toEqual('none')
  })

  it('should return previous deadlineStatus if not none', () => {
    const stage = {
      deadlineStatus: 'on-track',
    } as StageSchema

    const result = getExtendedStageDeadlineStatus(stage)

    expect(result).toEqual('on-track')
  })

  it('should return completed if stage is completed', () => {
    const stage = {
      deadlineStatus: 'none',
      completedTime: '2021-09-01T00:00:00Z',
    } as StageSchema

    const result = getExtendedStageDeadlineStatus(stage)

    expect(result).toEqual('completed')
  })

  it('should return canceled if stage is canceled', () => {
    const stage = {
      deadlineStatus: 'none',
      canceledTime: '2021-09-01T00:00:00Z',
    } as StageSchema

    const result = getExtendedStageDeadlineStatus(stage)

    expect(result).toEqual('canceled')
  })
})

describe('getNoEtaText - stage', () => {
  it('returns nothing if eta is not none', () => {
    const stage = {
      deadlineStatus: 'on-track',
    } as StageSchema

    const result = getStageNoEtaReason(stage)

    expect(result).toBeNull()
  })

  it('returns completed text if stage is completed', () => {
    const stage = {
      deadlineStatus: 'none',
      completedTime: '2021-09-01T00:00:00Z',
    } as StageSchema

    const result = getStageNoEtaReason(stage)

    expect(result).toEqual('Stage complete')
  })

  it('returns canceled text if stage is canceled', () => {
    const stage = {
      deadlineStatus: 'none',
      canceledTime: '2021-09-01T00:00:00Z',
    } as StageSchema

    const result = getStageNoEtaReason(stage)

    expect(result).toEqual('Stage canceled')
  })

  it('returns no auto scheduled task if no scheduled status', () => {
    const stage = {
      deadlineStatus: 'none',
      scheduledStatus: null,
    } as StageSchema

    const result = getStageNoEtaReason(stage)

    expect(result).toEqual(
      'No ETA because there are no auto-scheduled tasks in this stage'
    )
  })

  it('returns generic text if stage is not completed or canceled', () => {
    const stage = {
      deadlineStatus: 'none',
      scheduledStatus: 'UNFIT_PAST_DUE',
    } as StageSchema

    const result = getStageNoEtaReason(stage)

    expect(result).toEqual('No ETA')
  })
})

const mockPluralize = (num: number, singular: string, plural: string) =>
  `${num} ${num === 1 ? singular : plural}`

describe('getStageEtaTooltip', () => {
  const mockStage = {
    id: '1',
    type: 'NORMAL',
    estimatedCompletionTime: DateTime.now().toISO(),
    dueDate: DateTime.now().plus({ days: 1 }).toISO(),
  }

  it('should return no ETA reason when deadlineStatus is none and not auto scheduled', () => {
    const stage = {
      ...mockStage,
      deadlineStatus: 'none',
    } as unknown as StageSchema

    const result = getStageEtaTooltip(stage, mockPluralize)

    expect(result).toEqual({
      title: 'No ETA because there are no auto-scheduled tasks in this stage',
      action: undefined,
      etaText: undefined,
    })
  })

  it('should return missed deadline tooltip when deadlineStatus is missed-deadline', () => {
    const stage = {
      ...mockStage,
      deadlineStatus: 'missed-deadline',
    } as unknown as StageSchema
    const result = getStageEtaTooltip(stage, mockPluralize)

    expect(result?.title).toContain('Missed deadline')
  })

  it('should return scheduled past deadline tooltip when deadlineStatus is scheduled-past-deadline', () => {
    const stage = {
      ...mockStage,
      deadlineStatus: 'scheduled-past-deadline',
    } as unknown as StageSchema
    const result = getStageEtaTooltip(stage, mockPluralize)

    expect(result?.title).toContain('Scheduled past deadline')
  })

  it('should return on track tooltip when deadlineStatus is on-track', () => {
    const stage = {
      ...mockStage,
      deadlineStatus: 'on-track',
    } as unknown as StageSchema
    const result = getStageEtaTooltip(stage, mockPluralize)

    expect(result?.title).toContain('On track')
  })

  it('should handle stages with no estimatedCompletionTime', () => {
    const stage = {
      ...mockStage,
      estimatedCompletionTime: null,
      deadlineStatus: 'on-track',
    } as unknown as StageSchema
    const result = getStageEtaTooltip(stage, mockPluralize)

    expect(result?.title).toContain('On track')
  })

  it('should handle stages with no dueDate', () => {
    const stage = {
      ...mockStage,
      dueDate: null,
      deadlineStatus: 'on-track',
    } as unknown as StageSchema
    const result = getStageEtaTooltip(stage, mockPluralize)

    expect(result?.title).toContain('On track')
  })
})

describe('stripVirtualAndSystemVariables', () => {
  const mockVariable = {
    key: 'test_var',
    type: 'person',
    name: 'Test Variable',
    id: '1',
    color: 'red',
  } satisfies VariableDefinitionSchema

  it('keeps variables used in assigneeVariableKey', () => {
    const stageDefinition = {
      variables: [mockVariable],
      tasks: [
        {
          name: 'Test Task',
          description: '',
          assigneeVariableKey: 'test_var',
        } as unknown as TaskDefinitionSchema,
      ],
      id: '1',
      name: 'Test Stage',
    } as StageDefinitionSchema

    const result = stripVirtualAndSystemVariables(stageDefinition)

    expect(result.variables).toHaveLength(1)
    expect(result.variables[0].key).toBe('test_var')
  })

  it('keeps variables used in task name', () => {
    const stageDefinition = {
      variables: [mockVariable],
      tasks: [
        {
          name: 'Task for test_var',
          description: '',
          assigneeVariableKey: null,
        } as unknown as TaskDefinitionSchema,
      ],
      id: '1',
      name: 'Test Stage',
    } as StageDefinitionSchema

    const result = stripVirtualAndSystemVariables(stageDefinition)

    expect(result.variables).toHaveLength(1)
    expect(result.variables[0].key).toBe('test_var')
  })

  it('keeps variables used in task description', () => {
    const stageDefinition = {
      variables: [mockVariable],
      tasks: [
        {
          name: 'Test Task',
          description: 'Assigned to test_var',
          assigneeVariableKey: null,
        } as unknown as TaskDefinitionSchema,
      ],
      id: '1',
      name: 'Test Stage',
    } as StageDefinitionSchema

    const result = stripVirtualAndSystemVariables(stageDefinition)

    expect(result.variables).toHaveLength(1)
    expect(result.variables[0].key).toBe('test_var')
  })

  it('removes system variables and virtual variables', () => {
    const stageDefinition = {
      variables: [
        {
          ...mockVariable,
          key: PROJECT_NAME_FLOW_KEY,
        },
        {
          ...mockVariable,
          key: FLOW_KEY_VIRTUAL_PREFIX + 'test_var',
        },
      ],
      tasks: [
        {
          name: 'Test Task',
          description: '',
          assigneeVariableKey: null,
        } as unknown as TaskDefinitionSchema,
      ],
      id: '1',
      name: 'Test Stage',
    } as StageDefinitionSchema

    const result = stripVirtualAndSystemVariables(stageDefinition)

    expect(result.variables).toHaveLength(0)
  })
})
