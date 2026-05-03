import { templateStr } from '@motion/react-core/strings'
import {
  type DateLike,
  formatToReadableWeekDayMonth,
  parseDate,
} from '@motion/utils/dates'
import { type TaskSchema } from '@motion/zod/client'

import { prettyDateDay } from '../../../utils'

export function getDeadlineText(
  deadlineLikeObject: Partial<Pick<TaskSchema, 'priorityLevel' | 'dueDate'>>
) {
  if (deadlineLikeObject.priorityLevel === 'ASAP') return 'ASAP'
  if (!deadlineLikeObject.dueDate) return 'None'

  return formatToReadableWeekDayMonth(deadlineLikeObject.dueDate)
}

export function getStartDateText(
  startDateLikeObject: Partial<Pick<TaskSchema, 'priorityLevel' | 'startDate'>>
) {
  if (startDateLikeObject.priorityLevel === 'ASAP') return 'ASAP'
  if (!startDateLikeObject.startDate) return 'None'

  return formatToReadableWeekDayMonth(startDateLikeObject.startDate)
}

export function getDateButtonText(
  date: DateLike | null,
  { prefix, placeholder }: { prefix?: string | undefined; placeholder: string }
) {
  return !!prefix && date
    ? templateStr('{{ prefix }} {{ date }}', {
        prefix,
        date: prettyDateDay(parseDate(date), {
          lowercase: true,
        }),
      })
    : date
      ? prettyDateDay(parseDate(date))
      : placeholder
}
