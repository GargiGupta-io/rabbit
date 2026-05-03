export const INDIVIDUAL_MONTHLY_PRICE = 34
export const INDIVIDUAL_ANNUAL_PRICE = 228
export const INDIVIDUAL_ANNUAL_PRICE_AMORTIZED_MONTHLY =
  INDIVIDUAL_ANNUAL_PRICE / 12
export const INDIVIDUAL_ANNUAL_PLAN_SAVINGS_ABSOLUTE =
  INDIVIDUAL_MONTHLY_PRICE * 12 - INDIVIDUAL_ANNUAL_PRICE
export const INDIVIDUAL_ANNUAL_PLAN_SAVINGS_PERCENT = 44
export const OVERDUE_SUBSCRIPTION_STATES = ['unpaid', 'past_due']
export const NON_CANCELED_SUBSCRIPTION_STATUSES = [
  'active',
  'trialing',
  'past_due',
]
export const TEAM_BILLING_BUCKETS = [3, 5, 10, 15, 20, 25, 30, 40, 50]
export const TEAM_MINIMUM_BUCKET_SEATS = 3
export const TEAM_DEFAULT_BUCKET_SEATS = 5

export const MAX_SELF_SERVE_TEAM_SIZE = 50

export const INDIVIDUAL_LOW_COST_TRIAL_PRICE = 4.95
export const TEAM_LOW_COST_TRIAL_PRICE = 9.95

export const Term = {
  Annual: 'Annual',
  Monthly: 'Monthly',
  /**
   * User is charged $4.95 for 1 month, then annual
   */
  LowCostTrial: 'LowCostTrial',
  /**
   * User is charged $x (where x = the plan's annual price divided by 12 is) for 1 month, then annual
   */
  AnnualStarterTrial: 'AnnualStarterTrial',
} as const
export type Term = (typeof Term)[keyof typeof Term]

export type TierBillingPrices = {
  team: BillingPrices
  individual: BillingPrices
}

export type BillingPrices = {
  annualPrice: number
  monthlyPrice: number
  annualPricePerMonth: number
  annualSavingsPercent: number
  annualSavingsPercentInteger: number
}

export const INDIVIDUAL_PRICES: BillingPrices = {
  annualPrice: INDIVIDUAL_ANNUAL_PRICE,
  monthlyPrice: INDIVIDUAL_MONTHLY_PRICE,
  annualPricePerMonth: INDIVIDUAL_ANNUAL_PRICE_AMORTIZED_MONTHLY,
  annualSavingsPercent: INDIVIDUAL_ANNUAL_PLAN_SAVINGS_PERCENT,
  annualSavingsPercentInteger: Math.round(
    INDIVIDUAL_ANNUAL_PLAN_SAVINGS_PERCENT
  ),
}

export type PlanType = 'Individual' | 'Team' | 'Enterprise'

export const PlanNames: Record<PlanType, string> = {
  Individual: 'Individual',
  Team: 'Business Standard',
  Enterprise: 'Business Pro',
}
