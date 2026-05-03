import { type NumberMetadataSchema } from '@motion/shared/custom-fields'

export function truncateDecimalsInTextNumber(
  text: string,
  decimalLength: number = 2
): number {
  const truncated =
    text.indexOf('.') >= 0
      ? text.slice(0, text.indexOf('.') + decimalLength + 1)
      : text
  return parseFloat(truncated)
}

export function formatNumberValue(
  value: number | string,
  format: NumberMetadataSchema['format']
): string {
  if (value === '') {
    return value
  }

  if (format === 'percent') {
    return `${value}%`
  }

  if (format === 'formatted') {
    return value?.toLocaleString() ?? ''
  }

  return value.toString() ?? ''
}
