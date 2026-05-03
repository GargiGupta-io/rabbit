import { computeSavingsPercent, makeBillingPrices } from '../utils'

describe('computeAnnualSavingsPercent', () => {
  it('computes discount correctly', () => {
    expect(computeSavingsPercent(20, 12)).toEqual(40)
  })

  it('rounds correctly with precision', () => {
    expect(computeSavingsPercent(15, 10, 1)).toEqual(33.3)
  })

  it('rounds correctly with precision of 0', () => {
    expect(computeSavingsPercent(15, 10, 0)).toEqual(33)
  })
})

describe('makeBillingPrices', () => {
  it('should calculate the correct discount prices', () => {
    const monthlyPrice = 20
    const annualPrice = 144

    expect(makeBillingPrices(monthlyPrice, annualPrice)).toEqual({
      annualPricePerMonth: 12,
      monthlyPrice,
      annualSavingsPercent: 40,
      annualSavingsPercentInteger: 40,
      annualPrice,
    })
  })
})
