import {
  type ProjectSchema,
  type VariableDefinitionSchema,
  type VariableInstanceSchema,
} from '@motion/zod/client'

import tk from 'timekeeper'

import {
  getAdjustedProjectDateConfirmationText,
  getDidIncreaseProjectLength,
  getStageChangeText,
  isValidStageDefinitionId,
  replaceProjectTextVariableKeys,
  replaceTextVariables,
} from '../utils'

describe('isValidStageDefinitionId', () => {
  it('returns true when the stage id is the active project stage', () => {
    const project = {
      id: 'project-1',
      activeStageDefinitionId: 'stage_def_1',
      stages: [
        {
          id: 'stage-1',
          stageDefinitionId: 'stage_def_1',
        },
      ] as ProjectSchema['stages'],
    } as ProjectSchema

    expect(isValidStageDefinitionId('stage_def_1', project))
  })

  it('returns true when the stage id is part of the listed stages', () => {
    const project = {
      id: 'project-1',
      activeStageDefinitionId: 'stage_def_1',
      stages: [
        {
          id: 'stage-1',
          stageDefinitionId: 'stage_def_1',
        },
        {
          id: 'stage-2',
          stageDefinitionId: 'stage_def_2',
        },
      ] as ProjectSchema['stages'],
    } as ProjectSchema

    expect(isValidStageDefinitionId('stage_def_2', project))
  })

  it('returns false when the stage is null', () => {
    const project = {
      id: 'project-1',
      activeStageDefinitionId: 'stage_def_1',
      stages: [
        {
          id: 'stage-1',
          stageDefinitionId: 'stage_def_1',
        },
      ] as ProjectSchema['stages'],
    } as ProjectSchema

    expect(isValidStageDefinitionId(null, project))
  })

  it('returns false when the stage is not part of the list', () => {
    const project = {
      id: 'project-1',
      activeStageDefinitionId: 'stage_def_1',
      stages: [
        {
          id: 'stage-1',
          stageDefinitionId: 'stage_def_1',
        },
        {
          id: 'stage-2',
          stageDefinitionId: 'stage_def_2',
        },
      ] as ProjectSchema['stages'],
    } as ProjectSchema

    expect(isValidStageDefinitionId('unknown', project))
  })
})

describe('replaceProjectVariableKeys', () => {
  it('should replace variable keys with their corresponding values', () => {
    const textToReplace = 'Hello, {{project_name}}!'
    const variables = [
      {
        id: '1',
        name: 'Project name',
        key: 'project_name',
        type: 'text',
        color: 'red',
      },
    ] satisfies VariableDefinitionSchema[]
    const variablesValues = {
      '1': { variableId: '1', value: 'Motion Project' },
    } satisfies Record<string, VariableInstanceSchema>

    const result = replaceProjectTextVariableKeys(
      textToReplace,
      variables,
      variablesValues
    )

    expect(result).toBe('Hello, Motion Project!')
  })

  it('should replace multiple variable keys with their corresponding values', () => {
    const textToReplace = 'Hello, {{project_name}}! Your ID is {{project_id}}.'
    const variables = [
      {
        id: '1',
        name: 'Project name',
        key: 'project_name',
        type: 'text',
        color: 'red',
      },
      {
        id: '2',
        name: 'Project ID',
        key: 'project_id',
        type: 'text',
        color: 'blue',
      },
    ] satisfies VariableDefinitionSchema[]
    const variablesValues = {
      '1': { variableId: '1', value: 'Motion Project' },
      '2': { variableId: '2', value: '12345' },
    } satisfies Record<string, VariableInstanceSchema>

    const result = replaceProjectTextVariableKeys(
      textToReplace,
      variables,
      variablesValues
    )

    expect(result).toBe('Hello, Motion Project! Your ID is 12345.')
  })

  it('should leave the text unchanged if no variables match', () => {
    const textToReplace = 'Hello, world!'
    const variables = [
      {
        id: '1',
        name: 'Project name',
        key: 'project_name',
        type: 'text',
        color: 'red',
      },
    ] satisfies VariableDefinitionSchema[]
    const variablesValues = {
      '1': { variableId: '1', value: 'Motion Project' },
    } satisfies Record<string, VariableInstanceSchema>

    const result = replaceProjectTextVariableKeys(
      textToReplace,
      variables,
      variablesValues
    )

    expect(result).toBe('Hello, world!')
  })
})

describe('replaceTextVariables', () => {
  it('should replace project and system variable keys with their corresponding values', () => {
    const text =
      'Hello, {{flow_key_project_name}}! Your ID is {{project_id}}. Welcome to {{flow_key_project_name}}.'
    const variables = [
      {
        id: '1',
        name: 'Project name',
        key: 'flow_key_project_name',
        type: 'text',
        color: 'red',
      },
      {
        id: '2',
        name: 'Project ID',
        key: 'project_id',
        type: 'text',
        color: 'blue',
      },
    ] satisfies VariableDefinitionSchema[]
    const variablesValues = {
      '1': { variableId: '1', value: 'Motion Project' },
      '2': { variableId: '2', value: '12345' },
    } satisfies Record<string, VariableInstanceSchema>
    const projectName = 'Motion Project'

    const result = replaceTextVariables(text, variables, variablesValues, {
      projectName,
    })

    expect(result).toBe(
      'Hello, Motion Project! Your ID is 12345. Welcome to Motion Project.'
    )
  })

  it('should leave the text unchanged if no variables match', () => {
    const text = 'Hello, world!'
    const variables = [
      {
        id: '1',
        name: 'Project name',
        key: 'project_name',
        type: 'text',
        color: 'red',
      },
    ] satisfies VariableDefinitionSchema[]
    const variablesValues = {
      '1': { variableId: '1', value: 'Motion Project' },
    } satisfies Record<string, VariableInstanceSchema>
    const projectName = 'Motion Project'

    const result = replaceTextVariables(text, variables, variablesValues, {
      projectName,
    })

    expect(result).toBe('Hello, world!')
  })
})

