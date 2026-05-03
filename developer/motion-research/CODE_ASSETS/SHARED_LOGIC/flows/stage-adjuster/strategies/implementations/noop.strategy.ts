import {
  Feature,
  Strategy,
  StrategyResult,
  StrategyStage,
  StrategyType,
} from '../strategy.types'

const TYPE = StrategyType.NOOP as const
const FEATURES = [
  Feature.RESOLVE_STAGE,
  Feature.ADJUST_PROJECT,
  Feature.ADJUST_STAGE,
] as const

export class NoopStrategy implements Strategy<typeof TYPE, typeof FEATURES> {
  type = TYPE
  features = FEATURES

  adjustProject(stages: StrategyStage[]): StrategyResult {
    return { start: 0, stages: stages.map((s) => s.duration) }
  }

  adjustStage(stages: StrategyStage[]): StrategyResult {
    return { start: 0, stages: stages.map((s) => s.duration) }
  }

  resolveStage(stages: StrategyStage[]): StrategyResult {
    return { start: 0, stages: stages.map((s) => s.duration) }
  }
}
