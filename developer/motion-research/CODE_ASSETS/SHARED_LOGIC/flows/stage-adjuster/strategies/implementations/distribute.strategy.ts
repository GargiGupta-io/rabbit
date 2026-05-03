import { AccordionStrategy } from './accordion.strategy'

import { InternalError } from '../../exceptions'
import {
  Feature,
  Strategy,
  StrategyResult,
  StrategyStage,
  StrategyType,
} from '../strategy.types'

const TYPE = StrategyType.DISTRIBUTE as const
const FEATURES = [Feature.ADJUST_PROJECT] as const

export class DistributeStrategy
  implements Strategy<typeof TYPE, typeof FEATURES>
{
  type = TYPE
  features = FEATURES

  private fallback = new AccordionStrategy()

  private buildRatios(stages: StrategyStage[]) {
    // Build up a map of ratios by accumulating a denominator
    // and building a list of numerators with a filter.
    let active = 0
    let denominator = 0
    const numerators: number[] = []
    for (const stage of stages) {
      if (!!stage.active && !stage.canceled && !stage.completed) {
        active++
        denominator += stage.duration
        numerators.push(stage.duration)
      } else {
        numerators.push(0)
      }
    }
    return {
      active,
      denominator,
      numerators,
    }
  }

  adjustProject(
    stages: StrategyStage[],
    target: 'start' | 'due',
    adjustment: number
  ): StrategyResult {
    const delta = target === 'start' ? adjustment * -1 : adjustment
    const firstActive = stages.find((stage) => stage.active)

    if (!firstActive) {
      throw new InternalError('No active stage.')
    }

    // -- [[ Example ]] --
    // An example with stage durations: [1, 2, 5, 2, 1, 1], target='start',
    // and adjustment=5 will be provided.
    // In the above example, stage 5 (second to last 1) is canceled.
    // delta = -5 (since target === 'start')

    // Numerators is the the length of each stage if we're adjusting it, or zero otherwise.
    // Denominator is the number of business days we have available across all adjustable stages.
    // Active is the number of stages we are considering in the ratios.
    // We need to subtract the number of active stages because stage durations
    // are not allowed to be zero.
    //
    // -- [[ Example ]] --
    // numerators: [1, 2, 5, 2, 0, 1]
    // denominator: 1 + 2 + 5 + 2 + 1 = 11
    // active: 5
    const { numerators, denominator, active } = this.buildRatios(stages)

    // If the adjustment would remove duration from all active & unresolved stages, fall back to accordion.
    // NOTE: There are a couple different ways we could fall back here.
    // We could either:
    // Switch to shrinking via accordion < this is our current preference.
    // or we could try distribute shrinking to more stages (past stages, for instance.)
    // or we could distribute shrinking to all stages (including canceled and completed.)
    //
    // -- [[ Example ]] --
    // 11 - 1 - 5 = 5. We have enough active stage durations to shrink, so we do not
    // fall back to accordion.
    if (active === 0 || denominator - active + delta < 0) {
      // Apply our accordion change as if it was a due date change.
      return {
        ...this.fallback.adjustProject(stages, 'due', delta),
        start: target === 'start' ? adjustment : 0,
      }
    }

    // We want to allocate starting from the shortest stage to the longest. This
    // lets us bound the minimum duration of each stage to one, and guarantees
    // that we can apply the clipped adjustment to later, longer stages.
    // This handles an edge case when shrinking projects.
    // We start by sorting the effective durations from smallest to largest
    //
    // -- [[ Example ]] --
    // numerators: [1, 2, 5, 2, 0, 1]
    // sortedNumerators.numerator: [0, 1, 1, 2, 2, 5]
    // sortedNumerators.index:     [4, 0, 5, 1, 3, 2]
    // (.sort is stable, so tied numerators are in index-order)
    const sortedNumerators = numerators
      .map((n, i) => ({ numerator: n, index: i }))
      .sort((a, b) => a.numerator - b.numerator)

    // Build a list of denominators in sorted order.
    // The denominators are a sum from the current element to the end.
    //
    // -- [[ Example ]] --
    // sortedNumerators.numerator: [0, 1, 1, 2, 2, 5]
    // sortedDenominators: [11, 11, 10, 9, 7, 5]
    let numeratorSum = 0
    const sortedDenominators = sortedNumerators.map(({ numerator }) => {
      const denominatorSum = denominator - numeratorSum
      numeratorSum += numerator
      return denominatorSum
    })

    // -- [[ Example ]] --
    // sortedNumerators: {numerator: 0, index: 4}, denominator: 11
    // - remainingDelta: -5
    // - ratio: 0/11 = 0
    //
    // sortedNumerators: {numerator: 1, index: 0}, denominator: 11
    // - remainingDelta: -5
    // - ratio: 1/11 = 0.09
    // - limitAllocation: 0 (our stage is duration 1, cannot shrink)
    // - targetAllocation: -5 * 0.09 = -0.45 -> 0
    // - boundedAllocation: 0
    //
    // sortedNumerators: {numerator: 1, index: 5}, denominator: 10
    // - remainingDelta: -5
    // - ratio: 1/10 = 0.10
    // - limitAllocation: 0 (our stage is duration 1, cannot shrink)
    // - targetAllocation: -5 * 0.10 = -0.50 -> 0
    // - boundedAllocation: 0
    //
    // sortedNumerators: {numerator: 2, index: 1}, denominator: 9
    // - remainingDelta: -5
    // - ratio: 2/9 = 0.222
    // - limitAllocation: -1
    // - targetAllocation: -5 * 0.22 = -1.1 -> -1
    // - boundedAllocation: -1
    //
    // sortedNumerators: {numerator: 2, index: 3}, denominator: 7
    // - remainingDelta: -4
    // - ratio: 2/7 = 0.28
    // - limitAllocation: -1
    // - targetAllocation: -4 * 0.28 = -1.12 -> -1
    // - boundedAllocation: -1
    //
    // sortedNumerators: {numerator: 5, index: 2}, denominator: 5
    // - remainingDelta: -3
    // - ratio: 5/5 = 1.0
    // - limitAllocation: -4
    // - targetAllocation: -3 * 1.0 = -3.0 -> -3.0
    // - boundedAllocation: -3
    //
    // allocations: [0, -1, -3, -1, 0, 0]
    const allocations: number[] = new Array(stages.length).fill(0)
    let remainingDelta = delta
    for (const [i, { numerator, index }] of sortedNumerators.entries()) {
      // If the numerator is zero we already know nothing will be allocated.
      if (numerator === 0) continue
      const ratio = numerator / sortedDenominators[i]
      const limitAllocation = 1 - numerator
      const targetAllocation = Math.round(ratio * remainingDelta)
      const boundedAllocation = Math.max(targetAllocation, limitAllocation)
      allocations[index] = boundedAllocation
      remainingDelta -= boundedAllocation
    }

    if (remainingDelta !== 0) {
      throw new InternalError('Adjustment was not fully allocated.')
    }

    if (allocations.length !== stages.length) {
      throw new InternalError('Invalid allocation length')
    }

    // -- [[ Example ]] --
    // stage.durations: [1, 2, 5, 2, 1, 1]
    // allocations: [0, -1, -3, -1, 0, 0]
    // result: [1, 1, 2, 1, 1, 1]
    const result = stages.map(
      (stage, index) => stage.duration + allocations[index]
    )
    if (result.some((r) => r <= 0)) {
      throw new InternalError('Distribute resulted in invalid stage durations.')
    }

    return {
      start: target === 'start' ? adjustment : 0,
      stages: result,
    }
  }
}
