import { type PMTaskType, type RecurringTask } from '@motion/rpc-types/legacy'
import {
  DEFAULT_DURATION,
  getDefaultChunkDuration,
  NO_CHUNK_DURATION,
} from '@motion/shared/pm'
import { safeParseDate, shiftDateToZone } from '@motion/utils/dates'
import {
  type ProjectSchema,
  type RecurringTaskSchema,
  type TaskSchema,
  type UserSettingsSchema,
} from '@motion/zod/client'

import { DateTime } from 'luxon'

import { mapRelativeDateOptionToAbsoluteDate } from '../../../utils'
import { isRecurringTaskParent } from '../../task-utils'
import { isReminderTask } from '../helpers'

type TaskType =
  | PMTaskType
  | RecurringTask
  | TaskSchema
  | RecurringTaskSchema
  | null

export function getTaskInitialStartDate(): string
export function getTaskInitialStartDate(
  task?: TaskType,
  knownDueDate?: string | null,
  project?: ProjectSchema | null,
  userTaskDefaultSettings?: UserSettingsSchema['taskDefaultSettings']
): string | null
export function getTaskInitialStartDate(
  task?: TaskType,
  knownDueDate?: string | null,
  project?: ProjectSchema | null,
  userTaskDefaultSettings?: UserSettingsSchema['taskDefaultSettings']
): string | null {
  if (!task) {
    return getDefaultStartDate(
      userTaskDefaultSettings,
      knownDueDate,
      project?.startDate
    )
  }

  if (isRecurringTaskParent(task)) {
    return getRecurringTaskStartDate(task)
  }

  return getExistingTaskStartDate(task)
}

const getTodayStart = (): DateTime => DateTime.now().startOf('day')

const getDefaultStartDate = (
  userTaskDefaultSettings?: UserSettingsSchema['taskDefaultSettings'],
  knownDueDate?: string | null,
  projectStartDate?: string | null
): string => {
  const today = getTodayStart()
  const startDate =
    getTaskStartDateFromProject(projectStartDate) ??
    mapRelativeDateOptionToAbsoluteDate(
      userTaskDefaultSettings?.global?.relativeStartOn ?? null,
      {
        bound: 'start',
      }
    ) ??
    today

  if (knownDueDate) {
    const dueDate = DateTime.fromISO(knownDueDate)
    // If due date is before start date, return due date of previous day
    if (dueDate < startDate) {
      return dueDate.minus({ days: 1 }).startOf('day').toISODate()
    }
  }

  if (startDate >= today) {
    return startDate.toISODate()
  }

  return today.toISODate()
}

const getRecurringTaskStartDate = (
  task: RecurringTask | RecurringTaskSchema
): string => {
  return task.startingOn
    ? shiftDateToZone(task.startingOn).toISODate()
    : getTodayStart().toISODate()
}

const getExistingTaskStartDate = (
  task: TaskSchema | PMTaskType
): string | null => {
  if (
    task.completedTime &&
    task.startDate &&
    task.completedTime < task.startDate
  ) {
    return shiftDateToZone(task.completedTime).toISODate()
  }

  if (task.startDate) {
    return shiftDateToZone(task.startDate).toISODate()
  }

  if (task.isAutoScheduled) {
    return getTodayStart().toISODate()
  }

  return null
}

export function getTaskDefaultDueDate(
  startAt: DateTime = DateTime.now(),
  project?: ProjectSchema | null,
  userTaskDefaultSettings?: UserSettingsSchema['taskDefaultSettings']
): string {
  const startingDate = startAt.startOf('day')
  const userDefinedDueDate = mapRelativeDateOptionToAbsoluteDate(
    userTaskDefaultSettings?.global?.relativeDueDate ?? null,
    {
      bound: 'end',
    }
  )

  if (project?.dueDate) {
    return getTaskDeadlineFromProject(
      project.dueDate,
      startingDate,
      userDefinedDueDate
    )
  }

  return userDefinedDueDate?.toISO() ?? getDayAfterStart(startingDate).toISO()
}

