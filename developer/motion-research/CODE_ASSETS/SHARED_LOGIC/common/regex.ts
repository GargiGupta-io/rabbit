export const BRACKET_WRAP_RE = /\{\{([^{}]+)\}\}/g

/**
 * Escapes tokens in strings so they can be used for regular expressions.
 * @param token A token string to escape.
 * @returns Escaped token ready to use in a RegExp
 */
export function escapeRegExp(token: string) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
