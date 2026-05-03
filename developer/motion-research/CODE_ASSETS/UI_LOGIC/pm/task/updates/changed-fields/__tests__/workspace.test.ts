import {
  type GlobalUserTaskDefaultSettingsSchema,
  type StatusSchema,
} from '@motion/rpc-types'
import { StatusType } from '@motion/shared/common'
import { type CustomFieldSchema } from '@motion/shared/custom-fields'

import { type WorkspaceMemberWithUser } from '../../../../members'
import {
  type TaskFormChangedFieldOptions,
  type UpdatableTaskSchema,
} from '../../types'
import { getTaskWorkspaceChangedFields } from '../workspace'

describe('getTaskWorkspaceChangedFields', () => {
  const defaultTask = {
    type: 'NORMAL',
    assigneeUserId: null,
    workspaceId: 'workspace-1',
    statusId: 'status-1',
    labelIds: [],
    projectId: null,
  } as unknown as UpdatableTaskSchema

  const defaultOptions: TaskFormChangedFieldOptions = {
    fieldNameBeingUpdated: 'workspaceId',
    currentUserId: 'current-user',
    statuses: [
      { id: 'default-status-0', type: StatusType.DEFAULT } as StatusSchema,
      { id: 'status-54', type: null } as StatusSchema,
    ],
    members: [
      {
        id: 'member-1',
        userId: 'assignee-1',
        user: { onboardingComplete: true },
      } as WorkspaceMemberWithUser,
      {
        id: 'member-2',
        userId: 'assignee-2',
        user: { onboardingComplete: true },
      } as WorkspaceMemberWithUser,
    ],
    projects: [],
    customFields: [
      {
        id: 'custom-field-1',
        type: 'number',
        name: 'Custom Field 1',
        workspaceId: 'workspace-1',
      } as any,
      {
        id: 'custom-field-2',
        type: 'multiSelect',
        name: 'Custom Field 2',
        workspaceId: 'workspace-1',
        metadata: {
          options: [
            {
              id: 'option-1',
              value: 'Option 1',
              color: 'red',
              deletedTime: null,
            },
            {
              id: 'option-2',
              value: 'Option 2',
              color: 'red',
              deletedTime: null,
            },
          ],
        },
      },
    ],
    globalTaskDefaults: undefined,
  }

  it('returns an object with the new status id', () => {
    const task = { ...defaultTask }
    const options = { ...defaultOptions }

    expect(getTaskWorkspaceChangedFields(task, options)).toMatchObject({
      statusId: 'default-status-0',
      projectId: null,
      customFieldValuesFieldArray: expect.any(Array),
    })
  })

  it('returns an object with the status and label being reset', () => {
    const task = {
      ...defaultTask,
      labelIds: ['label-1', 'label-2'],
    }
    const options = { ...defaultOptions }

    expect(getTaskWorkspaceChangedFields(task, options)).toMatchObject({
      statusId: 'default-status-0',
      labelIds: [],
      projectId: null,
      customFieldValuesFieldArray: expect.any(Array),
    })
  })

  it('returns an object with the status and the assignee reset to current user', () => {
    const task = {
      ...defaultTask,
      assigneeUserId: 'unknown-assignee',
    }
    const options = {
      ...defaultOptions,
      members: [
        {
          id: 'member-2',
          userId: 'assignee-2',
          user: { onboardingComplete: true },
        } as WorkspaceMemberWithUser,
      ],
    }

    expect(getTaskWorkspaceChangedFields(task, options)).toMatchObject({
      statusId: 'default-status-0',
      assigneeUserId: 'current-user',
      projectId: null,
      customFieldValuesFieldArray: expect.any(Array),
    })
  })

  it('returns an object with the custom fields set to updated', () => {
    const task = {
      ...defaultTask,
      customFields: [
        {
          id: 'dif-custom-field-1',
        } as CustomFieldSchema,
        {
          id: 'dif-custom-field-2',
        } as CustomFieldSchema,
      ],
    }
    const options = { ...defaultOptions }

    expect(getTaskWorkspaceChangedFields(task, options)).toMatchObject({
      statusId: 'default-status-0',
      projectId: null,
      customFieldValuesFieldArray: [
        {
          instanceId: 'custom-field-1',
          name: 'Custom Field 1',
          type: 'number',
          value: null,
        },
        {
          instanceId: 'custom-field-2',
          name: 'Custom Field 2',
          type: 'multiSelect',
          value: null,
        },
      ],
    })
  })

  it('uses globalTaskDefaults when provided and matching workspace', () => {
    const task = { ...defaultTask }
    const options = {
      ...defaultOptions,
      globalTaskDefaults: {
        workspaceId: task.workspaceId,
        statusId: 'custom-status',
        assigneeUserId: 'custom-assignee',
        projectId: 'custom-project',
        customFieldValues: {
          'custom-field-1': { type: 'number', value: 42 },
          'custom-field-2': { type: 'multiSelect', value: ['option-1'] },
        },
      } as unknown as GlobalUserTaskDefaultSettingsSchema,
    }

    expect(getTaskWorkspaceChangedFields(task, options)).toMatchObject({
      statusId: 'custom-status',
      assigneeUserId: 'custom-assignee',
      projectId: 'custom-project',
      customFieldValuesFieldArray: [
        {
          instanceId: 'custom-field-1',
          name: 'Custom Field 1',
          type: 'number',
          value: 42,
        },
        {
          instanceId: 'custom-field-2',
          name: 'Custom Field 2',
          type: 'multiSelect',
          value: ['option-1'],
        },
      ],
    })
  })
})
