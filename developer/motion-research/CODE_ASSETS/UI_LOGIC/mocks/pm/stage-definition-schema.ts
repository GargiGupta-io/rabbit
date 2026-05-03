/* c8 ignore start */

import type {
  StageDefinitionSchema,
  VariableDefinitionSchema,
} from '@motion/rpc-types'
import { getDefaultRelativeInterval } from '@motion/shared/flows'

import { type VariableArg } from '../../pm/project'

export const mockStageDefinitionId = 'stage-id-1'
export const mockStageDefinitionRoleVariable: VariableArg = {
  variableId: 'role-key-1',
  value: null,
  stageId: mockStageDefinitionId,
}

export const mockStageDefinitionTextVariable: VariableArg = {
  variableId: 'text-variable-1',
  value: '',
  stageId: mockStageDefinitionId,
}

export const mockStageDefinitionVariables: VariableDefinitionSchema[] = [
  {
    name: 'Text Variable',
    color: 'gray',
    type: 'text',
    key: 'text-variable-key-1',
    id: mockStageDefinitionTextVariable.variableId,
  },
  {
    name: 'Role Variable',
    color: 'gray',
    type: 'person',
    key: 'role-key-1',
    id: mockStageDefinitionRoleVariable.variableId,
  },
]
export const stageDefinitionSchemaMock = {
  id: mockStageDefinitionId,
  name: 'Stage Mock',
  duration: {
    unit: 'DAYS',
    value: 1,
  },
  tasks: [
    {
      id: 'task-id-1',
      name: 'Task Mock {{text-variable-key-1}}',
      description: 'Task Mock',
      priorityLevel: 'MEDIUM',
      labelIds: [],
      assigneeUserId: 'user-id-1',
      assigneeVariableKey: 'role-key-1',
      duration: 1,
      minimumDuration: 1,
      isAutoScheduled: false,
      blockedByTaskIds: [],
      statusId: 'status-id-1',
      scheduleMeetingWithinDays: null,
      startRelativeInterval: getDefaultRelativeInterval('STAGE_START'),
      dueRelativeInterval: getDefaultRelativeInterval('STAGE_DUE'),
    },
    {
      id: 'task-id-2',
      name: 'Task Mock',
      description: 'Task Mock',
      priorityLevel: 'MEDIUM',
      labelIds: [],
      assigneeUserId: 'user-id-1',
      assigneeVariableKey: 'role-key-1',
      duration: 1,
      minimumDuration: 1,
      isAutoScheduled: false,
      blockedByTaskIds: [],
      statusId: 'status-id-1',
      scheduleMeetingWithinDays: null,
      startRelativeInterval: getDefaultRelativeInterval('STAGE_START'),
      dueRelativeInterval: getDefaultRelativeInterval('STAGE_DUE'),
    },
  ],
  color: 'gray',
  workspaceId: 'workspace-id-1',
  variables: mockStageDefinitionVariables,
} as const satisfies StageDefinitionSchema
