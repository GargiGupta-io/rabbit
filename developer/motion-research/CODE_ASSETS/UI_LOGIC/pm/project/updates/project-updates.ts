/* c8 ignore start */
import {
  getProjectDueDateDateChangedFields,
  getProjectStartDateChangedFields,
  getProjectWorkspaceChangedFields,
} from './changed-fields'
import {
  type ProjectFormChangedFieldOptions,
  type ProjectUpdateFields,
  type UpdatableProjectSchema,
} from './types'

const changedFieldsFunctionMap = new Map<
  ProjectFormChangedFieldOptions['fieldNameBeingUpdated'],
  (
    project: UpdatableProjectSchema,
    options: ProjectFormChangedFieldOptions
  ) => Partial<ProjectUpdateFields>
>([
  ['dueDate', getProjectDueDateDateChangedFields],
  ['startDate', getProjectStartDateChangedFields],
  ['workspaceId', getProjectWorkspaceChangedFields],
])

export function getProjectChangedFields(
  projectCandidate: UpdatableProjectSchema,
  options: ProjectFormChangedFieldOptions
) {
  const { fieldNameBeingUpdated } = options

  const fn = changedFieldsFunctionMap.get(fieldNameBeingUpdated)

  return fn?.(projectCandidate, options) ?? {}
}