const getDayAfterStart = (startingDate: DateTime): DateTime => {
  return startingDate.plus({ days: 1 }).endOf('day')
}

const getTaskStartDateFromProject = (
  startDate?: string | null
): DateTime | null => {
  if (!startDate) return null

  const projectStartDate = safeParseDate(startDate)

  return projectStartDate
}

const getTaskDeadlineFromProject = (
  dueDate: string,
  startingDate: DateTime,
  userDefinedDueDate: DateTime | null | undefined
): string => {
  const projectDeadline = DateTime.fromISO(dueDate).endOf('day')

  // If project deadline is before start date, return next day
  if (projectDeadline < startingDate) {
    return getDayAfterStart(startingDate).toISO()
  }

  // Use user defined due date if it exists and is earlier than project deadline
  if (userDefinedDueDate && userDefinedDueDate < projectDeadline) {
    return userDefinedDueDate.toISO()
  }

  return projectDeadline.toISO()
}

export const getScheduledDate = (
  task?: TaskSchema | RecurringTaskSchema
): DateTime | null => {
  if (!task) return null

  if ('estimatedCompletionTime' in task && task.estimatedCompletionTime) {
    try {
      return DateTime.fromISO(task.estimatedCompletionTime)
    } catch {
      return null
    }
  }

  if (isReminderTask(task) && task.type !== 'RECURRING_TASK' && task.dueDate) {
    try {
      return DateTime.fromISO(task.dueDate)
    } catch {
      return null
    }
  }

  return null
}

export function getFixedTimeTaskInfo(
  scheduledStart: string | null | undefined,
  scheduledEnd: string | null | undefined,
  defaultDuration: number | null = DEFAULT_DURATION,
  defaultMinimumDuration: number | null = NO_CHUNK_DURATION
) {
  const scheduledStartDate =
    scheduledStart != null ? DateTime.fromISO(scheduledStart) : null
  const scheduledEndDate =
    scheduledEnd != null ? DateTime.fromISO(scheduledEnd) : null
  const isFixedTimeTask = scheduledStart != null && scheduledEnd != null
  const maybeFixedTimeTaskDuration =
    scheduledStartDate && scheduledEndDate
      ? scheduledEndDate.diff(scheduledStartDate, 'minutes')
      : null

  const fixedTimeTaskDuration =
    maybeFixedTimeTaskDuration?.minutes ?? defaultDuration
  const fixedTimeTaskMinimumDuration = getDefaultChunkDuration(
    fixedTimeTaskDuration
  )

  return {
    isFixedTimeTask,
    fixedTimeTaskDuration,
    fixedTimeTaskMinimumDuration,
    scheduledStart: scheduledStart ?? null,
    scheduledEnd: scheduledEnd ?? null,
  }
}

/**
 * Ensures the due date is not before the start date by adjusting the due date if needed
 * @param startDate - The start date string in ISO format
 * @param dueDate - The due date string in ISO format
 * @returns The validated due date string in ISO format
 */
export function adjustTaskDueDate(
  startDate: string | DateTime | null,
  dueDate: string | DateTime | null
): string | null {
  const startDateTime = safeParseDate(startDate)
  const dueDateTime = safeParseDate(dueDate)
  if (dueDateTime == null) {
    return null
  }

  if (startDateTime == null) {
    return adjustDateToEndOfDay(dueDateTime)
  }

  if (dueDateTime < startDateTime) {
    return getTaskDefaultDueDate(startDateTime)
  }

  return adjustDateToEndOfDay(dueDateTime)
}

export function adjustDateToEndOfDay(
  date: string | DateTime | null,
  { useISODate = false }: { useISODate?: boolean } = {}
): string | null {
  return date == null
    ? null
    : useISODate
      ? (safeParseDate(date)?.endOf('day').toISODate() ?? null)
      : (safeParseDate(date)?.endOf('day').toISO() ?? null)
}
