export const enum StrategyType {
  DISTRIBUTE = 'DISTRIBUTE',
  SHIFT = 'SHIFT',
  ABSORB = 'ABSORB',
  ACCORDION = 'ACCORDION',
  SHRINK = 'SHRINK',
  NOOP = 'NOOP',
}

export const enum Feature {
  ADJUST_PROJECT = 'ADJUST_PROJECT',
  ADJUST_STAGE = 'ADJUST_STAGE',
  RESOLVE_STAGE = 'RESOLVE_STAGE',
}

// Base Strategy interface
interface StrategyBase<S extends StrategyType, F extends Feature> {
  type: S
  features: readonly F[]
}

// By converting all strategy input/outputs into numbers instead
// of dates, we can abstract out the responsibility of dealing with date issues
// and business day adjustments.

export type StrategyStage = {
  start: number
  due: number
  duration: number
  canceled?: boolean
  completed?: boolean
  active?: boolean
}

export type StrategyResult = {
  stages: number[]
  start: number
}

// Define methods for specific features
export type FeatureMethods<F extends Feature> = F extends Feature.ADJUST_PROJECT
  ? {
      adjustProject(
        stages: StrategyStage[],
        target: 'start' | 'due',
        adjustment: number,
        today: number
      ): StrategyResult
    }
  : F extends Feature.ADJUST_STAGE
    ? {
        adjustStage(
          stages: StrategyStage[],
          index: number,
          adjustment: number,
          today: number
        ): StrategyResult
      }
    : F extends Feature.RESOLVE_STAGE
      ? {
          resolveStage(
            stages: StrategyStage[],
            index: number,
            status: 'cancel' | 'complete',
            today: number
          ): StrategyResult
        }
      : object

// Combine methods based on features array
export type Strategy<
  S extends StrategyType,
  F extends readonly Feature[],
> = StrategyBase<S, F[number]> & UnionToIntersection<FeatureMethods<F[number]>>

// Helper type to convert a union of methods to an intersection (to combine feature methods)
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never
