import { splitFilename, validateFilename } from '../validations'

describe('files', () => {
  describe('splitFilename works correctly', () => {
    it.each([
      ['my-file', ['my-file', '']],
      ['my-file.zip', ['my-file', 'zip']],
    ])('should return correctly', (filename, expected) => {
      expect(splitFilename(filename)).toEqual(expected)
    })
  })

  describe('validateFilename works correctly', () => {
    it('should return false and an error if the name is empty', () => {
      const errors = validateFilename('')

      expect(errors).toContain('Name cannot be empty')
    })

    it('should return false and an error if the name is too long', () => {
      const longName = 'a'.repeat(256)
      const errors = validateFilename(longName)

      expect(errors).toContain('Name cannot be longer than 255 characters')
    })

    it('should return false and an error if the name contains invalid characters', () => {
      const errors = validateFilename('invalid/name')

      expect(errors).toContain('Name contains invalid characters')
    })

    it('should return true and no errors if the name is valid', () => {
      const errors = validateFilename('valid_name')

      expect(errors).toHaveLength(0)
    })
  })
})
