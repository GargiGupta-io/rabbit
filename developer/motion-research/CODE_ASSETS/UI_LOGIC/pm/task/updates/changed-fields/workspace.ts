import { type RecurringTaskSchema } from '@motion/rpc-types'
import { findDefaultStatus } from '@motion/shared/common'

import {
  type CustomFieldFieldArrayValue,
  mapCustomFieldToFieldArrayWithValue,
} from '../../../custom-fields'
import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

type TaskFormUpdateFields = Omit<TaskUpdateFields, 'customFieldValues'> & {
  customFieldValuesFieldArray?: CustomFieldFieldArrayValue[]
}

export function getTaskWorkspaceChangedFields(
  task: UpdatableTaskSchema,
  options: Pick<
    TaskFormChangedFieldOptions,
    | 'currentUserId'
    | 'members'
    | 'statuses'
    | 'customFields'
    | 'globalTaskDefaults'
  >
): TaskUpdateFields
export function getTaskWorkspaceChangedFields(
  task: RecurringTaskSchema,
  options: Pick<
    TaskFormChangedFieldOptions,
    | 'currentUserId'
    | 'members'
    | 'statuses'
    | 'customFields'
    | 'globalTaskDefaults'
  >
): RecurringTaskUpdateFields
export function getTaskWorkspaceChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema,
  options: Pick<
    TaskFormChangedFieldOptions,
    | 'currentUserId'
    | 'members'
    | 'statuses'
    | 'customFields'
    | 'globalTaskDefaults'
  >
): TaskUpdateFields | RecurringTaskUpdateFields {
  const updates: TaskFormUpdateFields & RecurringTaskUpdateFields = {}
  const { currentUserId, members, statuses, customFields, globalTaskDefaults } =
    options

  const matchingTaskDefaults =
    globalTaskDefaults?.workspaceId === task.workspaceId
      ? globalTaskDefaults
      : undefined

  updates.statusId =
    matchingTaskDefaults?.statusId ?? findDefaultStatus(statuses)?.id

  if (task.type !== 'CHUNK') {
    updates.labelIds = matchingTaskDefaults?.labelIds ?? []
  }

  // Assignee must exist in the new workspace
  if (members.find((m) => m.userId === task?.assigneeUserId) == null) {
    updates.assigneeUserId =
      matchingTaskDefaults?.assigneeUserId ?? currentUserId
  }

  if (task.type === 'NORMAL') {
    const customFieldValues =
      matchingTaskDefaults != null
        ? matchingTaskDefaults.customFieldValues
        : undefined

    updates.customFieldValuesFieldArray = customFields.map((field) =>
      mapCustomFieldToFieldArrayWithValue(field, customFieldValues)
    )

    updates.projectId = matchingTaskDefaults?.projectId ?? task.projectId
  }

  return updates
}
