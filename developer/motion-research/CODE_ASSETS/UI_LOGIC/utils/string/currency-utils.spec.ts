import { formattedCurrencyAmount } from './currency-utils'

describe('Currency utils', () => {
  describe('formattedCurrencyAmount', () => {
    const testCases: {
      name: string
      amount: number
      expected: string
      currency?: string
    }[] = [
      {
        name: 'Formats a decimal amount with 2 decimal places correctly',
        amount: 199.99,
        expected: '$199.99',
      },
      {
        name: 'Formats a decimal number with 3 decimal places correctly',
        amount: 199.999,
        expected: '$200.00',
      },
      {
        name: 'Formats a decimal amount with 0 decimal places correctly',
        amount: 199,
        expected: '$199.00',
      },
      {
        name: 'Accurately parses GBP',
        amount: 199.99,
        currency: 'GBP',
        expected: '£199.99',
      },
      {
        name: 'Does not error on invalid currency',
        amount: 199.99,
        currency: 'BAD_CURRENCY',
        expected: '$199.99',
      },
    ]

    testCases.forEach((testCase) => {
      const { name, amount, expected, currency } = testCase

      it(name, () => {
        expect(formattedCurrencyAmount(amount, currency)).toBe(expected)
      })
    })
  })
})
