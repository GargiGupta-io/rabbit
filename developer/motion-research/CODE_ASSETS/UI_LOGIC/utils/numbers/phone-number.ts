/**
 * Formats a phone number to a readable format.
 * E.g. +11234567890 -> (123) 456-7890.
 *     1234567890 -> (123) 456-7890.
 * NOTE: Only supports US/Canada phone numbers for now.
 * @param phoneNumber
 */
export function formatPhoneNumber(phoneNumber: string): string | null {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '')
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[2] + ') ' + match[3] + '-' + match[4]
  }
  return null
}
