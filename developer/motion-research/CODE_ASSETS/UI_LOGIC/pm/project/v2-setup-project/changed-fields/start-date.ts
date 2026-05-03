import { parseDate } from '@motion/utils/dates'

import { type V2SetupProjectFormFields } from '../../form-fields'

export function getSetupProjectStartDateChangedFields<
  T extends Pick<V2SetupProjectFormFields, 'dueDate' | 'startDate'>,
>(fields: T, _prevFields: T): Partial<V2SetupProjectFormFields> {
  const updates: Partial<V2SetupProjectFormFields> = {}

  const deadlineStr = fields.dueDate
  const startStr = fields.startDate

  if (startStr && deadlineStr) {
    const startDate = parseDate(startStr)
    const deadlineDate = parseDate(deadlineStr)

    if (startDate > deadlineDate) {
      updates.dueDate = startDate.endOf('day').plus({ days: 1 }).toISO()
    }
  }

  return updates
}
