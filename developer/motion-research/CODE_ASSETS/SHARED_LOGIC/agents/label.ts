const RE_AGENT_ID = /[^\p{L}\p{N}_]/gu
export const RE_AGENT_LABEL = /^[\p{L}\p{N} _\-()]+$/u // Allow unicode, space, underscores, dashes, and parentheses in labels

/**
 * Converts a label to an ID by removing all non-alphanumeric and non-underscore
 * characters.  Allows unicode characters.
 * @param label The label to convert into an ID.
 */
export function sanitizeAgentLabel(label: string) {
  return label.toLowerCase().replace(RE_AGENT_ID, '_')
}

/**
 * Attempts to convert an agent ID back to a human-readable label on a best effort basis.
 * Since sanitization is lossy, this cannot perfectly reverse the process, but it tries to
 * make the ID more readable by replacing underscores with spaces and capitalizing words.
 * @param id The agent ID to convert back to a label.
 */
export function agentIdToLabel(id: string) {
  return id
    .split('_')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
