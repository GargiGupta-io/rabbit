export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Replace HTML tags with a space to preserve whitespace between tags
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
