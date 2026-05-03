import {
  type ProjectSchema,
  type RecurringTaskSchema,
  type TaskSchema,
  type UserSettingsSchema,
} from '@motion/rpc-types'

import { DateTime } from 'luxon'

import {
  adjustTaskDueDate,
  getTaskDefaultDueDate,
  getTaskInitialStartDate,
} from './date-helpers'

import { getFlowTaskDueDate } from '../../project/flows/get-flow-task-due-date'
import { getFlowTaskStartDate } from '../../project/flows/get-flow-task-start-date'

export type GetTaskDefaultDatesArgs = {
  project: ProjectSchema | null | undefined
  stageDefinitionId: string | null | undefined
  task?: TaskSchema | RecurringTaskSchema | null
  startOverride?: string | null
  dueDateOverride?: string | null
  userDefinedTaskDefaults?: UserSettingsSchema['taskDefaultSettings']
}

/**
 * Return start and due date for a task in a flow/non-flow project
 */
export function getTaskDefaultDates({
  project,
  stageDefinitionId,
  task,
  startOverride,
  dueDateOverride,
  userDefinedTaskDefaults,
}: GetTaskDefaultDatesArgs) {
  // Initialize dates with overrides
  let startDate =
    startOverride ??
    getTaskInitialStartDate(
      task,
      dueDateOverride,
      project,
      userDefinedTaskDefaults
    )
  let dueDate =
    dueDateOverride ??
    (task != null && 'dueDate' in task
      ? task.dueDate
      : getTaskDefaultDueDate(
          startDate != null ? DateTime.fromISO(startDate) : undefined,
          project,
          userDefinedTaskDefaults
        ))

  // Handle flow projects
  if (task == null && project != null && stageDefinitionId != null) {
    const selectedStage = project.stages.find(
      (s) => s.stageDefinitionId === stageDefinitionId
    )

    if (selectedStage) {
      if (startOverride == null) {
        startDate = getFlowTaskStartDate(
          project.stages.indexOf(selectedStage),
          project
        )
      }

      if (dueDateOverride == null) {
        dueDate = getFlowTaskDueDate(selectedStage.dueDate)
      }
    }
  }

  // Ensure due date is not before start date unless overridden
  if (task == null && startDate && dueDate && dueDateOverride == null) {
    dueDate = adjustTaskDueDate(startDate, dueDate)
  }

  return {
    startDate,
    dueDate,
  }
}
