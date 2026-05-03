import { getDefaultRelativeInterval } from '@motion/shared/flows'

import { type FlowTemplateFormTask } from '../form-fields'
import { mapTaskDefinitionToTask } from '../map-task-definition-to-task'

const DEFAULT_RELATIVE_START = {
  ...getDefaultRelativeInterval('STAGE_START'),
  duration: {
    unit: 'DAYS' as const,
    value: 0,
    sign: 1 as const,
  },
}
const DEFAULT_RELATIVE_DUE = {
  ...getDefaultRelativeInterval('STAGE_DUE'),
  duration: {
    unit: 'DAYS' as const,
    value: 0,
    sign: -1 as const,
  },
}

describe('mapTaskDefinitionToTask', () => {
  it('should correctly map flow task definition to normal task', () => {
    const flowTask: FlowTemplateFormTask = {
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      assigneeUserId: 'user-1',
      assigneeVariableKey: 'user-1',
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      duration: 60,
      minimumDuration: 30,
      deadlineType: 'HARD',
      labelIds: ['label-1', 'label-2'],
      blockedByTaskIds: ['blocked-task-1'],
      isAutoScheduled: true,
      customFieldValuesFieldArray: [
        {
          instanceId: 'field-1',
          name: 'field-1',
          type: 'text',
          value: 'value-1',
        },
      ],
      scheduleMeetingWithinDays: null,
      uploadedFileIds: [],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DUE,
    }

    const result = mapTaskDefinitionToTask(flowTask, 'workspace-1', 'stage-1')

    expect(result).toMatchObject({
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      assigneeUserId: 'user-1',
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      duration: 60,
      minimumDuration: 30,
      deadlineType: 'HARD',
      labelIds: ['label-1', 'label-2'],
      blockedByTaskIds: ['blocked-task-1'],
      isAutoScheduled: true,
      workspaceId: 'workspace-1',
      type: 'NORMAL',
      dueDate: null,
      startDate: null,
      customFieldValues: {
        'field-1': {
          instanceId: 'field-1',
          name: 'field-1',
          type: 'text',
          value: 'value-1',
        },
      },
    })
  })

  it('should handle null/undefined values correctly', () => {
    const flowTask: FlowTemplateFormTask = {
      id: 'task-1',
      name: 'Test Task',
      description: '',
      assigneeUserId: null,
      assigneeVariableKey: null,
      statusId: 'status-1',
      priorityLevel: 'MEDIUM',
      duration: null,
      minimumDuration: null,
      deadlineType: 'NONE',
      labelIds: [],
      blockedByTaskIds: [],
      isAutoScheduled: false,
      customFieldValuesFieldArray: [],
      scheduleMeetingWithinDays: null,
      uploadedFileIds: [],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DUE,
    }

    const result = mapTaskDefinitionToTask(flowTask, 'workspace-1', null)

    expect(result).toMatchObject({
      id: 'task-1',
      name: 'Test Task',
      description: '',
      assigneeUserId: null,
      statusId: 'status-1',
      priorityLevel: 'MEDIUM',
      duration: null,
      minimumDuration: null,
      labelIds: [],
      blockedByTaskIds: [],
      isAutoScheduled: false,
      workspaceId: 'workspace-1',
      type: 'NORMAL',
      dueDate: null,
      deadlineType: 'NONE',
      startDate: null,
      customFieldValues: {},
    })
  })

  it('should use assigneeVariableKey when assigneeUserId is null', () => {
    const flowTask: FlowTemplateFormTask = {
      id: 'task-1',
      name: 'Test Task',
      description: '',
      assigneeUserId: null,
      assigneeVariableKey: 'variable-1',
      statusId: 'status-1',
      priorityLevel: 'MEDIUM',
      deadlineType: 'NONE',
      duration: null,
      minimumDuration: null,
      labelIds: [],
      blockedByTaskIds: [],
      isAutoScheduled: false,
      customFieldValuesFieldArray: [],
      scheduleMeetingWithinDays: null,
      uploadedFileIds: [],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DUE,
    }

    const result = mapTaskDefinitionToTask(flowTask, 'workspace-1', null)

    expect(result.assigneeUserId).toBe('variable-1')
  })
})
