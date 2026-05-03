import { type ProjectDefinitionSchema } from '@motion/zod/client'

import tk from 'timekeeper'

import { type SetupProjectFormFields } from '../../../form-fields'
import { getSetupProjectDueDateChangedFields } from '../due-date'

describe('getProjectDueDateChangedFields', () => {
  beforeEach(() => {
    const frozenTime = new Date('2024-01-03T16:14:30.335Z')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const defaultProject = {
    startDate: '2023-05-14',
    dueDate: '2023-12-06T21:10:03.500Z',
    stageDueDates: [],
    name: 'test',
    projectDefinition: {
      id: '1',
      workspaceId: '1',
    } as ProjectDefinitionSchema,
    projectDefinitionId: '1',
    roleAssignees: [],
    workspaceId: '1',
    textReplacements: [],
    customFieldSyncInstanceIds: [],
    customFieldValuesFieldArray: [],
  } satisfies SetupProjectFormFields

  it('returns an empty object if the due date is after the start date', () => {
    const project = {
      ...defaultProject,
      dueDate: '2023-06-01T21:10:03.500Z',
    }

    expect(getSetupProjectDueDateChangedFields(project, project)).toEqual({})
  })

  it('returns an object containing the new start date being today when deadline - 1 is before today', () => {
    const project = {
      ...defaultProject,
      startDate: '2024-01-10',
      dueDate: '2024-01-03T21:10:03.500Z',
    }

    expect(getSetupProjectDueDateChangedFields(project, project)).toEqual({
      startDate: '2024-01-03',
    })
  })

  it('returns an object containing the new start date being deadline - 1 day', () => {
    const project = {
      ...defaultProject,
      startDate: '2024-01-10',
      dueDate: '2024-01-07T21:10:03.500Z',
    }

    expect(getSetupProjectDueDateChangedFields(project, project)).toEqual({
      startDate: '2024-01-06',
    })
  })
})
