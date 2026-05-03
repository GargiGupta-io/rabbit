import {
  getEmptyDropzoneId,
  isEmptyDropzoneId,
  parseDropzoneId,
} from '../parse-dropzone'

describe('parse-dropzone', () => {
  describe('getEmptyDropzoneId', () => {
    it('should prepend "empty-" to the given tasks path', () => {
      expect(getEmptyDropzoneId('tasks.0')).toBe('empty-tasks.0')
      expect(getEmptyDropzoneId('some.path')).toBe('empty-some.path')
    })
  })

  describe('isEmptyDropzoneId', () => {
    it('should return true for ids starting with "empty-"', () => {
      expect(isEmptyDropzoneId('empty-tasks.0')).toBe(true)
      expect(isEmptyDropzoneId('empty-some.path')).toBe(true)
    })

    it('should return false for ids not starting with "empty-"', () => {
      expect(isEmptyDropzoneId('tasks.0')).toBe(false)
      expect(isEmptyDropzoneId('some.path')).toBe(false)
    })

    it('should return false for non-string inputs', () => {
      // @ts-expect-error Testing invalid input
      expect(isEmptyDropzoneId(123)).toBe(false)
      // @ts-expect-error Testing invalid input
      expect(isEmptyDropzoneId(null)).toBe(false)
      // @ts-expect-error Testing invalid input
      expect(isEmptyDropzoneId(undefined)).toBe(false)
    })
  })

  describe('parseDropzoneId', () => {
    it('should parse the index from the dropzone id', () => {
      expect(parseDropzoneId('tasks.0')).toBe(0)
      expect(parseDropzoneId('tasks.1')).toBe(1)
      expect(parseDropzoneId('tasks.42')).toBe(42)
    })

    it('should return -1 for invalid formats', () => {
      expect(parseDropzoneId('invalid')).toBe(-1)
      expect(parseDropzoneId('tasks.')).toBe(-1)
      expect(parseDropzoneId('tasks.abc')).toBe(-1)
    })

    it('should return -1 for non-string inputs', () => {
      // @ts-expect-error Testing invalid input
      expect(parseDropzoneId(123)).toBe(-1)
      // @ts-expect-error Testing invalid input
      expect(parseDropzoneId(null)).toBe(-1)
      // @ts-expect-error Testing invalid input
      expect(parseDropzoneId(undefined)).toBe(-1)
    })
  })
})
