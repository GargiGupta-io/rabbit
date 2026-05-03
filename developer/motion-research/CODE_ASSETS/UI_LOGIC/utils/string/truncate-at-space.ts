/**
 * Truncates a string to a specified number of characters while keeping word boundaries.
 */

const DEFAULT_TRUNCATE_LENGTH = 30

export const truncateAtSpace = (
  str: string,
  chars: number = DEFAULT_TRUNCATE_LENGTH,
  placeholder: string = '…'
): string => {
  if (str.length < chars) {
    return str
  }

  const spaceIndex = str
    .substring(0, chars - placeholder.length)
    .lastIndexOf(' ')

  if (spaceIndex === -1) {
    return str.substring(0, chars - placeholder.length) + placeholder
  }

  return `${str.substring(0, spaceIndex)}${placeholder}`
}
