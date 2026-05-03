import { type PMTaskType } from '@motion/rpc-types/legacy'
import { isCanceledStatus } from '@motion/shared/common'
import {
  getAvailableAddTimeOptions,
  NO_DURATION,
  SHORT_TASK_DURATION,
} from '@motion/shared/pm'
import { parseDate } from '@motion/utils/dates'
import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
  type StatusSchema,
  type TaskSchema,
} from '@motion/zod/client'

import { isMeetingTask, isSchedulingTask } from './meetings-in-project'

export function isTaskSchema(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is TaskSchema {
  return task != null && task.type !== 'RECURRING_TASK'
}

export function isReminderTask(
  task: Pick<TaskSchema, 'duration'> | Pick<PMTaskType, 'duration'>
) {
  return task.duration === SHORT_TASK_DURATION
}

export function isTaskUnfit(
  task:
    | Pick<TaskSchema, 'isUnfit' | 'scheduledEnd' | 'scheduledStart'>
    | Pick<PMTaskType, 'isUnfit' | 'scheduledEnd' | 'scheduledStart'>
) {
  return task.isUnfit || !task.scheduledEnd || !task.scheduledStart
}

export function isTaskFutureSchedulable(
  task:
    | Pick<PMTaskType, 'scheduledStatus'>
    | Pick<NormalTaskSchema, 'scheduledStatus'>
) {
  return task.scheduledStatus === 'UNFIT_SCHEDULABLE'
}

export function isChunkable(
  task:
    | Pick<NormalTaskSchema, 'minimumDuration'>
    | Pick<PMTaskType, 'minimumDuration'>
): boolean {
  return task.minimumDuration !== NO_DURATION
}

export function getTaskParentId(
  task: TaskSchema | RecurringTaskSchema | null | undefined
) {
  if (task == null) return null

  if (task.type === 'CHUNK') {
    return task.parentChunkTaskId
  }

  if (task.type === 'RECURRING_INSTANCE') {
    return task.parentRecurringTaskId
  }

  return null
}

export function getChunkIdsForTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
) {
  if (task == null || task.type === 'CHUNK' || task.type === 'RECURRING_TASK') {
    return []
  }

  return task.chunkIds
}

export type RecurrenceInfo = {
  frequency: RecurringTaskSchema['frequency']
  days: RecurringTaskSchema['days']
}

export function canTaskBeExtended(
  task?: TaskSchema,
  recurringInfo?: RecurrenceInfo | null
) {
  if (task == null) return false
  if (recurringInfo?.frequency === 'WEEKLY') return false
  if (
    task.dueDate == null ||
    task.type !== 'RECURRING_INSTANCE' ||
    task.endDate === null
  )
    return true

  return parseDate(task.dueDate) < parseDate(task.endDate)
}

export function canSaveAsTemplate(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema {
  if (task == null) return false

  const isMeetingInProjectTask = isSchedulingTask(task) || isMeetingTask(task)

  return task.type === 'NORMAL' && !isMeetingInProjectTask
}

export function canDuplicateTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema {
  if (task == null) return false

  const isMeetingInProjectTask = isSchedulingTask(task) || isMeetingTask(task)

  return task.type === 'NORMAL' && !isMeetingInProjectTask
}

export function canCancelTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined,
  { status }: { status: StatusSchema }
): task is TaskSchema | RecurringTaskSchema {
  if (task == null) return false
  if (isSchedulingTask(task) || isMeetingTask(task)) return false
  if (isCanceledStatus(status)) return false
  if (task.type === 'CHUNK') return false

  if (
    isTaskSchema(task) &&
    (task.completedTime != null || task.archivedTime != null)
  ) {
    return false
  }

  return true
}

