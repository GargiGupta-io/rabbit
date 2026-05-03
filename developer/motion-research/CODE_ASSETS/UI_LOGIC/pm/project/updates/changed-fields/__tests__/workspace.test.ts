import {
  type StatusSchema,
  type WorkspaceMemberSchema,
} from '@motion/rpc-types'
import { StatusType } from '@motion/shared/common'
import { type CustomFieldSchema } from '@motion/shared/custom-fields'

import {
  type ProjectFormChangedFieldOptions,
  type UpdatableProjectSchema,
} from '../../types'
import { getProjectWorkspaceChangedFields } from '../workspace'

describe('getProjectWorkspaceChangedFields', () => {
  const defaultProject = {
    type: 'NORMAL',
    managerId: null,
    workspaceId: 'workspace-1',
    statusId: 'status-1',
    labelIds: [],
  } as unknown as UpdatableProjectSchema

  const defaultOptions: ProjectFormChangedFieldOptions = {
    fieldNameBeingUpdated: 'workspaceId',
    statuses: [
      { id: 'default-status-0', type: StatusType.DEFAULT } as StatusSchema,
      { id: 'status-54', type: null } as StatusSchema,
    ],
    members: [
      { id: 'member-1', userId: 'assignee-1' } as WorkspaceMemberSchema,
      { id: 'member-2', userId: 'assignee-2' } as WorkspaceMemberSchema,
    ],
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
  }

  it('returns an object with the new status id', () => {
    const Project = {
      ...defaultProject,
    }
    const options = {
      ...defaultOptions,
    }

    expect(getProjectWorkspaceChangedFields(Project, options)).toMatchObject({
      statusId: 'default-status-0',
    })
  })

  it('returns an object with the status and label being reset', () => {
    const Project = {
      ...defaultProject,
      labelIds: ['label-1', 'label-2'],
    }
    const options = {
      ...defaultOptions,
    }

    expect(getProjectWorkspaceChangedFields(Project, options)).toMatchObject({
      statusId: 'default-status-0',
      labelIds: [],
    })
  })

  it('returns an object with the status and the assignee reset to current user', () => {
    const Project = {
      ...defaultProject,
      managerId: 'unknown-assignee',
    }
    const options = {
      ...defaultOptions,
      members: [
        { id: 'member-2', userId: 'assignee-2' } as WorkspaceMemberSchema,
      ],
    }

    expect(getProjectWorkspaceChangedFields(Project, options)).toMatchObject({
      statusId: 'default-status-0',
      managerId: null,
    })
  })

  it('returns an object with the custom fields set to updated', () => {
    const project = {
      ...defaultProject,
      customFields: [
        {
          id: 'dif-custom-field-1',
        } as CustomFieldSchema,
        {
          id: 'dif-custom-field-2',
        } as CustomFieldSchema,
      ],
    }
    const options = {
      ...defaultOptions,
    }

    expect(getProjectWorkspaceChangedFields(project, options)).toMatchObject({
      statusId: 'default-status-0',
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
})
