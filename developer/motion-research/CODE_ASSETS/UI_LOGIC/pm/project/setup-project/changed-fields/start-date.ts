import { parseDate } from '@motion/utils/dates'

import { type SetupProjectFormFields } from '../../form-fields'

export function getSetupProjectStartDateChangedFields(
  fields: SetupProjectFormFields,
  _prevFields: SetupProjectFormFields
): Partial<SetupProjectFormFields> {
  const updates: Partial<SetupProjectFormFields> = {}

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
