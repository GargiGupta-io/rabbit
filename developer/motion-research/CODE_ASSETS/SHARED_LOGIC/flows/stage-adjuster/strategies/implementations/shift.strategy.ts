import { AccordionStrategy } from './accordion.strategy'

import {
  Feature,
  Strategy,
  StrategyResult,
  StrategyStage,
  StrategyType,
} from '../strategy.types'

const TYPE = StrategyType.SHIFT as const
const FEATURES = [Feature.ADJUST_PROJECT, Feature.ADJUST_STAGE] as const

export class ShiftStrategy implements Strategy<typeof TYPE, typeof FEATURES> {
  type = TYPE
  features = FEATURES

  internal = new AccordionStrategy()

  adjustProject(
    stages: StrategyStage[],
    _target: 'start' | 'due',
    adjustment: number
  ): StrategyResult {
    return { stages: stages.map((s) => s.duration), start: adjustment }
  }

  adjustStage(
    stages: StrategyStage[],
    index: number,
    adjustment: number
  ): StrategyResult {
    // Accordion from 0 to our index inclusive, and then keep the stages after our
    // target stage the same duration. This is a bespoke product request for
    // the way shifting stages should work.
    const accordion = this.internal.adjustStage(stages, index, adjustment)
    return {
      start: accordion.start,
      stages: [
        ...accordion.stages.slice(0, index + 1),
        ...stages.slice(index + 1).map((s) => s.duration),
      ],
    }
  }
}
