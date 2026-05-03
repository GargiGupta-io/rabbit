import { type TaskDefinitionFormFields } from '../form-fields'
import { mapTaskDefinitionFormToFlowTaskDefinition } from '../map-task-definition-form-to-flow-task-definition'
import { DEFAULT_RELATIVE_DEADLINE, DEFAULT_RELATIVE_START } from '../stages'

describe('mapTaskDefinitionFormToFlowTaskDefinition', () => {
  it('should correctly map task form fields to flow task definition', () => {
    const taskFormFields = {
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      assigneeUserId: 'user-1',
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      duration: 60,
      minimumDuration: 30,
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
      deadlineType: 'HARD',
      scheduleMeetingWithinDays: 3,
      uploadedFiles: [{ id: 'file-1' }],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DEADLINE,
      stageVariables: [],
    } as unknown as TaskDefinitionFormFields

    const result = mapTaskDefinitionFormToFlowTaskDefinition(taskFormFields)

    expect(result).toEqual({
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      assigneeUserId: 'user-1',
      assigneeVariableKey: null,
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      duration: 60,
      minimumDuration: 30,
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
      scheduleMeetingWithinDays: 3,
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DEADLINE,
      deadlineType: 'HARD',
      uploadedFileIds: ['file-1'],
    })
  })

  it('should handle null/undefined values correctly', () => {
    const taskFormFields = {
      id: 'task-1',
      type: 'NORMAL',
      name: 'Test Task',
      workspaceId: 'workspace-1',
      projectId: null,
      deadlineType: 'NONE',
      scheduleMeetingWithinDays: null,
      dueDate: null,
      startDate: null,
      scheduleId: null,
      blockingTaskIds: [],
      isUnvisitedStage: false,
      ignoreWarnOnPastDue: false,
      completedDuration: 0,
      stageDefinitionId: null,
      meetingTaskId: null,
      isFixedTimeTask: false,
      description: '',
      uploadedFileIds: [],
      assigneeUserId: null,
      statusId: 'status-1',
      priorityLevel: 'MEDIUM',
      duration: null,
      minimumDuration: null,
      labelIds: [],
      blockedByTaskIds: [],
      isAutoScheduled: false,
      customFieldValuesFieldArray: [],
      uploadedFiles: [],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DEADLINE,
    } as unknown as TaskDefinitionFormFields

    const result = mapTaskDefinitionFormToFlowTaskDefinition(taskFormFields)

    expect(result).toEqual({
      id: 'task-1',
      name: 'Test Task',
      description: '',
      assigneeUserId: null,
      assigneeVariableKey: null,
      statusId: 'status-1',
      priorityLevel: 'MEDIUM',
      duration: null,
      minimumDuration: null,
      labelIds: [],
      blockedByTaskIds: [],
      isAutoScheduled: false,
      customFieldValuesFieldArray: [],
      scheduleMeetingWithinDays: null,
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DEADLINE,
      deadlineType: 'NONE',
      uploadedFileIds: [],
    })
  })

  it('should handle flow variable key for assignee correctly', () => {
    const taskFormFields = {
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      assigneeUserId: 'flow_key_test',
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      duration: 60,
      minimumDuration: 30,
      labelIds: ['label-1'],
      isAutoScheduled: true,
      customFieldValuesFieldArray: [],
      deadlineType: 'HARD',
      scheduleMeetingWithinDays: null,
      uploadedFiles: [],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DEADLINE,
      blockedByTaskIds: [],
    } as unknown as TaskDefinitionFormFields

    const result = mapTaskDefinitionFormToFlowTaskDefinition(taskFormFields)

    expect(result).toEqual({
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      assigneeUserId: null,
      assigneeVariableKey: 'flow_key_test',
      statusId: 'status-1',
      priorityLevel: 'HIGH',
      duration: 60,
      minimumDuration: 30,
      labelIds: ['label-1'],
      isAutoScheduled: true,
      customFieldValuesFieldArray: [],
      scheduleMeetingWithinDays: null,
      blockedByTaskIds: [],
      startRelativeInterval: DEFAULT_RELATIVE_START,
      dueRelativeInterval: DEFAULT_RELATIVE_DEADLINE,
      deadlineType: 'HARD',
      uploadedFileIds: [],
    })
  })
})
