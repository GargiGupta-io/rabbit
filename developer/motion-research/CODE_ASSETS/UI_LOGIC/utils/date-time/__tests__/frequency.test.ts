import {
  getCurrentFrequency,
  getFrequencyLabel,
  getLegacyFrequencyKey,
} from '../frequency'

describe('Frequency Functions', () => {
  describe('getLegacyFrequencyKey', () => {
    it('should return the lowercase of the given frequency', () => {
      expect(getLegacyFrequencyKey('DAILY')).toBe('daily')
      expect(getLegacyFrequencyKey('WEEKLY')).toBe('weekly')
      expect(getLegacyFrequencyKey('BIWEEKLY')).toBe('biweekly')
      expect(getLegacyFrequencyKey('MONTHLY')).toBe('monthly')
      expect(getLegacyFrequencyKey('QUARTERLY')).toBe('quarterly')
    })
  })

  describe('getCurrentFrequency', () => {
    it('should return the current frequency object for a valid frequency', () => {
      expect(getCurrentFrequency('DAILY')).toEqual(
        expect.objectContaining({ label: 'Daily' })
      )
      expect(getCurrentFrequency('WEEKLY')).toEqual(
        expect.objectContaining({ label: 'Once a week' })
      )
      expect(getCurrentFrequency('BIWEEKLY')).toEqual(
        expect.objectContaining({ label: 'Once every 2 weeks' })
      )
      expect(getCurrentFrequency('MONTHLY')).toEqual(
        expect.objectContaining({ label: 'Once a month' })
      )
      expect(getCurrentFrequency('QUARTERLY')).toEqual(
        expect.objectContaining({ label: 'Once every 3 months' })
      )
    })

    it('should return undefined for an invalid frequency', () => {
      // @ts-expect-error - Testing invalid input
      expect(getCurrentFrequency('YEARLY')).toBeUndefined()
    })
  })

  describe('getFrequencyLabel', () => {
    it('should return the label for a valid frequency', () => {
      expect(getFrequencyLabel('DAILY')).toBe('Daily')
      expect(getFrequencyLabel('WEEKLY')).toBe('Once a week')
      expect(getFrequencyLabel('BIWEEKLY')).toBe('Once every 2 weeks')
      expect(getFrequencyLabel('MONTHLY')).toBe('Once a month')
      expect(getFrequencyLabel('QUARTERLY')).toBe('Once every 3 months')
    })

    it('should return "Unknown" for an invalid frequency', () => {
      // @ts-expect-error - Testing invalid input
      expect(getFrequencyLabel('YEARLY')).toBe('Unknown')
    })
  })
})
