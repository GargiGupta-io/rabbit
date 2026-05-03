import { FeatureTier } from '@motion/zod/client'

import { Term } from '../billing'

export type Tier = (typeof FeatureTier)[number]

export const AiTier = ['PROAI', 'BUSINESSAI'] as const
export type AiTier = (typeof AiTier)[number]

export type TierPrices = {
  singleSeat: {
    monthly: number
    annual: number
  }
  multiSeat: {
    monthly: number
    annual: number
  }
}

const Delta = ['upgrade', 'downgrade', 'no_change'] as const
export type Delta = (typeof Delta)[number]

export const getTierDelta = (current: Tier, target: Tier): Delta => {
  if (FeatureTier.indexOf(current) > FeatureTier.indexOf(target)) {
    return 'downgrade'
  }
  if (FeatureTier.indexOf(current) < FeatureTier.indexOf(target)) {
    return 'upgrade'
  }
  return 'no_change'
}

export const getTermDelta = (current: Term, target: Term): Delta => {
  if (current === Term.Monthly && target === Term.Annual) {
    return 'upgrade'
  }
  if (current === Term.Annual && target === Term.Monthly) {
    return 'downgrade'
  }
  if (current === Term.Monthly && target === Term.AnnualStarterTrial) {
    return 'upgrade'
  }
  return 'no_change'
}

export const getBucketDelta = (current: number, target: number): Delta => {
  if (current > target) {
    return 'downgrade'
  }
  if (current < target) {
    return 'upgrade'
  }
  return 'no_change'
}

export type GetDeltaButtonTextArgs = {
  tierDelta: Delta | undefined
  termDelta: Delta | undefined
  bucketDelta: Delta | undefined
  tierTitle: string | undefined
  termAdjective: string | undefined
  bucket: number | undefined
  useResubscribeMessaging: boolean | undefined
}

export const getDeltaButtonText = ({
  tierDelta,
  termDelta,
  bucketDelta,
  tierTitle,
  termAdjective,
  bucket,
  useResubscribeMessaging,
}: GetDeltaButtonTextArgs) => {
  if (tierDelta === 'no_change' && useResubscribeMessaging && tierTitle) {
    return `Re-subscribe to ${tierTitle}`
  }
  if (tierDelta === 'no_change') {
    if (termDelta === 'upgrade' && termAdjective) {
      return `Switch to ${termAdjective} (40% less)`
    }
    if (termDelta === 'downgrade' && termAdjective) {
      return `Switch to ${termAdjective} (67% more)`
    }
    if (bucketDelta === 'upgrade' && bucket) {
      return `Upgrade to ${bucket} seats`
    }
    if (bucketDelta === 'downgrade' && bucket) {
      return `Downgrade to ${bucket} seats`
    }
    return 'Continue with Current Plan'
  }
  if (tierDelta === 'upgrade' && tierTitle) {
    return `Upgrade to ${tierTitle}`
  }
  if (tierDelta === 'downgrade' && tierTitle) {
    return `Downgrade to ${tierTitle}`
  }
  return undefined
}

// Display specific context
export type TierDisplayMode =
  | 'onboarding'
  | 'billing-settings'
  | 'upsell'
  | 'upsell-trial'
  | 'upsell-trial-upgrade'
  | 'resubscribe'
  | 'team-upgrade'
  | 'team-plan-ended'
