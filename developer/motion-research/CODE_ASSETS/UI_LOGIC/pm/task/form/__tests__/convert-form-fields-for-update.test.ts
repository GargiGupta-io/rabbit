import { convertFormFieldsForUpdate } from '../convert-form-fields-for-update'
import { type TaskFormFields } from '../form-fields'

describe('convertFormFieldsForUpdate', () => {
  // Base input fields for different task types
  const baseFieldsNormal = {
    type: 'NORMAL',
    assigneeUserId: 'user123',
    blockedByTaskIds: ['task1', 'task2'],
    deadlineType: 'HARD',
    description: 'Task description',
    dueDate: '2024-08-01',
    duration: 120,
    ignoreWarnOnPastDue: true,
    isAutoScheduled: false,
    labelIds: ['label1'],
    minimumDuration: 30,
    name: 'Normal Task',
    priorityLevel: 'MEDIUM',
    projectId: 'project123',
    scheduleId: 'schedule123',
    startDate: '2024-07-31',
    statusId: 'status123',
    workspaceId: 'workspace123',
    stageDefinitionId: 'stage123',
    customFieldValuesFieldArray: [
      { instanceId: '1', name: 'value1', type: 'text', value: 'value1' },
    ],
  } as TaskFormFields

  const baseFieldsRecurringInstance = {
    ...baseFieldsNormal,
    type: 'RECURRING_INSTANCE',
    statusId: 'status123',
    dueDate: '2024-08-01',
    duration: 120,
    completedDuration: 60,
    ignoreWarnOnPastDue: true,
  } as TaskFormFields

  const baseFieldsRecurringTask = {
    type: 'RECURRING_TASK',
    frequency: 'WEEKLY',
    idealTime: '10:00',
    ignoreWarnOnPastDue: true,
    isAutoScheduled: false,
    labelIds: ['label1'],
    minimumDuration: 30,
    name: 'Recurring Task',
    statusId: 'status123',
    timeEnd: '11:00',
    timeStart: '09:00',
    workspaceId: 'workspace123',
    assigneeUserId: 'user123',
    deadlineType: 'SOFT',
    description: 'Recurring task description',
    recurrenceMeta: 'Every week',
    days: ['MO', 'WE'],
    duration: 120,
    priorityLevel: 'HIGH',
    scheduleId: 'schedule123',
    startDate: '2024-07-31',
  } as TaskFormFields

  // Base expected results for different task types
  const baseExpectedNormal = {
    workspaceId: 'workspace123',
    projectId: 'project123',
    assigneeUserId: 'user123',
    statusId: 'status123',
    labelIds: ['label1'],
    priorityLevel: 'MEDIUM',
    duration: 120,
    minimumDuration: 30,
    name: 'Normal Task',
    description: 'Task description',
    startDate: '2024-07-31',
    dueDate: '2024-08-01',
    deadlineType: 'HARD',
    scheduleId: 'schedule123',
    isAutoScheduled: false,
    ignoreWarnOnPastDue: true,
    customFieldValues: {
      '1': {
        instanceId: '1',
        name: 'value1',
        type: 'text',
        value: 'value1',
      },
    },
    stageDefinitionId: 'stage123',
  }

  const baseExpectedRecurringInstance = {
    statusId: 'status123',
    dueDate: '2024-08-01',
    duration: 120,
    completedDuration: 60,
    ignoreWarnOnPastDue: true,
  }

  const baseExpectedRecurringTask = {
    workspaceId: 'workspace123',
    assigneeUserId: 'user123',
    statusId: 'status123',
    labelIds: ['label1'],
    priorityLevel: 'HIGH',
    duration: 120,
    minimumDuration: 30,
    name: 'Recurring Task',
    description: 'Recurring task description',
    startingOn: '2024-07-31T00:00:00.000+00:00',
    deadlineType: 'SOFT',
    frequency: 'WEEKLY',
    recurrenceMeta: 'Every week',
    days: ['MO', 'WE'],
    scheduleId: 'schedule123',
    idealTime: '10:00',
    timeStart: '09:00',
    timeEnd: '11:00',
    isAutoScheduled: false,
    ignoreWarnOnPastDue: true,
  }

  it('should convert fields correctly for NORMAL task type', () => {
    const fields = { ...baseFieldsNormal }
    const dirtyKeys = Object.keys(fields) as (keyof typeof fields)[]
    const dirtyCustomFieldsArray = [{ value: 'value1' }]

    const result = convertFormFieldsForUpdate(
      fields,
      dirtyKeys,
      dirtyCustomFieldsArray
    )

    expect(result).toEqual(baseExpectedNormal)
  })

  it('should convert fields correctly for RECURRING_INSTANCE task type', () => {
    const fields = { ...baseFieldsRecurringInstance }
    const dirtyKeys = Object.keys(fields) as (keyof typeof fields)[]

    const result = convertFormFieldsForUpdate(fields, dirtyKeys, [])

    expect(result).toEqual(baseExpectedRecurringInstance)
  })

  it('should convert fields correctly for RECURRING_TASK task type', () => {
    const fields = { ...baseFieldsRecurringTask }
    const dirtyKeys = Object.keys(fields) as (keyof typeof fields)[]
    const dirtyCustomFieldsArray = [{ value: 'value1' }]

    const result = convertFormFieldsForUpdate(
      fields,
      dirtyKeys,
      dirtyCustomFieldsArray
    )

    expect(result).toEqual(baseExpectedRecurringTask)
  })
})
