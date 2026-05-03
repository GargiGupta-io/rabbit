import { type BillingPrices, TEAM_BILLING_BUCKETS } from './constants'

/**
 * Given individual and monthly team price structures, returns the price per user per month given the inputs
 *
 * @param {boolean} isAnnual - Indicates if the price is annual or monthly.
 * @param {boolean} isTeam - Indicates if the price is for a team or individual.
 * @param {BillingPrices} teamPrices - The prices for the team.
 * @param {BillingPrices} individualPrices - The prices for an individual.
 * @return {number} The computed monthly price.
 */
export const computeMonthlyPrice = (
  isAnnual: boolean,
  isTeam: boolean,
  teamPrices: BillingPrices,
  individualPrices: BillingPrices
) => {
  const prices = isTeam ? teamPrices : individualPrices
  if (isAnnual) {
    return prices.annualPricePerMonth
  }
  return prices.monthlyPrice
}

export function getMinimumBucket(teamSize?: number) {
  // Todo: Currently we error for teams > 50, we should properly handle the -1 case where applicable
  return TEAM_BILLING_BUCKETS.find((b) => b >= (teamSize || 0)) || -1
}

export function computeSavingsPercent(
  lowerPrice: number,
  higherPrice: number,
  precision?: number
) {
  const savingsAmount = lowerPrice - higherPrice
  const rawSavingsPercent = (savingsAmount / lowerPrice) * 100
  if (precision === undefined) {
    return rawSavingsPercent
  }
  return parseFloat(rawSavingsPercent.toFixed(precision))
}

export function makeBillingPrices(
  monthlyPrice: number,
  annualPrice: number
): BillingPrices {
  const annualPricePerMonth = annualPrice / 12
  const annualSavingsPercent = computeSavingsPercent(
    monthlyPrice,
    annualPricePerMonth
  )

  return {
    annualPricePerMonth,
    monthlyPrice,
    annualSavingsPercent,
    annualSavingsPercentInteger: Math.round(annualSavingsPercent),
    annualPrice,
  }
}
