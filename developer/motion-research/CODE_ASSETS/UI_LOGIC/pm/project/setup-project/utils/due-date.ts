import { type StageDefinitionSchema } from '@motion/rpc-types'
import {
  convertDateIntervalToDays,
  convertDaysToDeadlineInterval,
} from '@motion/shared/flows'
import { addBusinessDaysFromCalendarDays, parseDate } from '@motion/utils/dates'

import { type DateTime } from 'luxon'

import { getStageStartDate } from '../../flows/stages'
import { type StageArg } from '../../form-fields'

/**
 * Terms:
 * - Project Start Date = S
 * - Project Deadline = D
 * - Template Duration = TT
 * - Project Duration = PD (D - S)
 * - Stage Interval Days = ID
 *
 * Spec:
 * 1. Calculate the due dates for each stage based on S and ID.
 * 2. If D is provided, adjust the stage due dates to fit D.
 *  a. If PD is less than TT, calculate the proportion of PD to TT and shrink ID by that proportion.
 *  b. If PD is greater than TT, expand the last stage deadline to match D.
 * 3. Ensure the last stage ends on D.
 */
export function calculateProjectStageDueDates(
  stages: Pick<StageDefinitionSchema, 'id' | 'duration'>[],
  projectStartDate: DateTime,
  projectDeadline?: DateTime
): StageArg[] {
  let adjustedStages = calculateProjectStageDueDatesFromIntervals(
    stages,
    projectStartDate
  )

  if (!projectDeadline) return adjustedStages

  // + 1 to include the project start date in the duration
  // Simple example: if project A starts on Monday and has one stage of duration 1 day,
  // it will end end-of-day on Monday.
  // The diff will be 0 days, but duration should be 1 day.
  const projectDuration =
    projectDeadline.diff(projectStartDate, 'days').days + 1
  const templateDuration = stages.reduce(
    (sum, stage) => sum + convertDateIntervalToDays(stage.duration),
    0
  )

  if (projectDuration < templateDuration) {
    // Shrink intervals to fit project duration
    const ratio = projectDuration / templateDuration
    const shrunkStages = stages.map((stage) => ({
      ...stage,
      duration: convertDaysToDeadlineInterval(
        Math.floor(convertDateIntervalToDays(stage.duration) * ratio)
      ),
    }))

    adjustedStages = calculateProjectStageDueDatesFromIntervals(
      shrunkStages,
      projectStartDate
    )
  }

  if (adjustedStages.length > 0) {
    // Ensure the last stage ends on the project deadline
    setLastStageDueDate(adjustedStages, projectDeadline)
    // Ensure the first stage ends after the project start date
    fixFirstStageDueDate(adjustedStages, projectStartDate)
    fixStageOverlaps(adjustedStages)
  }

  return adjustedStages
}
export function fixFirstStageDueDate(stages: StageArg[], date: DateTime) {
  if (stages[0].dueDate < date.toISODate()) {
    stages[0].dueDate = date.toISODate()
  }
}

function setLastStageDueDate(stages: StageArg[], date: DateTime) {
  stages[stages.length - 1].dueDate = date.toISODate()
}
/**
 * Hack; if logic worked perfectly, this would not be necessary.
 * But there are edge cases I haven't figured out yet.
 */
function fixStageOverlaps(stages: StageArg[]) {
  const startDate = parseDate(stages[0].dueDate)
  // start backwards to avoid bug where later stages can be later than the next stage
  for (let i = stages.length - 2; i > 0; i--) {
    let stageStartDate = parseDate(stages[i].dueDate)
    if (stages[i + 1]?.dueDate != null) {
      const nextStageStartDate = parseDate(stages[i + 1].dueDate)
      while (stageStartDate > nextStageStartDate) {
        stageStartDate = stageStartDate.minus({ days: 1 })
      }
      stages[i].dueDate = stageStartDate.toISODate()

      if (stageStartDate < startDate) {
        stages[i].dueDate = startDate.toISODate()
      }
    }
  }
}

export function calculateProjectStageDueDatesFromIntervals<
  T extends Pick<StageDefinitionSchema, 'id' | 'duration'>,
>(stages: T[], projectStartDate: DateTime): StageArg[] {
  return stages.reduce((stageArgs: StageArg[], stage: T, index: number) => {
    const prevStageDueDate: string | undefined = stageArgs[index - 1]?.dueDate
    const stageStartDate = getStageStartDate(projectStartDate, prevStageDueDate)

    let newDueDate = calculateDueDate(
      stageStartDate,
      convertDateIntervalToDays(stage.duration)
    )

    // do not allow first stages with 0 duration to start before the project start date
    if (newDueDate < projectStartDate.toISODate()) {
      newDueDate = projectStartDate.toISODate()
    }

    return [
      ...stageArgs,
      {
        stageDefinitionId: stage.id,
        dueDate: newDueDate,
      },
    ]
  }, [])
}

function calculateDueDate(
  stageStartDate: DateTime,
  intervalDays: number
): string {
  const newDueDate = addBusinessDaysFromCalendarDays(
    stageStartDate,
    intervalDays
  )
    .endOf('day')
    .toISODate()

  return newDueDate
}
