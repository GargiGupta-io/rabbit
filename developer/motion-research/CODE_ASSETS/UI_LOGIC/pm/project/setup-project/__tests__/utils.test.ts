import { isSetupProjectChangedFieldName } from '../utils'

describe('isSetupProjectChangedFieldName', () => {
  it('should return true for valid field names', () => {
    const validFieldNames = [
      'startDate',
      'dueDate',
      'stageDueDates',
      'stageDueDates_1',
      'stageDueDates_2',
    ]
    validFieldNames.forEach((fieldName) => {
      expect(isSetupProjectChangedFieldName(fieldName)).toBe(true)
    })
  })

  it('should return false for invalid field names', () => {
    const invalidFieldNames = [
      'invalidFieldName',
      'stageDueDate.1',
      'dueDate_1',
    ]
    invalidFieldNames.forEach((fieldName) => {
      expect(isSetupProjectChangedFieldName(fieldName)).toBe(false)
    })
  })
})
