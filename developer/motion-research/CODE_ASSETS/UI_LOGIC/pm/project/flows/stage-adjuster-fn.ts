import { DayMode, StageAdjuster } from '@motion/shared/flows'
import { adjustStartDateBeforeEnd, parseDate } from '@motion/utils/dates'

import { type StageArg } from '../form-fields'
import { mapStageAdjusterOutputToStageArgs } from '../setup-project/utils'

export const stageAdjusterFn = ({
  params,
  onAction,
  onResult,
}: {
  params: {
    stageDueDates: StageArg[]
    startDate?: string | null
    dueDate?: string | null
    dayMode?: DayMode
  }
  onAction: (s: StageAdjuster) => void
  onResult: (results: {
    startDate: string
    dueDate: string
    stageDueDates: StageArg[]
  }) => void
}) => {
  const dueDate = params.dueDate ? parseDate(params.dueDate) : null
  const startDate = params.startDate
    ? adjustStartDateBeforeEnd(parseDate(params.startDate), dueDate)
    : null

  const adjuster = new StageAdjuster(
    {
      startDate,
      dueDate,
      stages: params.stageDueDates.map((stage) => ({
        ...stage,
        canceled: !!stage.skipped,
      })),
    },
    { dayMode: params.dayMode ?? DayMode.CALENDAR }
  )

  onAction(adjuster)

  const result = adjuster.calculateResult()

  const mappedStages = mapStageAdjusterOutputToStageArgs(
    result,
    params.stageDueDates
  )

  onResult({
    startDate: parseDate(result.startDate).toISODate(),
    dueDate: parseDate(result.dueDate).toISODate(),
    stageDueDates: mappedStages,
  })
}
