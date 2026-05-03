import {
  type ProjectSchema,
  type ProjectsV2UpdateRequestSchema,
} from '@motion/rpc-types'
import { type CustomFieldValuesRecord } from '@motion/rpc-types/legacy'
import { type COLOR } from '@motion/shared/common'
import { createLookupByKey, stripUndefined } from '@motion/utils/object'

import { type FormState } from 'react-hook-form'

import { addSchemeIfNeeded } from '../../../utils'
import {
  type CustomFieldFieldArrayValue,
  getCustomFieldValue,
} from '../../custom-fields'
import { type ProjectFormFields } from '../form-fields'

export const projectChangedFieldNames = [
  'startDate',
  'dueDate',
  'workspaceId',
] satisfies (keyof ProjectSchema)[]

export type ProjectChangedFieldName = (typeof projectChangedFieldNames)[number]

export function isProjectChangedFieldName(
  name: string
): name is ProjectChangedFieldName {
  return projectChangedFieldNames.includes(name)
}

export function reduceCustomFieldsValuesFieldArrayToRecord(
  customFieldValuesFieldArray: CustomFieldFieldArrayValue[],
  { omitNull } = { omitNull: false }
): CustomFieldValuesRecord {
  const parsedFieldValues = customFieldValuesFieldArray
    .map((field) => {
      let value = getCustomFieldValue(field.value)
      if (field.type === 'url' && value) {
        value = addSchemeIfNeeded(field.value)
      }

      return value == null && omitNull
        ? null
        : {
            ...field,
            value,
          }
    })
    .filter(Boolean)
  return createLookupByKey(parsedFieldValues, 'instanceId')
}

export function convertProjectFormFieldsForUpdate(
  fields: ProjectFormFields,
  dirtyFields: FormState<ProjectFormFields>['dirtyFields']
): ProjectsV2UpdateRequestSchema {
  const dirtyKeys = Object.keys(dirtyFields)

  function mayBeInclude<
    K extends keyof ProjectFormFields,
    V extends ProjectFormFields[K],
  >(field: K, overriddenValue?: V): ProjectFormFields[K] | undefined {
    const value = overriddenValue ?? fields[field]
    const shouldInclude = dirtyKeys == null || dirtyKeys.includes(field)
    return shouldInclude ? value : undefined
  }

  function getDirtyCustomFieldValues():
    | ProjectSchema['customFieldValues']
    | undefined {
    const shouldInclude = mayBeInclude('customFieldValuesFieldArray')

    if (!shouldInclude) {
      return
    }

    const dirtyCustomFields = dirtyFields?.customFieldValuesFieldArray
      ?.map((maybeDirtyField, i) => {
        if (!maybeDirtyField.value) {
          return
        }

        return fields.customFieldValuesFieldArray[i]
      })
      .filter(Boolean)

    if (!dirtyCustomFields) {
      return
    }

    return reduceCustomFieldsValuesFieldArrayToRecord(dirtyCustomFields)
  }

  return stripUndefined({
    workspaceId: mayBeInclude('workspaceId'),
    managerId: mayBeInclude('managerId'),
    statusId: mayBeInclude('statusId'),
    labelIds: mayBeInclude('labelIds'),
    priorityLevel: mayBeInclude('priorityLevel'),
    name: mayBeInclude('name'),
    description: mayBeInclude('description'),
    startDate: mayBeInclude('startDate'),
    dueDate: mayBeInclude('dueDate'),
    customFieldValues: getDirtyCustomFieldValues(),
    color: mayBeInclude('color') as COLOR,
  })
}
