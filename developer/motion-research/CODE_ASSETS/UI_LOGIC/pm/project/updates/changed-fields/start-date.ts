import { parseDate } from '@motion/utils/dates'

import { type ProjectUpdateFields, type UpdatableProjectSchema } from '../types'

export function getProjectStartDateChangedFields(
  project: UpdatableProjectSchema
): Partial<ProjectUpdateFields> {
  const deadlineDate = project.dueDate
  const startDate = project.startDate

  const updates: Partial<ProjectUpdateFields> = {}

  if (startDate && deadlineDate) {
    const start = parseDate(startDate)
    const deadline = parseDate(deadlineDate)

    if (start > deadline) {
      updates.dueDate = start.endOf('day').plus({ days: 1 }).toISO()
    }
  }

  return updates
}
