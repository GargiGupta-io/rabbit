import {
  getRecurrenceRulesForDate,
  normalizeRRule,
  recurrenceRuleToText,
} from './parse'

describe('rrule parse', () => {
  it('should parse', () => {
    const actual = recurrenceRuleToText(
      'DTSTART:20120201T093000Z\nRRULE:FREQ=WEEKLY;INTERVAL=5;UNTIL=20130130T230000Z;BYDAY=MO,FR'
    )

    expect(actual).toEqual(
      'Every 5 weeks on Monday, Friday until January 30, 2013'
    )
  })

  it('should handle empty', () => {
    const actual = recurrenceRuleToText('')

    expect(actual).toEqual('')
  })

  it('should handle Custom', () => {
    const actual = recurrenceRuleToText('Custom')

    expect(actual).toEqual('Custom')
  })

  it('should format yearly recurrence with month and day correctly', () => {
    const actual = recurrenceRuleToText(
      'RRULE:FREQ=YEARLY;INTERVAL=1;BYMONTH=3;BYMONTHDAY=24'
    )

    expect(actual).toEqual('Yearly on March 24th')
  })
})

describe('getRecurrenceRulesForDate', () => {
  it('should return the daily, weekly, monthly, yearly, and every weekday options for a weekday', () => {
    const fridayInMarch = `2023-03-24T17:09:07.226Z`
    const actual = getRecurrenceRulesForDate(fridayInMarch).map((r) =>
      recurrenceRuleToText(r.toString())
    )

    expect(actual).toEqual([
      'Daily',
      'Weekly on Friday',
      'Monthly on the 4th Friday',
      'Every weekday',
      'Yearly',
    ])
  })

  it('should return the last day month option when applicable', () => {
    const lastFridayInApril = `2023-04-28T17:09:07.226Z`
    const actual = getRecurrenceRulesForDate(lastFridayInApril).map((r) =>
      recurrenceRuleToText(r.toString())
    )

    expect(actual).toEqual([
      'Daily',
      'Weekly on Friday',
      'Monthly on the 4th Friday',
      'Monthly on the last Friday',
      'Every weekday',
      'Yearly',
    ])
  })

  it('should not include the 5th instance of a weekday', () => {
    const fifthFridayInMarch = `2023-03-31T17:09:07.226Z`
    const actual = getRecurrenceRulesForDate(fifthFridayInMarch).map((r) =>
      recurrenceRuleToText(r.toString())
    )

    expect(actual).toEqual([
      'Daily',
      'Weekly on Friday',
      'Monthly on the last Friday',
      'Every weekday',
      'Yearly',
    ])
  })

  it('normalizes different rrule strings for comparison', () => {
    const normalizedRule1 = normalizeRRule(
      'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
    )
    const normalizedRule2 = normalizeRRule(
      'RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE'
    )

    expect(normalizedRule1).toEqual(normalizedRule2)
  })
})
