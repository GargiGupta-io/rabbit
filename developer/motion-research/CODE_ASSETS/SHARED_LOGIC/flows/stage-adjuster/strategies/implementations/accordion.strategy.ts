import {
  Feature,
  Strategy,
  StrategyResult,
  StrategyStage,
  StrategyType,
} from '../strategy.types'

const TYPE = StrategyType.ACCORDION as const
const FEATURES = [Feature.ADJUST_PROJECT, Feature.ADJUST_STAGE] as const

export class AccordionStrategy
  implements Strategy<typeof TYPE, typeof FEATURES>
{
  type = TYPE
  features = FEATURES

  adjustProject(
    stages: StrategyStage[],
    target: 'start' | 'due',
    adjustment: number
  ): StrategyResult {
    if (target === 'start') {
      return {
        // We're moving our start date, so we should also supply this as the new start.
        start: adjustment,
        stages: stages.map((stage, index) => {
          // If we're the first stage, our new effective start is the same as the adjustment.
          // Otherwise, it's the maximum (later) of the adjustment and our current stage start.
          const start =
            index === 0 ? adjustment : Math.max(adjustment, stage.start)
          // Our due date is also the maximum (later) of the adjustment and our current stage due.
          const due = Math.max(adjustment, stage.due)
          // Recalculate the duration (inclusive)
          return due - start + 1
        }),
      }
    }
    // This is the same as adjusting the last stage due date.
    return this.adjustStage(stages, stages.length - 1, adjustment)
  }

  adjustStage(
    stages: StrategyStage[],
    index: number,
    adjustment: number
  ): StrategyResult {
    if (adjustment > 0) {
      const newStageDue = stages[index].due + adjustment
      return {
        start: 0,
        stages: stages.map((stage, i) => {
          // If we're BEFORE the stage that is getting extended, our duration is guaranteed to stay the same.
          if (i < index) {
            return stage.duration
          }
          // If we ARE the stage getting extended, our effective start date is the same.
          // If we're AFTER the stage getting extended, our effective start date
          // is the greater of the new stage due date and our start date
          const start =
            i === index ? stage.start : Math.max(stage.start, newStageDue)
          // Our due date is always the greater of the new stage due date and our due date.
          const due = Math.max(stage.due, newStageDue)
          // Recalculate the duration (inclusive)
          return due - start + 1
        }),
      }
    }
    // We can't ACTUALLY use the next stage start in case we're adjusting the last stage.
    // But naming this differently makes it easier to grok.
    const newStageStart = stages[index].due + adjustment
    return {
      start: Math.min(0, newStageStart),
      stages: stages.map((stage, i) => {
        // It's easier to think about this as moving the start date of
        // the stage AFTER index earlier.
        // If we're AFTER the stage that is getting its start extended,
        // our duration is guaranteed to be the same.
        if (i > index + 1) {
          return stage.duration
        }
        // If we ARE the stage getting extended, our effective due date is the same.
        // If we're BEFORE the stage getting extended, our due date is the lesser
        // of the new stage start date and our due date.
        const due =
          i === index + 1 ? stage.due : Math.min(stage.due, newStageStart)
        // Our start date is always the lesser of the new stage start date and our start date.
        const start = Math.min(stage.start, newStageStart)
        // Recalculate duration (inclusive)
        return due - start + 1
      }),
    }
  }
}
