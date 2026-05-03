import { DateTime } from 'luxon'

import { prettyDateDay } from '../pretty-date-day'

describe('prettyDateDay()', () => {
  it('returns "Today"', () => {
    const date = DateTime.now()

    expect(prettyDateDay(date)).toBe('Today')
    expect(prettyDateDay(date, { lowercase: true })).toBe('today')
  })

  it('returns "Tomorrow"', () => {
    const date = DateTime.now().plus({ days: 1 })

    expect(prettyDateDay(date)).toBe('Tomorrow')
    expect(prettyDateDay(date, { lowercase: true })).toBe('tomorrow')
  })

  it('returns the given date with the default format', () => {
    const date = DateTime.fromISO('2022-09-25T16:37:30.345-04:00')

    expect(prettyDateDay(date)).toBe('Sun Sep 25, 2022')
    expect(prettyDateDay(date, { lowercase: true })).toBe('Sun Sep 25, 2022')
  })

  it('returns the given date with the given fallback', () => {
    const date = DateTime.fromISO('2023-04-12T16:37:30.345-04:00')

    expect(
      prettyDateDay(date, { fallback: (date) => date.toFormat('LLLL d') })
    ).toBe('April 12')
  })
})
