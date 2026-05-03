import { extractUrlComponents } from '../../validation'

export function addSchemeIfNeeded(text: string): string
export function addSchemeIfNeeded(text: string | null): string | null
export function addSchemeIfNeeded(text: string | null): string | null {
  if (text == null || text.length === 0) {
    return text
  }
  const components = extractUrlComponents(text)

  // check if scheme defined
  if (components?.scheme) {
    return text
  }

  // Avoid prepending a scheme to clearly invalid values
  // - Do not modify values containing whitespace
  // - Do not modify relative paths
  // - Only prepend for domain-like or host:port values
  const hasWhitespace = /\s/.test(text)
  if (hasWhitespace) {
    return text
  }

  if (text.startsWith('/')) {
    return text
  }

  const looksLikeDomainOrHost = /[.:]/.test(text)
  if (!looksLikeDomainOrHost) {
    return text
  }

  return `https://${text}`
}
