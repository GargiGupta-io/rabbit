import type { ProjectSchema } from '@motion/zod/client'

import { DateTime } from 'luxon'

/**
 * Start of stage is start of project for first stage or previous stage's due date
 * If the calculated start date is in the past, returns today's date instead
 */
export function getFlowTaskStartDate(
  selectedStageIndex: number,
  project: ProjectSchema
): string {
  const today = DateTime.now().startOf('day')

  let startDate = today.toISODate()

  if (selectedStageIndex === 0) {
    if (project.startDate != null) {
      startDate = project.startDate
    }
  } else {
    const previousStage = project.stages[selectedStageIndex - 1]
    if (previousStage?.dueDate != null) {
      startDate = previousStage.dueDate
    }
  }

  // If the calculated start date is before today, return today instead
  if (DateTime.fromISO(startDate) < today) {
    return today.toISODate()
  }

  return startDate
}
