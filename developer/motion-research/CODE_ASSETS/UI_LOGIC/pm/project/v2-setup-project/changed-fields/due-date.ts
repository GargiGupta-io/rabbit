import { adjustStartDateBeforeEnd, parseDate } from '@motion/utils/dates'

import { type V2SetupProjectFormFields } from '../../form-fields'

export function getSetupProjectDueDateChangedFields<
  T extends Pick<V2SetupProjectFormFields, 'dueDate' | 'startDate'>,
>(fields: T, _prevFields: T): Partial<V2SetupProjectFormFields> {
  const updates: Partial<V2SetupProjectFormFields> = {}

  const deadlineStr = fields.dueDate
  const startStr = fields.startDate

  if (startStr && deadlineStr) {
    const startDate = parseDate(startStr)
    const deadlineDate = parseDate(deadlineStr)

    // If the start date is greater than the deadline, we need to move start date to the day before the deadline
    if (startDate > deadlineDate) {
      updates.startDate = adjustStartDateBeforeEnd(startDate, deadlineDate)
    }
  }

  return updates
}
