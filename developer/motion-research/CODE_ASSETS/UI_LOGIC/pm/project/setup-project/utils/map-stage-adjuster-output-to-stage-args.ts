import type { AdjustedStage, AdjustmentResults } from '@motion/shared/flows'

import { DateTime } from 'luxon'

import type { StageArg } from '../../form-fields'

export function mapStageAdjusterOutputToStageArgs(
  adjustedStages: AdjustmentResults,
  stageDueDates: StageArg[]
): StageArg[] {
  return adjustedStages.stages
    .filter(
      (s): s is Extract<AdjustedStage, { status: 'update' }> =>
        s.status === 'update'
    )
    .map((stage, i) => ({
      stageDefinitionId: stage.stageDefinitionId,
      dueDate: DateTime.fromJSDate(stage.dueDate).toISODate(),
      skipped: stageDueDates[i].skipped,
    }))
}
