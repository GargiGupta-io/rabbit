import { isV2SetupProjectChangedFieldName } from '../utils'

describe('isV2SetupProjectChangedFieldName', () => {
  it('should return true for valid field names', () => {
    const validFieldNames = ['startDate', 'dueDate']
    validFieldNames.forEach((fieldName) => {
      expect(isV2SetupProjectChangedFieldName(fieldName)).toBe(true)
    })
  })

  it('should return false for invalid field names', () => {
    const invalidFieldNames = [
      'invalidFieldName',
      'stageDueDate.1',
      'dueDate_1',
    ]
    invalidFieldNames.forEach((fieldName) => {
      expect(isV2SetupProjectChangedFieldName(fieldName)).toBe(false)
    })
  })
})
