import {
  type NormalTaskSchema,
  type ProjectSchema,
  type RecurringInstanceSchema,
  type RecurringTaskSchema,
} from '@motion/rpc-types'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import { getTaskProjectChangedFields } from '../project'

describe('getTaskProjectChangedFields', () => {
  beforeEach(() => {
    tk.freeze(DateTime.fromISO('2024-11-13T23:59:59.999+00:00').toJSDate())
  })

  afterEach(() => {
    tk.reset()
  })

  const projects = [
    {
      id: 'project-1',
      projectDefinitionId: null,
      activeStageDefinitionId: null,
      stages: [],
    } as unknown as ProjectSchema,
    {
      id: 'flow-project-1',
      projectDefinitionId: 'project-def-1',
      activeStageDefinitionId: 'stage-def-1',
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
    } as unknown as ProjectSchema,
  ] as ProjectSchema[]

  const defaultTask = {
    type: 'NORMAL',
    projectId: 'project-1',
    stageDefinitionId: null,
  } as NormalTaskSchema

  it('returns an empty object for a recurring instance', () => {
    const task = {
      ...defaultTask,
      type: 'RECURRING_INSTANCE',
    } as unknown as RecurringInstanceSchema

    expect(getTaskProjectChangedFields(task, { projects })).toEqual({})
  })

  it('returns an empty object for a recurring task', () => {
    const task = {
      ...defaultTask,
      type: 'RECURRING_TASK',
    } as unknown as RecurringTaskSchema

    expect(getTaskProjectChangedFields(task, { projects })).toEqual({})
  })

  it('returns an object with the stage definition to be the active project stage when moving to a flow project', () => {
    const task = {
      ...defaultTask,
      stageDefinition: null,
      projectId: 'flow-project-1',
    }

    expect(getTaskProjectChangedFields(task, { projects })).toEqual({
      dueDate: '2024-11-14T23:59:59.999+00:00',
      startDate: '2024-11-13',
      stageDefinitionId: 'stage-def-1',
    })
  })

  it('returns an object with the stage definition be null when moving from a flow project to a normal project', () => {
    const task = {
      ...defaultTask,
      stageDefinitionId: 'stage-def-2',
      projectId: 'project-1',
    }

    expect(getTaskProjectChangedFields(task, { projects })).toEqual({
      dueDate: '2024-11-14T23:59:59.999+00:00',
      startDate: '2024-11-13',
      stageDefinitionId: null,
    })
  })
})