export function canBeArchived(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is TaskSchema {
  return isTaskSchema(task) && !isMeetingTask(task) && task.type !== 'CHUNK'
}

export function canHaveBlockers(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema {
  return (
    task?.type === 'NORMAL' &&
    task.archivedTime == null &&
    task.projectId != null
  )
}

function canEditTaskDate(
  task?: TaskSchema | RecurringTaskSchema,
  additionalConditions: boolean[] = []
): task is TaskSchema | RecurringTaskSchema {
  if (task == null) return false

  const isShortTask = task.duration === SHORT_TASK_DURATION
  const isCompleted = 'completedTime' in task && task.completedTime != null
  const isChunk = task.type === 'CHUNK'

  return (
    !isShortTask &&
    !isCompleted &&
    !isChunk &&
    additionalConditions.every(Boolean)
  )
}

export function canEditTaskStartDate(
  task?: TaskSchema | RecurringTaskSchema
): task is TaskSchema {
  const additionalConditions = [task?.type !== 'RECURRING_INSTANCE']
  return canEditTaskDate(task, additionalConditions)
}

export function canEditTaskDeadline(
  task?: TaskSchema | RecurringTaskSchema
): task is TaskSchema {
  const additionalConditions = [task?.type !== 'RECURRING_TASK']
  return canEditTaskDate(task, additionalConditions)
}

export function canDoASAP(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema {
  if (
    task == null ||
    !task.isAutoScheduled ||
    task.type === 'RECURRING_TASK' ||
    task.type === 'RECURRING_INSTANCE'
  ) {
    return false
  }

  const isCompleted = task.completedTime != null
  const isShortTask = task.duration === SHORT_TASK_DURATION

  return !isCompleted && !isShortTask && task.priorityLevel !== 'ASAP'
}

export function canDoLater(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema {
  if (task == null || !task.isAutoScheduled || task.type === 'RECURRING_TASK') {
    return false
  }

  const isCompleted = task.completedTime != null
  const isShortTask = task.duration === SHORT_TASK_DURATION

  return !isCompleted && !isShortTask
}

export function canAddTime(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is TaskSchema | RecurringTaskSchema {
  if (task == null) {
    return false
  }

  const isCompleted =
    task.type === 'RECURRING_TASK' ? false : task.completedTime != null
  const isShortTask = task.duration === SHORT_TASK_DURATION

  return (
    !isCompleted &&
    !isShortTask &&
    getAvailableAddTimeOptions(task.duration).length > 0
  )
}

export function canCreateProjectFromTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is NormalTaskSchema {
  if (
    task == null ||
    task.type !== 'NORMAL' ||
    isSchedulingTask(task) ||
    isMeetingTask(task)
  ) {
    return false
  }

  return true
}

export function canStartTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is TaskSchema {
  if (
    task == null ||
    task.type === 'RECURRING_TASK' ||
    task.manuallyStarted ||
    task.completedTime != null ||
    task.archivedTime != null ||
    isSchedulingTask(task) ||
    isMeetingTask(task)
  ) {
    return false
  }

  return true
}

export function canStopTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is TaskSchema {
  if (
    task == null ||
    task.type === 'RECURRING_TASK' ||
    task.completedTime != null ||
    task.archivedTime != null ||
    task.duration === NO_DURATION ||
    task.duration === SHORT_TASK_DURATION ||
    isSchedulingTask(task) ||
    isMeetingTask(task)
  ) {
    return false
  }

  return true
}

export function canCompleteTask(
  task: TaskSchema | RecurringTaskSchema | null | undefined
): task is TaskSchema | RecurringTaskSchema {
  if (task == null) return false

  if (
    isTaskSchema(task) &&
    (task.completedTime != null || task.archivedTime != null)
  ) {
    return false
  }

  if (isSchedulingTask(task) || isMeetingTask(task)) {
    return false
  }

  return true
}

export const getRemainingDuration = (
  task: TaskSchema | RecurringTaskSchema | undefined
): number | undefined | null => {
  if (task == null) return undefined

  switch (task.type) {
    case 'NORMAL':
    case 'RECURRING_INSTANCE':
      if (task.duration != null) {
        return task.duration - task.completedDuration
      }
      break
    case 'CHUNK':
      return task.duration
  }

  return undefined
}
