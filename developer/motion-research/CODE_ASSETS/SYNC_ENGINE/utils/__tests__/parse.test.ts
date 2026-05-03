import { describe, expect, test } from 'vitest'

import { comparePositions, getEarliestPosition, parsePosition } from '../parse'

describe('comparePositions', () => {
  test('returns -1 when first position commit is earlier', () => {
    const a = parsePosition('c100p200')
    const b = parsePosition('c200p200')

    expect(comparePositions(a, b)).toBe(-1)
  })

  test('returns 1 when first position commit is later', () => {
    const a = parsePosition('c200p200')
    const b = parsePosition('c100p200')

    expect(comparePositions(a, b)).toBe(1)
  })

  test('returns -1 when commits equal but first prepare is earlier', () => {
    const a = parsePosition('c100p100')
    const b = parsePosition('c100p200')

    expect(comparePositions(a, b)).toBe(-1)
  })

  test('returns 1 when commits equal but first prepare is later', () => {
    const a = parsePosition('c100p200')
    const b = parsePosition('c100p100')

    expect(comparePositions(a, b)).toBe(1)
  })

  test('returns 0 when positions are equal', () => {
    const a = parsePosition('c100p200')
    const b = parsePosition('c100p200')

    expect(comparePositions(a, b)).toBe(0)
  })

  test('handles large bigint values correctly', () => {
    const a = parsePosition('c59c65256bp59c65256b')
    const b = parsePosition('c59c65256cp59c65256c')

    expect(comparePositions(a, b)).toBe(-1)
  })
})

describe('getEarliestPosition', () => {
  test('returns first cursor when it is earlier', () => {
    const result = getEarliestPosition('c100p200', 'c200p200')

    expect(result).toBe('c100p200')
  })

  test('returns second cursor when it is earlier', () => {
    const result = getEarliestPosition('c200p200', 'c100p200')

    expect(result).toBe('c100p200')
  })

  test('returns first cursor when positions are equal', () => {
    const result = getEarliestPosition('c100p200', 'c100p200')

    expect(result).toBe('c100p200')
  })

  test('works with real cursor format from backend', () => {
    const result = getEarliestPosition(
      'c59c65256bp59c65256b',
      'c59c65256cp59c65256c'
    )

    expect(result).toBe('c59c65256bp59c65256b')
  })
})
