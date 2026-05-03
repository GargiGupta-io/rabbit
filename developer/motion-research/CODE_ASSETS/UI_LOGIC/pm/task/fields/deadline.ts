import { parseDate } from '@motion/utils/dates'
import { type TaskSchema } from '@motion/zod/client'

import { DateTime } from 'luxon'

export function isValidTaskDeadlineDateOption(
  task: Pick<TaskSchema, 'type' | 'startDate'>,
  date: DateTime
) {
  if (task.type === 'RECURRING_INSTANCE') {
    if (task.startDate == null) {
      return false
    }

    try {
      return date >= parseDate(task.startDate)
    } catch (e) {
      return false
    }
  }

  return date >= DateTime.now().startOf('day')
}
