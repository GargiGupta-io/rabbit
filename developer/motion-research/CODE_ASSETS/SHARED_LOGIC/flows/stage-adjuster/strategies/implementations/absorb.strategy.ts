import { AccordionStrategy } from './accordion.strategy'

import { InvalidInputError } from '../../exceptions'
import {
  Feature,
  Strategy,
  StrategyResult,
  StrategyStage,
  StrategyType,
} from '../strategy.types'

const TYPE = StrategyType.ABSORB as const
const FEATURES = [Feature.ADJUST_PROJECT, Feature.ADJUST_STAGE] as const

export class AbsorbStrategy implements Strategy<typeof TYPE, typeof FEATURES> {
  type = TYPE
  features = FEATURES

  // Here's a little shortcut. The "Absorb" strategy is actually the exact same as the
  // "Accordion" strategy, except we throw errors whenever things overlap.
  private internal = new AccordionStrategy()

  adjustProject(
    stages: StrategyStage[],
    target: 'start' | 'due',
    adjustment: number
  ): StrategyResult {
    if (target === 'start') {
      if (
        adjustment > 0 &&
        this.getAvailableDuration(stages, -1, 1) < adjustment
      ) {
        throw new InvalidInputError(
          'First stage cannot absorb the start date adjustment.'
        )
      }
      // Fall through to accordion
      return this.internal.adjustProject(stages, target, adjustment)
    }
    try {
      // Adjusting the project due date is the same as adjusting the last stage due date.
      return this.internalAdjustStage(stages, stages.length - 1, adjustment)
    } catch (error) {
      throw new InvalidInputError(
        'Last stage cannot absorb the due date adjustment.'
      )
    }
  }

  adjustStage(
    stages: StrategyStage[],
    index: number,
    adjustment: number
  ): StrategyResult {
    return this.internalAdjustStage(stages, index, adjustment)
  }

  // Available duration is the sum of all canceled or completed stages, plus the target stage if
  // direction is negative, or the first non-canceled non-completed stage if direction is positive.
  public getAvailableDuration(
    stages: StrategyStage[],
    index: number,
    direction: 1 | -1
  ): number {
    let availableDuration = 0
    if (direction > 0) {
      let i = index + 1
      // If our target was the last stage and we're increasing duration
      // then we always have available duration since project due date matches last stage due date.
      if (i === stages.length) {
        return Infinity
      }
      while (i < stages.length && (stages[i].canceled || stages[i].completed)) {
        availableDuration += stages[i].duration - 1
        i++
      }
      availableDuration += stages[i]?.duration ? stages[i].duration - 1 : 0
    } else {
      // If our target was the start stage and we're moving the start date earlier
      // then we always have available duration
      if (index === -1) {
        return Infinity
      }
      availableDuration += stages[index].duration - 1
      let i = index - 1
      while (0 <= i && (stages[i].canceled || stages[i].completed)) {
        availableDuration += stages[i].duration - 1
        i--
      }
    }
    return availableDuration
  }

  private internalAdjustStage(
    stages: StrategyStage[],
    index: number,
    adjustment: number
  ): StrategyResult {
    const direction = adjustment > 0 ? 1 : -1
    if (
      this.getAvailableDuration(stages, index, direction) < Math.abs(adjustment)
    ) {
      throw new InvalidInputError(
        `${
          direction > 0 ? 'Next' : 'Current'
        } stage cannot absorb the due date adjustment.`
      )
    }
    return this.internal.adjustStage(stages, index, adjustment)
  }
}
