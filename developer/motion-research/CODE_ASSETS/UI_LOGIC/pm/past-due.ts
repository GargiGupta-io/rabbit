import { type TaskSchema } from '@motion/rpc-types'
import { type PMTaskType, TaskType } from '@motion/rpc-types/legacy'
import { formatToReadableWeekDayMonth, parseDate } from '@motion/utils/dates'

import { DateTime } from 'luxon'

export function getExtendDeadlineDateText(scheduledText: string) {
  const scheduledDate = parseDate(scheduledText)
  const now = DateTime.now()

  const dateString = (() => {
    if (now.hasSame(scheduledDate, 'day')) {
      return 'Today'
    }
    if (now.plus({ day: 1 }).hasSame(scheduledDate, 'day')) {
      return 'Tomorrow'
    }
    return formatToReadableWeekDayMonth(scheduledDate)
  })()

  return `${dateString} (scheduled date)`
}

/**
 * @deprecated
 */
export function legacyShouldShowPastDueDeleteButton(task?: PMTaskType) {
  if (!task) return false
  if (task.type !== TaskType.RECURRING_INSTANCE) return false
  if (!task.dueDate) return false

  const dueDate = parseDate(task.dueDate)
  const now = DateTime.now()

  const diff = now.diff(dueDate, 'day').as('day')
  return diff >= 60
}

export function shouldShowPastDueDeleteButton(task?: TaskSchema) {
  if (!task) return false
  if (task.type !== TaskType.RECURRING_INSTANCE) return false
  if (!task.dueDate) return false

  const dueDate = parseDate(task.dueDate)
  const now = DateTime.now()

  const diff = now.diff(dueDate, 'day').as('day')
  return diff >= 60
}
