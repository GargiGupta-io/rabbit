import { DateTime } from 'luxon'

import { convertFieldsForCreate } from '../convert-form-fields-for-create'
import { type TaskFormFields } from '../form-fields'

describe('convertFieldsForCreate', () => {
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
    name: 'Task name',
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
    uploadedFiles: [{ id: '123' }],
  } as TaskFormFields

  const baseExpectedNormal = {
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
    name: 'Task name',
    priorityLevel: 'MEDIUM',
    projectId: 'project123',
    scheduleId: 'schedule123',
    startDate: '2024-07-31',
    statusId: 'status123',
    workspaceId: 'workspace123',
    stageDefinitionId: 'stage123',
    customFieldValues: {
      '1': {
        instanceId: '1',
        name: 'value1',
        type: 'text',
        value: 'value1',
      },
    },
    uploadedFileIds: ['123'],
    type: 'NORMAL',
  }

  it('should convert fields correctly for NORMAL task type', () => {
    const fields = { ...baseFieldsNormal }
    const result = convertFieldsForCreate(fields)

    expect(result).toEqual(baseExpectedNormal)
  })

  it('should convert fields correctly for NORMAL fixed time task type', () => {
    const scheduledStart = DateTime.now().plus({ days: 1 })
    const scheduledEnd = scheduledStart.plus({ hour: 1 })
    const fields = {
      ...baseFieldsNormal,
      isFixedTimeTask: true,
      scheduledStart: scheduledStart.toISO(),
      scheduledEnd: scheduledEnd.toISO(),
    }
    const result = convertFieldsForCreate(fields)

    expect(result.type).toEqual('NORMAL')

    // if check to make TS happy
    if (result.type === 'NORMAL') {
      expect(result.isFixedTimeTask).toBeTruthy()
      expect(result.scheduledStart).toBe(scheduledStart.toISO())
      expect(result.scheduledEnd).toBe(scheduledEnd.toISO())
    }
  })

  const baseFieldsRecurring = {
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

  const baseExpectedRecurring = {
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
    startingOn: '2024-07-31',
    type: 'RECURRING_TASK',
  }

  it('should convert fields correctly for RECURRING_TASK type', () => {
    const fields = { ...baseFieldsRecurring }
    const result = convertFieldsForCreate(fields)

    expect(result).toEqual(baseExpectedRecurring)
  })
})
