import { clamp } from '@motion/utils/math'

import {
  Feature,
  Strategy,
  StrategyResult,
  StrategyStage,
  StrategyType,
} from '../strategy.types'

const TYPE = StrategyType.SHRINK as const
const FEATURES = [Feature.RESOLVE_STAGE] as const

export class ShrinkStrategy implements Strategy<typeof TYPE, typeof FEATURES> {
  type = TYPE
  features = FEATURES

  resolveStage(
    stages: StrategyStage[],
    index: number,
    _status: 'cancel' | 'complete',
    today: number
  ): StrategyResult {
    // Shrink the resolved stage.

    // If it's in the past, don't change it.
    // If it's in the future, shrink it to duration 1.
    // If it's ongoing, set its due date to today.

    // Effectively, this can be implemented by computing the target stage duration if we were to set
    // its due date to today, and then clamping it to (1, original stage duration)
    const stage = stages[index]

    const targetDuration = today - stage.start + 1

    const effectiveDuration = clamp(targetDuration, 1, stage.duration)
    const diff = stage.duration - effectiveDuration

    // Find next non-canceled, non-completed stage
    const nextIndex = stages.findIndex(
      (s, i) => i > index && !s.completed && !s.canceled
    )

    return {
      start: 0,
      stages: stages.map((s, i) => {
        if (i === index) return effectiveDuration
        if (i === nextIndex) return s.duration + diff
        return s.duration
      }),
    }
  }
}
