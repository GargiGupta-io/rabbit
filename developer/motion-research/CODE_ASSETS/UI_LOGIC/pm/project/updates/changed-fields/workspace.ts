import { findDefaultStatus } from '@motion/shared/common'

import {
  type CustomFieldFieldArrayValue,
  mapCustomFieldToFieldArrayWithValue,
} from '../../../custom-fields'
import {
  type ProjectFormChangedFieldOptions,
  type ProjectUpdateFields,
  type UpdatableProjectSchema,
} from '../types'

type ProjectFormUpdateFields = Omit<
  ProjectUpdateFields,
  'customFieldValues'
> & {
  customFieldValuesFieldArray?: CustomFieldFieldArrayValue[]
}

export function getProjectWorkspaceChangedFields(
  project: UpdatableProjectSchema,
  options: Pick<
    ProjectFormChangedFieldOptions,
    'members' | 'statuses' | 'customFields'
  >
): ProjectFormUpdateFields {
  const updates: ProjectFormUpdateFields = {}

  const { members, statuses, customFields } = options

  updates.statusId = findDefaultStatus(statuses)?.id

  if (project.labelIds.length > 0) {
    updates.labelIds = []
  }

  if (
    project.managerId != null &&
    members.find((m) => m.userId === project.managerId) == null
  ) {
    updates.managerId = null
  }

  updates.customFieldValuesFieldArray = customFields.map((field) =>
    mapCustomFieldToFieldArrayWithValue(field, undefined)
  )

  return updates
}
