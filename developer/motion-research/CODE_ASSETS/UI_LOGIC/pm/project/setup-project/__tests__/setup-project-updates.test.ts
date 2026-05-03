import { type SetupProjectFormFields } from '../../form-fields'
import {
  getSetupProjectDueDateChangedFields,
  getSetupProjectStartDateChangedFields,
} from '../changed-fields'
import { getSetupProjectChangedFields } from '../setup-project-updates'

const baseFields = {
  name: 'Project Name',
  projectDefinitionId: '1',
  projectDefinition: {
    id: '1',
    workspaceId: '1',
    stageDefinitionReferences: [],
    stages: [],
    name: 'Project Def Name',
    color: 'gray',
    createdByUserId: '1',
    description: 'Project Def Description',
    labelIds: [],
    managerId: '1',
    priorityLevel: 'ASAP' as const,
    variables: [],
  },
  workspaceId: '1',
  dueDate: '2021-09-01',
  startDate: '2021-08-01',
  stageDueDates: [
    {
      dueDate: '2021-09-01',
      stageDefinitionId: '1',
    },
  ],
  roleAssignees: [],
  textReplacements: [],
  customFieldSyncInstanceIds: [],
  customFieldValuesFieldArray: [],
} satisfies SetupProjectFormFields

vi.mock('../changed-fields', () => ({
  getSetupProjectDueDateChangedFields: vi.fn(),
  getSetupProjectStageDueDateChangedFields: vi.fn(),
  getSetupProjectStartDateChangedFields: vi.fn(),
}))

describe('setup-project-updates', () => {
  describe('getSetupProjectChangedFields', () => {
    it('should return empty object for unknown field name', () => {
      const fields = { ...baseFields }
      const result = getSetupProjectChangedFields(
        fields,
        fields,
        'unknownField'
      )

      expect(result).toEqual({})
    })

    it('should call getSetupProjectDueDateChangedFields for "dueDate" field', () => {
      const fields = { ...baseFields }
      const result = getSetupProjectChangedFields(fields, fields, 'dueDate')

      expect(getSetupProjectDueDateChangedFields).toHaveBeenCalledWith(
        fields,
        fields
      )
      expect(result).toEqual({})
    })

    it('should call getSetupProjectStartDateChangedFields for "startDate" field', () => {
      const fields = { ...baseFields }
      const result = getSetupProjectChangedFields(fields, fields, 'startDate')

      expect(getSetupProjectStartDateChangedFields).toHaveBeenCalledWith(
        fields,
        fields
      )
      expect(result).toEqual({})
    })

    it('should return empty object for dynamic "stageDueDates" field with invalid index', () => {
      const fields = { ...baseFields }
      const index = NaN
      const fieldName = `stageDueDates.${index}`
      const result = getSetupProjectChangedFields(fields, fields, fieldName)

      expect(result).toEqual({})
    })
  })
})
