import { AbsorbStrategy } from './implementations/absorb.strategy'
import { AccordionStrategy } from './implementations/accordion.strategy'
import { DistributeStrategy } from './implementations/distribute.strategy'
import { NoopStrategy } from './implementations/noop.strategy'
import { ShiftStrategy } from './implementations/shift.strategy'
import { ShrinkStrategy } from './implementations/shrink.strategy'
import { Feature, FeatureMethods } from './strategy.types'

import { InvalidInputError } from '../exceptions'

export const strategies = [
  new AbsorbStrategy(),
  new AccordionStrategy(),
  new DistributeStrategy(),
  new NoopStrategy(),
  new ShiftStrategy(),
  new ShrinkStrategy(),
] as const

export type StrategyTypeWithFeature<F extends Feature> = Extract<
  (typeof strategies)[number],
  FeatureMethods<F>
>['type']

// Loads a specified strategy and enforces that the given strategy implements the expected feature.
export const loadStrategy = <F extends Feature>(
  type: StrategyTypeWithFeature<F>,
  feature: F
) => {
  const strats = strategies.filter((s) =>
    (s.features as readonly Feature[]).includes(feature)
  )

  const strategy = strats.find((s) => s.type === type)
  if (!strategy) {
    throw new InvalidInputError('No valid strategy found.', {
      cause: { type, feature },
    })
  }
  return strategy as FeatureMethods<F>
}

export type AdjustProjectStrategy =
  | StrategyTypeWithFeature<Feature.ADJUST_PROJECT>
  | {
      grow: StrategyTypeWithFeature<Feature.ADJUST_PROJECT>
      shrink: StrategyTypeWithFeature<Feature.ADJUST_PROJECT>
    }

export type AdjustStageStrategy =
  | StrategyTypeWithFeature<Feature.ADJUST_STAGE>
  | {
      before: StrategyTypeWithFeature<Feature.ADJUST_STAGE>
      after: StrategyTypeWithFeature<Feature.ADJUST_STAGE>
    }

export type ResolveStageStrategy =
  StrategyTypeWithFeature<Feature.RESOLVE_STAGE>
