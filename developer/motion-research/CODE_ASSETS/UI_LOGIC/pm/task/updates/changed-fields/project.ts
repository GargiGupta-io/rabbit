import { type RecurringTaskSchema } from '@motion/rpc-types'

import { isValidStageDefinitionId } from '../../../project'
import { getTaskDefaultDates } from '../../form'
import {
  type RecurringTaskUpdateFields,
  type TaskFormChangedFieldOptions,
  type TaskUpdateFields,
  type UpdatableTaskSchema,
} from '../types'

export function getTaskProjectChangedFields(
  task: UpdatableTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'projects' | 'globalTaskDefaults'>
): TaskUpdateFields
export function getTaskProjectChangedFields(
  task: RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'projects' | 'globalTaskDefaults'>
): RecurringTaskUpdateFields
export function getTaskProjectChangedFields(
  task: UpdatableTaskSchema | RecurringTaskSchema,
  options: Pick<TaskFormChangedFieldOptions, 'projects' | 'globalTaskDefaults'>
): TaskUpdateFields | RecurringTaskUpdateFields {
  if (task.type !== 'NORMAL') return {}

  const { projects, globalTaskDefaults } = options

  const updates: TaskUpdateFields = {}

  const project = projects.find((p) => p.id === task.projectId)
  // Is a flow project
  if (project != null && project.activeStageDefinitionId != null) {
    if (!isValidStageDefinitionId(task.stageDefinitionId, project)) {
      updates.stageDefinitionId = project.activeStageDefinitionId
    }
    // Not a flow project
  } else if (task.stageDefinitionId != null) {
    updates.stageDefinitionId = null
  }

  if (project != null) {
    const { dueDate, startDate } = getTaskDefaultDates({
      project,
      stageDefinitionId: updates.stageDefinitionId,
      userDefinedTaskDefaults: globalTaskDefaults
        ? { global: globalTaskDefaults }
        : undefined,
    })

    updates.dueDate = dueDate
    updates.startDate = startDate
  }

  return updates
}
