import {
  getChunkDurations,
  NO_DURATION,
  SHORT_TASK_DURATION,
} from '@motion/shared/pm'
import { keys } from '@motion/utils/object'
import { type RecurringTaskSchema, type TaskSchema } from '@motion/zod/client'

import { type UseFormReturn } from 'react-hook-form'

import { type TaskFormFields } from './form-fields'

import { canBeArchived } from '../helpers'

type Options = {
  currentUserId: string
  initialTask?: TaskSchema | RecurringTaskSchema | undefined
  disallowLocationUpdate?: boolean
  forClientPortal?: boolean
}
/* c8 ignore start */
export function getTaskHiddenAndDisabledFields(
  form: UseFormReturn<TaskFormFields>,
  {
    currentUserId,
    initialTask,
    disallowLocationUpdate = false,
    forClientPortal = false,
  }: Options
) {
  const { watch } = form

  const taskId = watch('id')
  const isAutoScheduled = watch('isAutoScheduled')
  const taskType = watch('type')
  const priority = watch('priorityLevel')
  const assigneeId = watch('assigneeUserId')
  const duration = watch('duration')
  const archivedTime = canBeArchived(initialTask)
    ? initialTask.archivedTime
    : null
  const completedTime = watch('completedTime')
  const projectId = watch('projectId')
  const isUnvisitedStage = watch('isUnvisitedStage')

  const chunkDurations = getChunkDurations(duration)

  const isRecurringTaskInstance = taskType === 'RECURRING_INSTANCE'
  const isRecurringTask = taskType === 'RECURRING_TASK'
  const isOwnTask = currentUserId != null && currentUserId === assigneeId

  const hiddenFields: Set<keyof TaskFormFields> = new Set()
  const disabledFields: Set<keyof TaskFormFields> = new Set()

  if (!isOwnTask) {
    // We can select a schedule only for task assigned to ourselves
    hiddenFields.add('scheduleId')
  }

  if (archivedTime != null) {
    // Archived task can't be edited
    keys(form.getValues()).forEach((key) => {
      disabledFields.add(key)
    })
    hiddenFields.add('completedDuration')
  }

  // Only autoscheduled tasks can have a schedule
  if (!isAutoScheduled) {
    hiddenFields.add('scheduleId')
  }

  if (isRecurringTask) {
    hiddenFields.add('dueDate')
    hiddenFields.add('projectId')
    hiddenFields.add('completedDuration')
    hiddenFields.add('projectId')
  } else {
    hiddenFields.add('recurrenceMeta')
  }

  if (isRecurringTaskInstance) {
    const allowedFields: (keyof TaskFormFields)[] = [
      'statusId',
      'completedDuration',
      'dueDate',
      'ignoreWarnOnPastDue',
    ]
    keys(form.getValues()).forEach((key) => {
      if (!allowedFields.includes(key)) {
        disabledFields.add(key)
      }
    })

    hiddenFields.add('projectId')
  }

  if (duration === SHORT_TASK_DURATION) {
    hiddenFields.add('startDate')
    hiddenFields.add('scheduleId')
    hiddenFields.add('completedDuration')
  }

  if (duration === NO_DURATION) {
    hiddenFields.add('completedDuration')
  }

  if (priority === 'ASAP') {
    disabledFields.add('startDate')
    disabledFields.add('dueDate')
    disabledFields.add('deadlineType')
  }

  if (completedTime != null) {
    disabledFields.add('completedDuration')
  }

  if (chunkDurations.length === 0 || !isAutoScheduled) {
    hiddenFields.add('minimumDuration')
  }

  if (taskId == null) {
    hiddenFields.add('completedDuration')
  }

  if (taskId == null || projectId == null || taskType !== 'NORMAL') {
    hiddenFields.add('blockedByTaskIds')
    hiddenFields.add('blockingTaskIds')
  }

  if (isUnvisitedStage) {
    disabledFields.add('workspaceId')
    disabledFields.add('projectId')
  }

  if (disallowLocationUpdate) {
    disabledFields.add('workspaceId')
    disabledFields.add('projectId')
    disabledFields.add('stageDefinitionId')
  }

  if (forClientPortal) {
    disabledFields.add('statusId')
    disabledFields.add('priorityLevel')
    disabledFields.add('startDate')
    disabledFields.add('duration')
  }

  return { hiddenFields, disabledFields }
}