describe('getDidIncreaseProjectLength', () => {
  const project: ProjectSchema = {
    startDate: '2023-01-01',
    dueDate: '2023-01-31',
  } as ProjectSchema

  it('should return true when project length increases', () => {
    const result = getDidIncreaseProjectLength(
      project,
      '2023-01-01',
      '2023-02-15'
    )

    expect(result).toBe(true)
  })

  it('should return false when project length decreases', () => {
    const result = getDidIncreaseProjectLength(
      project,
      '2023-01-05',
      '2023-01-25'
    )

    expect(result).toBe(false)
  })

  it('should return false when project length remains the same', () => {
    const result = getDidIncreaseProjectLength(
      project,
      '2023-01-01',
      '2023-01-31'
    )

    expect(result).toBe(false)
  })

  it('should return true when start date is earlier', () => {
    const result = getDidIncreaseProjectLength(project, '2022-12-25', null)

    expect(result).toBe(true)
  })

  it('should return false when start date is later', () => {
    const result = getDidIncreaseProjectLength(project, '2023-01-05', null)

    expect(result).toBe(false)
  })

  it('should return true when due date is later', () => {
    const result = getDidIncreaseProjectLength(project, null, '2023-02-15')

    expect(result).toBe(true)
  })

  it('should return false when due date is earlier', () => {
    const result = getDidIncreaseProjectLength(project, null, '2023-01-25')

    expect(result).toBe(false)
  })

  it('should return false when both dates are null', () => {
    const result = getDidIncreaseProjectLength(project, null, null)

    expect(result).toBe(false)
  })
})

describe('getAdjustedProjectDateConfirmationText', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-11-07')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const project = {
    id: 1,
    name: 'Test Project',
    startDate: '2024-09-01',
    dueDate: '2024-10-01',
  }

  it('returns confirmation text for a longer project', () => {
    // Simulate a longer project scenario
    const result = getAdjustedProjectDateConfirmationText({
      project,
      projectStartDate: '2024-09-01',
      projectDueDate: '2024-12-01',
    })

    // Expected behavior: "longer" is used as the operation, and dates are formatted
    expect(result).toBe(
      'Are you sure you want to make this project longer (Sun Sep 1, 2024 - Sun Dec 1, 2024)?'
    )
  })

  it('returns confirmation text for a shorter project', () => {
    // Simulate a shorter project scenario
    const result = getAdjustedProjectDateConfirmationText({
      project,
      projectStartDate: '2024-09-01',
      projectDueDate: '2024-10-01',
    })

    // Expected behavior: "shorter" is used as the operation, and dates are formatted
    expect(result).toBe(
      'Are you sure you want to make this project shorter (Sun Sep 1, 2024 - Tue Oct 1, 2024)?'
    )
  })

  it('handles null start date', () => {
    const result = getAdjustedProjectDateConfirmationText({
      project,
      projectStartDate: null,
      projectDueDate: '2024-10-01',
    })

    expect(result).toBe(
      'Are you sure you want to make this project shorter (N/A - Tue Oct 1, 2024)?'
    )
  })

  it('handles null due date', () => {
    const result = getAdjustedProjectDateConfirmationText({
      project,
      projectStartDate: '2024-09-01',
      projectDueDate: null,
    })

    expect(result).toBe(
      'Are you sure you want to make this project shorter (Sun Sep 1, 2024 - N/A)?'
    )
  })

  it('handles both null start and due date', () => {
    const result = getAdjustedProjectDateConfirmationText({
      project,
      projectStartDate: null,
      projectDueDate: null,
    })

    expect(result).toBe(
      'Are you sure you want to make this project shorter (N/A - N/A)?'
    )
  })
})

describe('getStageChangeText', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-11-07')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  const pluralize = (numDays: number, singular: string, plural: string) =>
    numDays === 1 ? singular : plural

  it('returns correctly formatted text for positive number of business days', () => {
    const stageWithDates = {
      start: '2024-09-01',
      due: '2024-09-10',
    }

    const result = getStageChangeText({
      stageWithDates,
      pluralize,
    })

    expect(result).toBe('Tue Sep 10, 2024 (6 business days)')
  })

  it('returns "Less than 1 day" when number of business days is less than 1', () => {
    const stageWithDates = {
      start: '2024-09-01',
      due: '2024-09-01',
    }

    const result = getStageChangeText({
      stageWithDates,
      pluralize,
    })

    expect(result).toBe('Sun Sep 1, 2024 (Less than 1 day)')
  })

  it('pluralizes correctly for 1 business day', () => {
    const stageWithDates = {
      start: '2024-09-02',
      due: '2024-09-03',
    }

    const result = getStageChangeText({
      stageWithDates,
      pluralize,
    })

    expect(result).toBe('Tue Sep 3, 2024 (1 business day)')
  })
})
