/* c8 ignore start */
import { type PMTaskType, type RecurringTask } from '@motion/rpc-types/legacy'
import { type RecurringTaskSchema } from '@motion/zod/client'

import {
  getAssigneeChangedFields,
  getAutoScheduledChangedFields,
  getCompletedDurationChangedFields,
  getDeadlineDateChangedFields,
  getDurationChangedFields,
  getStartDateChangedFields,
  getStatusChangedFields,
  getTaskAssigneeChangedFields,
  getTaskAutoScheduledChangedFields,
  getTaskCompletedDurationChangedFields,
  getTaskDeadlineDateChangedFields,
  getTaskDurationChangedFields,
  getTaskFrequencyChangedFields,
  getTaskStartDateChangedFields,
  getTaskStatusChangedFields,
  getTaskTypeChangedFields,
  getTaskWorkspaceChangedFields,
} from './changed-fields'
import { getTaskProjectChangedFields } from './changed-fields/project'
import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from './types'

/* c8 ignore next 15 */
const legacyChangedFieldsFunctionMap = new Map<
  TaskFormChangedFieldOptions['fieldNameBeingUpdated'],
  (
    task: PMTaskType | RecurringTask,
    options: TaskFormChangedFieldOptions
  ) => Partial<PMTaskType & RecurringTask>
>([
  ['assigneeUserId', getAssigneeChangedFields],
  ['dueDate', getDeadlineDateChangedFields],
  ['duration', getDurationChangedFields],
  ['completedDuration', getCompletedDurationChangedFields],
  ['isAutoScheduled', getAutoScheduledChangedFields],
  ['startDate', getStartDateChangedFields],
  ['statusId', getStatusChangedFields],
])

/**
 * @deprecated use `getTaskFormChangedFields` instead
 */
export function getLegacyTaskFormChangedFields(
  taskCandidate: PMTaskType | RecurringTask,
  options: TaskFormChangedFieldOptions
) {
  const { fieldNameBeingUpdated } = options

  const fn = legacyChangedFieldsFunctionMap.get(fieldNameBeingUpdated)

  return fn?.(taskCandidate, options) ?? {}
}

const changedFieldsFunctionMap = new Map<
  TaskFormChangedFieldOptions['fieldNameBeingUpdated'],
  (
    // TODO tleunen - Need to figure out what's going on here
    task: any, // UpdatableTaskSchema | RecurringTaskSchema,
    options: TaskFormChangedFieldOptions
  ) => TaskUpdateFields | RecurringTaskUpdateFields
>([
  ['type', getTaskTypeChangedFields],
  ['assigneeUserId', getTaskAssigneeChangedFields],
  ['dueDate', getTaskDeadlineDateChangedFields],
  ['duration', getTaskDurationChangedFields],
  ['completedDuration', getTaskCompletedDurationChangedFields],
  ['isAutoScheduled', getTaskAutoScheduledChangedFields],
  ['startDate', getTaskStartDateChangedFields],
  ['statusId', getTaskStatusChangedFields],
  ['frequency', getTaskFrequencyChangedFields],
  ['projectId', getTaskProjectChangedFields],
  ['workspaceId', getTaskWorkspaceChangedFields],
])

export function getTaskFormChangedFields(
  taskCandidate: UpdatableTaskSchema | RecurringTaskSchema,
  options: TaskFormChangedFieldOptions
) {
  const { fieldNameBeingUpdated } = options

  const fn = changedFieldsFunctionMap.get(fieldNameBeingUpdated)

  return fn?.(taskCandidate, options) ?? {}
}
