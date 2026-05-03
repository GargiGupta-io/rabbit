import { msRecurrenceToRRule } from './microsoft'
import { type MSRecurrence } from './types'

describe('microsoft', () => {
  it('should return empty when invalid rule', () => {
    // @ts-expect-error - testing invalid
    expect(msRecurrenceToRRule(undefined)).toEqual('')
    // @ts-expect-error - testing invalid
    expect(msRecurrenceToRRule({ pattern: undefined })).toEqual('')
  })

  it('should handle absoluteMonthly', () => {
    const rule: MSRecurrence = {
      pattern: {
        type: 'absoluteMonthly',
        dayOfMonth: [3],
      },
      range: {
        type: 'numbered',
        numberOfOccurrences: 2,
      },
    }

    const actual = msRecurrenceToRRule(rule)

    expect(actual).toEqual('RRULE:BYMONTHDAY=3;FREQ=MONTHLY;COUNT=2')
  })

  it('should handle relativeMonthly', () => {
    const rule: MSRecurrence = {
      pattern: {
        index: 'first',
        type: 'relativeMonthly',
        daysOfWeek: ['fri'],
      },
      range: {
        type: 'numbered',
        numberOfOccurrences: 4,
      },
    }
    const actual = msRecurrenceToRRule(rule)

    expect(actual).toEqual('RRULE:BYDAY=+1FR;FREQ=MONTHLY;COUNT=4')
  })

  it('should handle day of week', () => {
    const rule: MSRecurrence = {
      pattern: {
        type: 'weekly',
        daysOfWeek: ['fri'],
        interval: 2,
      },
      range: {
        type: 'numbered',
        numberOfOccurrences: 4,
      },
    }
    const actual = msRecurrenceToRRule(rule)

    expect(actual).toEqual('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=FR;COUNT=4')
  })

  it('should handle end date recurrence', () => {
    const rule: MSRecurrence = {
      pattern: {
        type: 'weekly',
        daysOfWeek: ['tue'],
        interval: 2,
      },
      range: {
        type: 'endDate',
        endDate: '2023-04-28',
      },
    }
    const actual = msRecurrenceToRRule(rule)

    expect(actual).toEqual(
      'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;UNTIL=20230428T000000Z'
    )
  })

  it('should handle start date', () => {
    const rule: MSRecurrence = {
      pattern: {
        type: 'weekly',
        daysOfWeek: ['tue'],
        interval: 2,
      },
      range: {
        type: 'endDate',
        endDate: '2023-04-28',
        startDate: '2023-04-01',
      },
    }
    const actual = msRecurrenceToRRule(rule)

    expect(actual).toEqual(
      'DTSTART:20230401T000000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;UNTIL=20230428T000000Z'
    )
  })

  it('should handle first day of week', () => {
    const rule: MSRecurrence = {
      pattern: {
        type: 'weekly',
        daysOfWeek: ['wed'],
        interval: 2,
        firstDayOfWeek: 'tue',
      },
      range: {
        type: 'numbered',
        numberOfOccurrences: 5,
      },
    }
    const actual = msRecurrenceToRRule(rule)

    expect(actual).toEqual(
      'RRULE:FREQ=WEEKLY;INTERVAL=2;WKST=TU;BYDAY=WE;COUNT=5'
    )
  })
})
