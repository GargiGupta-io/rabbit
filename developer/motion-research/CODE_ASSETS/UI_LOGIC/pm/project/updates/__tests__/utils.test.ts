import { type FormState } from 'react-hook-form'

import { type ProjectFormFields } from '../../form-fields'
import {
  convertProjectFormFieldsForUpdate,
  isProjectChangedFieldName,
} from '../utils'

describe('isProjectChangedFieldName', () => {
  it('returns true for valid field names', () => {
    expect(isProjectChangedFieldName('startDate')).toBe(true)
    expect(isProjectChangedFieldName('dueDate')).toBe(true)
    expect(isProjectChangedFieldName('workspaceId')).toBe(true)
  })

  it('returns false for invalid field names', () => {
    expect(isProjectChangedFieldName('foo')).toBe(false)
    expect(isProjectChangedFieldName('bar')).toBe(false)
    expect(isProjectChangedFieldName('name')).toBe(false)
  })
})

// Sample data
const sampleFields: ProjectFormFields = {
  id: 'project_1',
  projectDefinitionId: null,
  activeStageDefinitionId: null,
  isLoading: false,
  hasError: false,
  workspaceId: 'workspace_1',
  managerId: 'manager_1',
  statusId: 'status_1',
  labelIds: ['label_1', 'label_2'],
  priorityLevel: 'MEDIUM',
  name: 'Project Name',
  description: 'Project Description',
  startDate: '2023-01-01',
  dueDate: '2023-12-31',
  customFieldValuesFieldArray: [
    {
      instanceId: 'custom_1',
      value: 'value_1',
      type: 'text',
      name: 'Custom Field 1',
    },
    {
      instanceId: 'custom_2',
      value: 'value_2',
      type: 'url',
      name: 'Custom Field 2',
    },
  ],
  color: 'blue',
  folderId: null,
}

const sampleDirtyFields: FormState<ProjectFormFields>['dirtyFields'] = {
  workspaceId: true,
  managerId: true,
  statusId: true,
  labelIds: [true],
  priorityLevel: true,
  name: true,
  description: true,
  startDate: true,
  dueDate: true,
  customFieldValuesFieldArray: [{ value: true }, { value: true }],
}

describe('convertProjectFormFieldsForUpdate', () => {
  it('should include only dirty fields', () => {
    const result = convertProjectFormFieldsForUpdate(
      sampleFields,
      sampleDirtyFields
    )

    expect(result).toEqual({
      workspaceId: 'workspace_1',
      managerId: 'manager_1',
      statusId: 'status_1',
      labelIds: ['label_1', 'label_2'],
      priorityLevel: 'MEDIUM',
      name: 'Project Name',
      description: 'Project Description',
      startDate: '2023-01-01',
      dueDate: '2023-12-31',
      customFieldValues: {
        custom_1: {
          instanceId: 'custom_1',
          value: 'value_1',
          type: 'text',
          name: 'Custom Field 1',
        },
        custom_2: {
          instanceId: 'custom_2',
          value: 'value_2',
          type: 'url',
          name: 'Custom Field 2',
        },
      },
    })
  })

  it('should handle custom fields correctly', () => {
    const fields: ProjectFormFields = {
      ...sampleFields,
      customFieldValuesFieldArray: [
        {
          instanceId: 'custom_1',
          value: 'value_1',
          type: 'text',
          name: 'Custom Field 1',
        },
        {
          instanceId: 'custom_2',
          value: '',
          type: 'url',
          name: 'Custom Field 2',
        },
      ],
    }

    const dirtyFields: FormState<ProjectFormFields>['dirtyFields'] = {
      ...sampleDirtyFields,
      customFieldValuesFieldArray: [{ value: true }, { value: true }],
    }

    const result = convertProjectFormFieldsForUpdate(fields, dirtyFields)

    expect(result.customFieldValues).toEqual({
      custom_1: {
        instanceId: 'custom_1',
        value: 'value_1',
        type: 'text',
        name: 'Custom Field 1',
      },
      custom_2: {
        instanceId: 'custom_2',
        value: null,
        type: 'url',
        name: 'Custom Field 2',
      },
    })
  })

  it('should handle trimming of custom field values', () => {
    const fields: ProjectFormFields = {
      ...sampleFields,
      customFieldValuesFieldArray: [
        {
          instanceId: 'custom_1',
          value: '   value_1   ',
          type: 'text',
          name: 'Custom Field 1',
        },
        {
          instanceId: 'custom_2',
          value: '   ',
          type: 'url',
          name: 'Custom Field 2',
        },
      ],
    }

    const dirtyFields: FormState<ProjectFormFields>['dirtyFields'] = {
      ...sampleDirtyFields,
      customFieldValuesFieldArray: [{ value: true }, { value: true }],
    }

    const result = convertProjectFormFieldsForUpdate(fields, dirtyFields)

    expect(result.customFieldValues).toEqual({
      custom_1: {
        instanceId: 'custom_1',
        value: 'value_1',
        type: 'text',
        name: 'Custom Field 1',
      },
      custom_2: {
        instanceId: 'custom_2',
        value: null,
        type: 'url',
        name: 'Custom Field 2',
      },
    })
  })

  it('should exclude fields that are not dirty', () => {
    const dirtyFields: FormState<ProjectFormFields>['dirtyFields'] = {
      workspaceId: true,
      managerId: true,
      statusId: true,
    }

    const result = convertProjectFormFieldsForUpdate(sampleFields, dirtyFields)

    expect(result).toEqual({
      workspaceId: 'workspace_1',
      managerId: 'manager_1',
      statusId: 'status_1',
    })
  })
})
