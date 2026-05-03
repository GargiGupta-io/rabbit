import { parseDate } from '@motion/utils/dates'

import { DateTime } from 'luxon'

import { getTaskDefaultDueDate } from '../../task/form/date-helpers'

export function getFlowTaskDueDate(stageDueDate: string): string {
  const today = DateTime.now().startOf('day')

  // Call parseDate to set TZ properly
  const dueDate = parseDate(stageDueDate).endOf('day')

  // if due date is after or equal to today, use due date
  if (dueDate >= parseDate(today)) {
    return dueDate.toISO()
  }

  return getTaskDefaultDueDate()
}
