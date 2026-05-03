import {
  convertDateIntervalToDays,
  convertDaysToDeadlineInterval,
} from '../intervals'

describe('Intervals', () => {
  describe('Deadline interval conversions', () => {
    it('converts days to interval', () => {
      expect(convertDaysToDeadlineInterval(30)).toEqual({
        unit: 'MONTHS',
        value: 1,
      })
      expect(convertDaysToDeadlineInterval(14)).toEqual({
        unit: 'WEEKS',
        value: 2,
      })
      expect(convertDaysToDeadlineInterval(5)).toEqual({
        unit: 'DAYS',
        value: 5,
      })
    })

    it('converts interval to days', () => {
      expect(convertDateIntervalToDays({ unit: 'MONTHS', value: 1 })).toBe(30)
      expect(convertDateIntervalToDays({ unit: 'WEEKS', value: 2 })).toBe(14)
      expect(convertDateIntervalToDays({ unit: 'DAYS', value: 5 })).toBe(5)
    })
  })
})
