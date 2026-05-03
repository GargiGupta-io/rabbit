import tk from 'timekeeper'

import {
  getDayFromChoice,
  getDefaultCustomRecurrenceFormValues,
  getDefaultCustomRecurrenceString,
  parseInitialCustomRecurrenceValue,
  recurrenceFormToRecurrenceString,
} from '../event-recurrence'

describe('getDayFromChoice()', () => {
  it('returns the day portion of the day choice', () => {
    expect(getDayFromChoice('MO')).toBe('MO')
    expect(getDayFromChoice('FR')).toBe('FR')
    expect(getDayFromChoice('SU')).toBe('SU')

    expect(getDayFromChoice('+2SU')).toBe('SU')
    expect(getDayFromChoice('-5TU')).toBe('TU')
  })
})

describe('parseInitialCustomRecurrenceValue()', () => {
  beforeEach(() => {
    tk.freeze('2024-10-02T01:09:31.124Z')
  })

  it('returns the recurrence form based on a date and recurrence string', () => {
    expect(
      parseInitialCustomRecurrenceValue(
        '2024-10-05T15:30:00.000Z',
        'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SA'
      )
    ).toEqual({
      dayChoices: ['SA'],
      endsAfter: 13,
      endsChoice: 'never',
      endsOn: '2025-01-04',
      freq: 'WEEKLY',
      interval: 1,
      monthChoice: 'nth',
      weekNameStr: '1st',
      weekNum: 1,
    })
  })

  it('parses YEARLY frequency with interval correctly', () => {
    expect(
      parseInitialCustomRecurrenceValue(
        '2024-12-25T15:30:00.000Z',
        'RRULE:FREQ=YEARLY;INTERVAL=2'
      )
    ).toEqual({
      dayChoices: ['WE' as const],
      endsAfter: 5,
      endsChoice: 'never',
      endsOn: '2029-12-25',
      freq: 'YEARLY',
      interval: 2,
      monthChoice: 'nth',
      weekNameStr: '4th',
      weekNum: 4,
    })
  })

  it('parses YEARLY frequency with count correctly', () => {
    expect(
      parseInitialCustomRecurrenceValue(
        '2024-02-29T15:30:00.000Z',
        'RRULE:FREQ=YEARLY;INTERVAL=1;COUNT=3'
      )
    ).toEqual({
      dayChoices: ['TH' as const],
      endsAfter: 3,
      endsChoice: 'after',
      endsOn: '2029-02-28',
      freq: 'YEARLY',
      interval: 1,
      monthChoice: 'nth',
      weekNameStr: 'last',
      weekNum: -1,
    })
  })

  it('parses YEARLY frequency with until date correctly', () => {
    expect(
      parseInitialCustomRecurrenceValue(
        '2024-01-01T15:30:00.000Z',
        'RRULE:FREQ=YEARLY;INTERVAL=1;UNTIL=20300101T000000Z'
      )
    ).toEqual({
      dayChoices: ['MO' as const],
      endsAfter: 5,
      endsChoice: 'on',
      endsOn: '2030-01-01',
      freq: 'YEARLY',
      interval: 1,
      monthChoice: 'nth',
      weekNameStr: '1st',
      weekNum: 1,
    })
  })
})

describe('getDefaultCustomRecurrenceFormValues()', () => {
  beforeEach(() => {
    tk.freeze('2024-10-02T01:09:31.124Z')
  })

  it('returns a default recurrence form for a given date', () => {
    expect(
      getDefaultCustomRecurrenceFormValues('2024-10-05T15:30:00.000Z')
    ).toEqual({
      dayChoices: ['SA'],
      endsAfter: 13,
      endsChoice: 'never',
      endsOn: '2025-01-01',
      freq: 'WEEKLY',
      interval: 1,
      monthChoice: 'day',
      weekNameStr: '1st',
      weekNum: 1,
    })
  })
})

describe('getDefaultCustomRecurrenceString()', () => {
  beforeEach(() => {
    tk.freeze('2024-10-02T01:09:31.124Z')
  })

  it('returns a default recurrence string for a given date', () => {
    expect(getDefaultCustomRecurrenceString('2024-10-05T15:30:00.000Z')).toBe(
      'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SA'
    )
  })
})

describe('recurrenceFormToRecurrenceString()', () => {
  beforeEach(() => {
    tk.freeze('2024-10-02T01:09:31.124Z')
  })

  it('should handle YEARLY frequency correctly', () => {
    const refDate = '2024-03-24T15:30:00.000Z'
    const form = {
      interval: 1,
      freq: 'YEARLY' as const,
      dayChoices: ['FR' as const],
      monthChoice: 'day' as const,
      endsChoice: 'never' as const,
      endsOn: '2025-01-01',
      endsAfter: 5,
      weekNum: 1,
      weekNameStr: '1st',
    }

    const result = recurrenceFormToRecurrenceString(refDate, form)

    expect(result).toBe('RRULE:FREQ=YEARLY;INTERVAL=1')
  })

  it('should handle YEARLY frequency with interval', () => {
    const refDate = '2024-12-25T15:30:00.000Z'
    const form = {
      interval: 2,
      freq: 'YEARLY' as const,
      dayChoices: ['FR' as const],
      monthChoice: 'day' as const,
      endsChoice: 'after' as const,
      endsOn: '2025-01-01',
      endsAfter: 3,
      weekNum: 1,
      weekNameStr: '1st',
    }

    const result = recurrenceFormToRecurrenceString(refDate, form)

    expect(result).toBe('RRULE:FREQ=YEARLY;INTERVAL=2;COUNT=3')
  })

  it('should handle YEARLY frequency with end date', () => {
    const refDate = '2024-02-29T15:30:00.000Z' // Leap year date
    const form = {
      interval: 1,
      freq: 'YEARLY' as const,
      dayChoices: ['FR' as const],
      monthChoice: 'day' as const,
      endsChoice: 'on' as const,
      endsOn: '2030-02-28',
      endsAfter: 5,
      weekNum: 1,
      weekNameStr: '1st',
    }

    const result = recurrenceFormToRecurrenceString(refDate, form)

    expect(result).toContain(
      'RRULE:FREQ=YEARLY;INTERVAL=1;UNTIL=20300228T000000Z'
    )
  })
})
