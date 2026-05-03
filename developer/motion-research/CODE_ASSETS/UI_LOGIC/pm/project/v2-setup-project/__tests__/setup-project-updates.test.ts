import { type V2SetupProjectFormFields } from '../../form-fields'
import {
  getSetupProjectDueDateChangedFields,
  getSetupProjectStartDateChangedFields,
} from '../changed-fields'
import { getV2SetupProjectChangedFields } from '../setup-project-updates'

const baseFields = {
  dueDate: '2021-09-01',
  startDate: '2021-08-01',
} as V2SetupProjectFormFields

vi.mock('../changed-fields', () => ({
  getSetupProjectDueDateChangedFields: vi.fn(),
  getSetupProjectStartDateChangedFields: vi.fn(),
}))

describe('setup-project-updates', () => {
  describe('getV2SetupProjectChangedFields', () => {
    it('should return empty object for unknown field name', () => {
      const fields = { ...baseFields }
      const result = getV2SetupProjectChangedFields(
        fields,
        fields,
        'unknownField'
      )

      expect(result).toEqual({})
    })

    it('should call getV2SetupProjectChangedFields for "dueDate" field', () => {
      const fields = { ...baseFields }
      const result = getV2SetupProjectChangedFields(fields, fields, 'dueDate')

      expect(getSetupProjectDueDateChangedFields).toHaveBeenCalledWith(
        fields,
        fields
      )
      expect(result).toEqual({})
    })

    it('should call getSetupProjectStartDateChangedFields for "startDate" field', () => {
      const fields = { ...baseFields }
      const result = getV2SetupProjectChangedFields(fields, fields, 'startDate')

      expect(getSetupProjectStartDateChangedFields).toHaveBeenCalledWith(
        fields,
        fields
      )
      expect(result).toEqual({})
    })
  })
})
