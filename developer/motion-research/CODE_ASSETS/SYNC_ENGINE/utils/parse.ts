// Copied from kurrent
type Position = {
  commit: bigint
  prepare: bigint
}
type ReadPosition = Position | 'start' | 'end'
type Revision = bigint
type ReadRevision = Revision | 'start' | 'end'
// end copy

export function parseRevision(text: string): bigint {
  return parseBigInt(text)
}

export function parseReadRevision(text: string): ReadRevision {
  if (text === 'start') return 'start'
  if (text === 'end') return 'end'
  return parseRevision(text)
}

export function serializeRevision(value: bigint): string {
  return `0x${value.toString(16)}`
}

export function parseBigInt(text: string): bigint {
  const hexString = text.startsWith('0x') ? text : `0x${text}`
  return BigInt(hexString)
}

export function parseReadPosition(text: string): ReadPosition {
  if (text === 'start') return 'start'
  if (text === 'end') return 'end'
  return parsePosition(text)
}

export function parsePosition(text: string): Position {
  if (!text.startsWith('c')) {
    throw new Error(`The string '${text}' is not a valid position.`)
  }

  const parts = text.slice(1).split('p').map(parseBigInt)
  if (parts.length !== 2) {
    throw new Error(`The string '${text}' is not a valid position.`)
  }

  return {
    commit: parts[0]!,
    prepare: parts[1]!,
  }
}

export function serializePosition(pos: Position) {
  return `c${pos.commit.toString(16)}p${pos.prepare.toString(16)}`
}

/**
 * Compare two position objects
 * @returns -1 if a is earlier, 1 if b is earlier, 0 if equal
 */
export function comparePositions(a: Position, b: Position): number {
  // Compare commit positions first
  if (a.commit < b.commit) return -1
  if (a.commit > b.commit) return 1

  // If commits equal, compare prepare positions
  if (a.prepare < b.prepare) return -1
  if (a.prepare > b.prepare) return 1

  return 0 // Equal
}

/**
 * Get the earliest (minimum) position from two position strings
 * @param a First position string (format: c{commit_hex}p{prepare_hex})
 * @param b Second position string (format: c{commit_hex}p{prepare_hex})
 * @returns The position string that is earlier in the event log
 */
export function getEarliestPosition(a: string, b: string): string {
  const posA = parsePosition(a)
  const posB = parsePosition(b)
  return comparePositions(posA, posB) <= 0 ? a : b
}

/**
 * Categorize cursor gap severity for metrics tagging
 * Ported from packages/nest/kurrent/src/utils/position-gap.ts
 *
 * @param gap - The gap between two cursor positions (can be negative for regressions)
 * @returns Category string for use in metrics tags
 */
export function categorizeGap(gap: bigint): string {
  const absGap = gap < 0n ? -gap : gap

  if (absGap === 0n) return 'zero'
  if (absGap < 1_000_000n) return 'small'
  if (absGap < 100_000_000n) return 'medium'
  if (absGap < 500_000_000n) return 'large'
  return 'critical'
}
