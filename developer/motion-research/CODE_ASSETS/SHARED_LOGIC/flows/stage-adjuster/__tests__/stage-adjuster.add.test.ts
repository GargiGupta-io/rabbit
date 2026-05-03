import tk from 'timekeeper'

import { expectResults } from './utils'

import { DayMode, LockMode, StageAdjuster } from '../stage-adjuster'

tk.freeze(new Date('2024-01-01'))

describe('Stage Adjuster (Adding)', () => {
  test('Adding a stage shifts later stages down', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        stages: [
          {
            stageDefinitionId: 'one',
            // Duration: 5
            dueDate: new Date('2024-01-05'),
          },
          {
            stageDefinitionId: 'two',
            // Duration: 7
            dueDate: new Date('2024-01-11'),
          },
          {
            stageDefinitionId: 'three',
            // Duration: 5
            dueDate: new Date('2024-01-15'),
          },
        ],
      },
      {
        dayMode: DayMode.CALENDAR,
        lockConfig: {
          mode: LockMode.FIXED,
          canceled: true,
          completed: true,
        },
      }
    )
      .prepareStageAdd({
        stageDefinitionId: 'two-b', // or not two-b?
        duration: 5,
        index: 2,
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-19'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          // Duration: 5
          dueDate: new Date('2024-01-05'),
        },
        {
          stageDefinitionId: 'two',
          // Duration: 7
          dueDate: new Date('2024-01-11'),
          dueDateModified: false,
        },
        {
          stageDefinitionId: 'two-b',
          // Duration: 5
          startDate: new Date('2024-01-11'),
          startDateModified: true,
          dueDate: new Date('2024-01-15'),
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'three',
          // Duration: 5
          startDate: new Date('2024-01-15'),
          startDateModified: true,
          dueDate: new Date('2024-01-19'),
          dueDateModified: true,
        },
      ],
    })
  })

  test('Reordering before adding', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        stages: [
          {
            stageDefinitionId: 'two',
            // Duration: 7
            dueDate: new Date('2024-01-07'),
          },
          {
            stageDefinitionId: 'three',
            // Duration: 5
            dueDate: new Date('2024-01-11'),
          },
          {
            stageDefinitionId: 'one',
            // Duration: 5
            dueDate: new Date('2024-01-15'),
          },
        ],
      },
      {
        dayMode: DayMode.CALENDAR,
        lockConfig: {
          mode: LockMode.FIXED,
          canceled: true,
          completed: true,
        },
      }
    )
      .prepareStageReorder({ order: ['one', 'two', 'three'] })
      .prepareStageAdd({
        stageDefinitionId: 'two-b', // or not two-b?
        duration: 5,
        index: 2,
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-19'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          // Duration: 5
          dueDate: new Date('2024-01-05'),
        },
        {
          stageDefinitionId: 'two',
          // Duration: 7
          dueDate: new Date('2024-01-11'),
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'two-b',
          // Duration: 5
          startDate: new Date('2024-01-11'),
          startDateModified: true,
          dueDate: new Date('2024-01-15'),
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'three',
          // Duration: 5
          startDate: new Date('2024-01-15'),
          startDateModified: true,
          dueDate: new Date('2024-01-19'),
          dueDateModified: true,
        },
      ],
    })
  })
})
