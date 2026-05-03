export const ABSORB_STRATEGY = 'ABSORB'
export const DISTRIBUTE_STRATEGY = 'DISTRIBUTE'
export const SHIFT_STRATEGY = 'SHIFT'

export const DateAdjustmentStrategies = [
  ABSORB_STRATEGY,
  DISTRIBUTE_STRATEGY,
  SHIFT_STRATEGY,
] as const

export type DateAdjustmentStrategy = (typeof DateAdjustmentStrategies)[number]
