export const formattedCurrencyAmount = (
  amount: number,
  currency = 'USD',
  round = false
) => {
  try {
    return amount.toLocaleString(currency, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: round ? 0 : 2,
    })
  } catch (e) {
    return amount.toLocaleString('USD', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    })
  }
}
