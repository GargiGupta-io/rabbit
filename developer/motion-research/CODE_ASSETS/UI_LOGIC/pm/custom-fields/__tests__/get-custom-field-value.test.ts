import { getCustomFieldValue } from '../get-custom-field-value'

describe('getCustomFieldValue()', () => {
  describe('string values', () => {
    it('returns null for a null value', () => {
      expect(getCustomFieldValue(null)).toBe(null)
    })

    it('returns null for an empty string', () => {
      expect(getCustomFieldValue('')).toBe(null)
    })

    it('returns null for an string only containing spaces', () => {
      expect(getCustomFieldValue(' ')).toBe(null)
    })

    it('returns the trimmed string', () => {
      expect(getCustomFieldValue(' foobar   ')).toBe('foobar')
    })
  })

  describe('arrays', () => {
    it('returns null for an empty array', () => {
      expect(getCustomFieldValue([])).toBe(null)
    })

    it('returns the arrays of string', () => {
      expect(getCustomFieldValue(['foo', 'bar'])).toEqual(['foo', 'bar'])
    })
  })

  describe('number', () => {
    it('returns the 0 number', () => {
      expect(getCustomFieldValue(0)).toBe(0)
    })

    it('returns the non zero number', () => {
      expect(getCustomFieldValue(124)).toBe(124)
    })
  })
})
