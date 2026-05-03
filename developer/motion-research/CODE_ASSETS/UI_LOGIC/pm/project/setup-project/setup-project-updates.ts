import {
  getSetupProjectDueDateChangedFields,
  getSetupProjectStageDueDateChangedFields,
  getSetupProjectStartDateChangedFields,
} from './changed-fields'
import { type SetupProjectChangedFieldName } from './utils'

import { type SetupProjectFormFields } from '../form-fields'

const changedFieldsFunctionMap = new Map<
  SetupProjectChangedFieldName,
  (
    fields: SetupProjectFormFields,
    prevFields: SetupProjectFormFields
  ) => Partial<SetupProjectFormFields>
>([
  ['dueDate', getSetupProjectDueDateChangedFields],
  ['startDate', getSetupProjectStartDateChangedFields],
  ['stageDueDates', getSetupProjectStageDueDateChangedFields],
])

export function getSetupProjectChangedFields(
  fields: SetupProjectFormFields,
  prevFields: SetupProjectFormFields,
  fieldNameBeingUpdated: string
): Partial<SetupProjectFormFields> {
  const name = fieldNameBeingUpdated.split(
    '.'
  )[0] as SetupProjectChangedFieldName

  const fn = changedFieldsFunctionMap.get(name)

  return fn?.(fields, prevFields) ?? {}
}
