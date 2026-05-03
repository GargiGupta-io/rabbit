import { type CustomFieldValuesSchema } from '@motion/rpc-types'

/**
 * Return the real value of a custom field.
 * It returns `null` for empty string or empty arrays. Otherwise it returns the trimmed value
 */
export function getCustomFieldValue<T extends CustomFieldValuesSchema['value']>(
  value: T
) {
  const trimmedValue = typeof value === 'string' ? value.trim() : value

  if (
    (typeof trimmedValue === 'string' || Array.isArray(trimmedValue)) &&
    trimmedValue.length === 0
  ) {
    return null
  }

  return trimmedValue
}
