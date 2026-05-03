import { type ProjectSchema, type StageSchema } from '@motion/rpc-types'
import { uniqueId } from '@motion/utils/core'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  getEnabledStagesWithDates,
  getUpdatedStages,
} from '../stages-with-dates'

const generateStageMock = (partialStage: Partial<StageSchema>): StageSchema => {
  return {
    id: uniqueId(),
    stageDefinitionId: uniqueId(),
    name: 'Stage',
    color: 'blue',
    rank: '0',
    visited: false,
    completedTime: null,
    canceledTime: null,
    duration: 0,
    taskCount: 0,
    completedDuration: 0,
    completedTaskCount: 0,
    canceledDuration: 0,
    canceledTaskCount: 0,
    completion: 0,
    dueDate: '2024-01-01',
    deadlineStatus: 'none',
    scheduledStatus: null,
    estimatedCompletionTime: null,
    ...partialStage,
  }
}

describe('getStagesWithDates', () => {
  test('returns stages with the first start date being the provided start date', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = DateTime.fromJSDate(new Date('2024-01-05')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({ dueDate: '2024-01-03' }),
      generateStageMock({ dueDate: '2024-01-05' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, { start, due })

    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-01',
        due: '2024-01-03',
      },
      {
        stage: stages[1],
        start: '2024-01-03',
        due: '2024-01-05',
      },
    ])
  })

  test('returns stages with the last due date being the provided due date', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = DateTime.fromJSDate(new Date('2024-01-08')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({ dueDate: '2024-01-03' }),
      generateStageMock({ dueDate: '2024-01-07' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, { start, due })

    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-01',
        due: '2024-01-03',
      },
      {
        stage: stages[1],
        start: '2024-01-03',
        due: '2024-01-08',
      },
    ])
  })

  test('uses the first items due date as the start date if no start is provided', () => {
    const start = null
    const due = DateTime.fromJSDate(new Date('2024-01-10')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({ dueDate: '2024-01-03' }),
      generateStageMock({ dueDate: '2024-01-10' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, {
      start,
      due,
    })

    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-03',
        due: '2024-01-03',
      },
      {
        stage: stages[1],
        start: '2024-01-03',
        due: '2024-01-10',
      },
    ])
  })

  test('uses the last items due date as the due date if no due is provided', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = null

    let stages: StageSchema[] = [
      generateStageMock({ dueDate: '2024-01-03' }),
      generateStageMock({ dueDate: '2024-01-10' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, {
      start,
      due,
    })

    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-01',
        due: '2024-01-03',
      },
      {
        stage: stages[1],
        start: '2024-01-03',
        due: '2024-01-10',
      },
    ])
  })

  test('correctly provides the stages with the correct dates', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = DateTime.fromJSDate(new Date('2024-01-20')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({ dueDate: '2024-01-03' }),
      generateStageMock({ dueDate: '2024-01-05' }),
      generateStageMock({ dueDate: '2024-01-08' }),
      generateStageMock({ dueDate: '2024-01-12' }),
      generateStageMock({ dueDate: '2024-01-15' }),
      generateStageMock({ dueDate: '2024-01-20' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, {
      start,
      due,
    })

    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-01',
        due: '2024-01-03',
      },
      {
        stage: stages[1],
        start: '2024-01-03',
        due: '2024-01-05',
      },
      {
        stage: stages[2],
        start: '2024-01-05',
        due: '2024-01-08',
      },
      {
        stage: stages[3],
        start: '2024-01-08',
        due: '2024-01-12',
      },
      {
        stage: stages[4],
        start: '2024-01-12',
        due: '2024-01-15',
      },
      {
        stage: stages[5],
        start: '2024-01-15',
        due: '2024-01-20',
      },
    ])
  })

  test('filters out canceled stages', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = DateTime.fromJSDate(new Date('2024-01-10')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({ dueDate: '2024-01-03' }),
      generateStageMock({
        dueDate: '2024-01-05',
        canceledTime: '2024-01-01T00:00:00.000Z',
      }),
      generateStageMock({ dueDate: '2024-01-10' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, {
      start,
      due,
    })

    // Should only include the non-canceled stages
    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-01',
        due: '2024-01-03',
      },
      {
        stage: stages[2],
        start: '2024-01-03', // Start date should connect to previous stage
        due: '2024-01-10',
      },
    ])
  })

  test('handles all stages being canceled', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = DateTime.fromJSDate(new Date('2024-01-10')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({
        dueDate: '2024-01-03',
        canceledTime: '2024-01-01T00:00:00.000Z',
      }),
      generateStageMock({
        dueDate: '2024-01-05',
        canceledTime: '2024-01-01T00:00:00.000Z',
      }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, {
      start,
      due,
    })

    // Should return empty array when all stages are canceled
    expect(stagesWithDates).toStrictEqual([])
  })

  test('handles mix of completed and canceled stages', () => {
    const start = DateTime.fromJSDate(new Date('2024-01-01')).toISODate()
    const due = DateTime.fromJSDate(new Date('2024-01-15')).toISODate()

    let stages: StageSchema[] = [
      generateStageMock({
        dueDate: '2024-01-03',
        completedTime: '2024-01-03T00:00:00.000Z',
      }),
      generateStageMock({
        dueDate: '2024-01-05',
        canceledTime: '2024-01-04T00:00:00.000Z',
      }),
      generateStageMock({ dueDate: '2024-01-10' }),
      generateStageMock({ dueDate: '2024-01-15' }),
    ]

    const stagesWithDates = getEnabledStagesWithDates(stages, {
      start,
      due,
    })

    // Should only include the non-canceled stages
    expect(stagesWithDates).toStrictEqual([
      {
        stage: stages[0],
        start: '2024-01-01',
        due: '2024-01-03',
      },
      {
        stage: stages[2],
        start: '2024-01-03',
        due: '2024-01-10',
      },
      {
        stage: stages[3],
        start: '2024-01-10',
        due: '2024-01-15',
      },
    ])
  })
})

describe('getUpdatedStages', () => {
  const project = {
    startDate: '2024-09-01',
    dueDate: '2024-12-01',
    stages: [
      {
        stageDefinitionId: 'stage-1',
        dueDate: '2024-10-01',
        canceledTime: null,
      },
      {
        stageDefinitionId: 'stage-2',
        dueDate: '2024-11-01',
        canceledTime: null,
      },
    ] as ProjectSchema['stages'],
    activeStageDefinitionId: 'stage-2',
  }

  const adjustedStages = [
    { stage: { id: 'stage-1' }, start: '2024-09-05', due: '2024-10-04' },
    { stage: { id: 'stage-2' }, start: '2024-10-04', due: '2024-12-05' },
  ]

  beforeEach(() => {
    const frozenTime = new Date('2023-11-07')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  it('returns adjusted stages with dates when startDate and dueDate are provided', () => {
    const result = getUpdatedStages({
      project,
      startDate: '2024-09-05',
      dueDate: '2024-12-05',
    })

    expect(result.stagesWithDates[0]).toEqual(
      expect.objectContaining({
        start: adjustedStages[0].start,
        due: adjustedStages[0].due,
      })
    )
    expect(result.stagesWithDates[1]).toEqual(
      expect.objectContaining({
        start: adjustedStages[1].start,
        due: adjustedStages[1].due,
      })
    )
    expect(result.updatedStages.changed).toHaveLength(2)
    expect(result.updatedStages.unchanged).toHaveLength(0)
  })
})
