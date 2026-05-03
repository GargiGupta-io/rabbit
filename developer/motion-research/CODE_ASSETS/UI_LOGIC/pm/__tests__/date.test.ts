import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  calculateNextFridayDueDate,
  getPercentageTimeChange,
  getQuickActionsForDeadline,
  getQuickActionsForDoLater,
  getQuickActionsForStartDate,
  type QuickAction,
} from '../date'

const getResult = (results: Record<string, QuickAction>, key: string) => {
  return results[JSON.stringify(key)]
}

const resultsReducer = (
  acc: Record<string, QuickAction>,
  curr: QuickAction
) => {
  return {
    ...acc,
    [JSON.stringify(curr.label)]: curr,
  }
}

describe('date tests', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-08-01')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  test('getQuickActionsForDeadline returns a list of common options relative to a given deadline DateTime', () => {
    const date = DateTime.now()

    const results: Record<string, QuickAction> = getQuickActionsForDeadline(
      date
    ).reduce(resultsReducer, {})

    const today = getResult(results, 'Today')

    expect(today?.label).toEqual('Today')
    expect(today?.value.hasSame(date, 'day')).toBeTruthy()

    const tomorrow = getResult(results, 'Tomorrow')

    expect(tomorrow?.label).toEqual('Tomorrow')
    expect(tomorrow?.value.hasSame(date.plus({ days: 1 }), 'day')).toBeTruthy()

    const thisWeek = getResult(results, 'This week')

    expect(thisWeek?.label).toEqual('This week')
    expect(thisWeek?.value.hasSame(date, 'week')).toBeTruthy()

    const sevenDaysFromNow = getResult(results, '7 days from now')

    expect(sevenDaysFromNow?.label).toEqual('7 days from now')
    expect(
      sevenDaysFromNow?.value.hasSame(date.plus({ days: 7 }), 'day')
    ).toBeTruthy()

    const nextWeek = getResult(results, 'Next week')

    expect(nextWeek?.label).toEqual('Next week')
    expect(
      nextWeek?.value.hasSame(date.plus({ weeks: 1 }), 'week')
    ).toBeTruthy()

    const inTwoWeeks = getResult(results, 'In 2 weeks')

    expect(inTwoWeeks?.label).toEqual('In 2 weeks')
    expect(
      inTwoWeeks?.value.hasSame(date.plus({ weeks: 2 }), 'week')
    ).toBeTruthy()

    const thisMonth = getResult(results, 'This month')

    expect(thisMonth?.label).toEqual('This month')
    expect(thisMonth?.value.hasSame(date, 'month')).toBeTruthy()

    const nextMonth = getResult(results, 'Next month')

    expect(nextMonth?.label).toEqual('Next month')
    expect(
      nextMonth?.value.hasSame(date.plus({ months: 1 }), 'month')
    ).toBeTruthy()
  })

  test('getQuickActionsForStartDate returns a list of common options relative to a given startDate DateTime', () => {
    const date = DateTime.now()

    const results: Record<string, QuickAction> = getQuickActionsForStartDate(
      date
    ).reduce(resultsReducer, {})

    const today = getResult(results, 'Today')

    expect(today?.label).toEqual('Today')
    expect(today?.value.hasSame(date, 'day')).toBeTruthy()

    const tomorrow = getResult(results, 'Tomorrow')

    expect(tomorrow?.label).toEqual('Tomorrow')
    expect(tomorrow?.value.hasSame(date.plus({ days: 1 }), 'day')).toBeTruthy()

    const thisWeek = getResult(results, 'Next week')

    expect(thisWeek?.label).toEqual('Next week')
    expect(
      thisWeek?.value.hasSame(date.plus({ weeks: 1 }), 'week')
    ).toBeTruthy()

    const inTwoWeeks = getResult(results, 'In 2 weeks')

    expect(inTwoWeeks?.label).toEqual('In 2 weeks')
    expect(
      inTwoWeeks?.value.hasSame(date.plus({ weeks: 2 }), 'week')
    ).toBeTruthy()

    const nextMonth = getResult(results, 'Next month')

    expect(nextMonth?.label).toEqual('Next month')
    expect(
      nextMonth?.value.hasSame(date.plus({ months: 1 }), 'month')
    ).toBeTruthy()
  })

  test('getQuickActionsForDoLater returns a list of common options relative to a given startTime', () => {
    const date = DateTime.now().startOf('day').set({ hour: 4, minute: 30 })

    const results: Record<string, QuickAction> = getQuickActionsForDoLater(
      date
    ).reduce(resultsReducer, {})

    const in1Hour = getResult(results, 'In 1 hour')

    expect(in1Hour?.label).toEqual('In 1 hour')
    expect(in1Hour?.value.minus({ hours: 1 }).toMillis()).toBe(date.toMillis())

    const in2Hours = getResult(results, 'In 2 hours')

    expect(in2Hours?.label).toEqual('In 2 hours')
    expect(in2Hours?.value.minus({ hours: 2 }).toMillis()).toBe(date.toMillis())

    const thisAfternoon = getResult(results, 'This afternoon (3pm)')

    expect(thisAfternoon?.label).toEqual('This afternoon (3pm)')
    expect(
      thisAfternoon?.value.minus({ hours: 10, minutes: 30 }).toMillis()
    ).toBe(date.toMillis())

    const thisEvening = getResult(results, 'This evening (7pm)')

    expect(thisEvening?.label).toEqual('This evening (7pm)')
    expect(
      thisEvening?.value.minus({ hours: 14, minutes: 30 }).toMillis()
    ).toBe(date.toMillis())

    const tomorrow = getResult(results, 'Tomorrow')

    expect(tomorrow?.label).toEqual('Tomorrow')
    expect(tomorrow?.value.minus({ hours: 27, minutes: 30 }).toMillis()).toBe(
      date.toMillis()
    )

    const nextWeekKey = Object.keys(results).find((key) =>
      key.includes('Next week')
    )
    if (!nextWeekKey) {
      throw Error('Missing next week key')
    }
    const nextWeek = results[nextWeekKey]

    const nextWeekLabel = JSON.parse(nextWeekKey)

    expect(nextWeek?.label).toEqual(nextWeekLabel)
    expect(
      nextWeek?.value.hasSame(date.plus({ weeks: 1 }), 'week')
    ).toBeTruthy()
  })

  describe('calculateNextFridayDueDate', () => {
    const testCases: {
      name: string
      wantDate: string
      nowDate: string
    }[] = [
      {
        name: 'Returns this Friday if today is Monday',
        wantDate: '1/5/2024',
        nowDate: '1/1/2024',
      },
      {
        name: 'Returns this Friday if today is Tuesday',
        wantDate: '1/5/2024',
        nowDate: '1/2/2024',
      },
      {
        name: 'Returns this Friday if today is Wednesday',
        wantDate: '1/5/2024',
        nowDate: '1/3/2024',
      },
      {
        name: 'Returns next Friday if today is Thursday',
        wantDate: '1/12/2024',
        nowDate: '1/4/2024',
      },
      {
        name: 'Returns next Friday if today is Friday',
        wantDate: '1/12/2024',
        nowDate: '1/5/2024',
      },
      {
        name: 'Returns next Friday if today is Saturday',
        wantDate: '1/12/2024',
        nowDate: '1/6/2024',
      },
      {
        name: 'Returns next Friday if today is Sunday',
        wantDate: '1/12/2024',
        nowDate: '1/7/2024',
      },
    ]

    test.each(testCases)('$name', ({ wantDate, nowDate }) => {
      const mockDate = new Date(nowDate)
      const wantString = new Date(wantDate).toISOString()

      vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
      const result = calculateNextFridayDueDate()

      expect(result).toEqual(wantString)
    })
  })

  describe('getPercentageTimeChange', () => {
    test('returns 0 if any date is null', () => {
      const startDate = null
      const currentDueDate = DateTime.now().plus({ days: 10 })
      const newDueDate = DateTime.now().plus({ days: 5 })

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(0)

      const startDate2 = DateTime.now()
      const currentDueDate2 = null
      const newDueDate2 = DateTime.now().plus({ days: 5 })

      const result2 = getPercentageTimeChange({
        startDate: startDate2,
        currentDueDate: currentDueDate2,
        newDueDate: newDueDate2,
      })

      expect(result2).toEqual(0)

      const startDate3 = DateTime.now()
      const currentDueDate3 = DateTime.now().plus({ days: 10 })
      const newDueDate3 = null

      const result3 = getPercentageTimeChange({
        startDate: startDate3,
        currentDueDate: currentDueDate3,
        newDueDate: newDueDate3,
      })

      expect(result3).toEqual(0)
    })

    test('returns 0 if original duration is zero or negative', () => {
      const startDate = DateTime.now()
      const currentDueDate = startDate // Same day
      const newDueDate = startDate.plus({ days: 5 })

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(0)

      const startDate2 = DateTime.now().plus({ days: 5 })
      const currentDueDate2 = DateTime.now() // currentDueDate before startDate
      const newDueDate2 = DateTime.now().plus({ days: 10 })

      const result2 = getPercentageTimeChange({
        startDate: startDate2,
        currentDueDate: currentDueDate2,
        newDueDate: newDueDate2,
      })

      expect(result2).toEqual(0)
    })

    test('calculates correct percentage time saved for normal dates', () => {
      const startDate = DateTime.now()
      const currentDueDate = startDate.plus({ days: 10 })
      const newDueDate = startDate.plus({ days: 5 })

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(-50)
    })

    test('calculates percentage greater than 100% when new due date is before start date', () => {
      const startDate = DateTime.now()
      const currentDueDate = startDate.plus({ days: 10 })
      const newDueDate = startDate.minus({ days: 5 })

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(-150)
    })

    test('returns 100% when new due date equals start date', () => {
      const startDate = DateTime.now()
      const currentDueDate = startDate.plus({ days: 10 })
      const newDueDate = startDate

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(-100)
    })

    test('returns 0% time saved when new due date equals current due date', () => {
      const startDate = DateTime.now()
      const currentDueDate = startDate.plus({ days: 10 })
      const newDueDate = currentDueDate

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(0)
    })

    test('handles negative percentages when start date is after current due date', () => {
      const startDate = DateTime.now().plus({ days: 15 })
      const currentDueDate = DateTime.now().plus({ days: 10 })
      const newDueDate = DateTime.now().plus({ days: 5 })

      const result = getPercentageTimeChange({
        startDate,
        currentDueDate,
        newDueDate,
      })

      expect(result).toEqual(0)
    })
  })

  test('returns positive value when newDueDate is after currentDueDate', () => {
    const startDate = DateTime.now()
    const currentDueDate = startDate.plus({ days: 10 })
    const newDueDate = startDate.plus({ days: 15 })

    const result = getPercentageTimeChange({
      startDate,
      currentDueDate,
      newDueDate,
    })

    expect(result).toEqual(50)
  })

  test('returns rounded percentage when rounded parameter is true', () => {
    const startDate = DateTime.now()
    const currentDueDate = startDate.plus({ days: 11 })
    const newDueDate = startDate.plus({ days: 15 })

    const result = getPercentageTimeChange({
      startDate,
      currentDueDate,
      newDueDate,
      rounded: true,
    })

    expect(result).toEqual(36)
  })

  test('returns unrounded percentage when rounded parameter is false', () => {
    const startDate = DateTime.now()
    const currentDueDate = startDate.plus({ days: 11 })
    const newDueDate = startDate.plus({ days: 15 })

    const result = getPercentageTimeChange({
      startDate,
      currentDueDate,
      newDueDate,
      rounded: false,
    })

    // just check the first 2 decimal places
    expect(Math.round(result * 100) / 100).toEqual(36.36)
  })
})
