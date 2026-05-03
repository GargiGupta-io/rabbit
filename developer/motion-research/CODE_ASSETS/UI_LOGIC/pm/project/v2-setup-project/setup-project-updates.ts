import {
  getSetupProjectDueDateChangedFields,
  getSetupProjectStartDateChangedFields,
} from './changed-fields'
import { type V2SetupProjectChangedFieldName } from './utils'

import { type V2SetupProjectFormFields } from '../form-fields'

const changedFieldsFunctionMap = new Map<
  V2SetupProjectChangedFieldName,
  (
    fields: V2SetupProjectFormFields,
    prevFields: V2SetupProjectFormFields
  ) => Partial<V2SetupProjectFormFields>
>([
  ['dueDate', getSetupProjectDueDateChangedFields],
  ['startDate', getSetupProjectStartDateChangedFields],
])

export function getV2SetupProjectChangedFields(
  fields: V2SetupProjectFormFields,
  prevFields: V2SetupProjectFormFields,
  fieldNameBeingUpdated: string
): Partial<V2SetupProjectFormFields> {
  const name = fieldNameBeingUpdated.split(
    '.'
  )[0] as V2SetupProjectChangedFieldName

  const fn = changedFieldsFunctionMap.get(name)

  return fn?.(fields, prevFields) ?? {}
}
