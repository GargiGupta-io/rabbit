import { type SetupProjectFormFields } from '../../../form-fields'
import { getSetupProjectStartDateChangedFields } from '../start-date'

describe('getSetupProjectStartDateChangedFields', () => {
  const defaultProject = {
    startDate: '2023-05-14',
    dueDate: '2023-12-06T21:10:03.500Z',
  } as SetupProjectFormFields

  it('returns an empty object if the start date is before the due date (deadline)', () => {
    const project = {
      ...defaultProject,
      startDate: '2023-07-20',
    }

    expect(getSetupProjectStartDateChangedFields(project, project)).toEqual({})
  })

  it('returns an object containing the new due date (being start + 1 day)', () => {
    const project = {
      ...defaultProject,
      startDate: '2023-12-10',
    }

    expect(getSetupProjectStartDateChangedFields(project, project)).toEqual({
      dueDate: '2023-12-11T23:59:59.999+00:00',
    })
  })
})
