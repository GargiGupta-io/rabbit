import tk from 'timekeeper'

import { expectResults } from './utils'

import { DayMode, LockMode, StageAdjuster } from '../stage-adjuster'
import { StrategyType } from '../strategies/strategy.types'

tk.freeze(new Date('2024-01-01'))

describe('Stage Adjuster (Reordering)', () => {
  test('Reordering stages keeps the same durations', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-25'),
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
          {
            stageDefinitionId: 'four',
            // Duration: 4
            dueDate: new Date('2024-01-18'),
          },
          {
            stageDefinitionId: 'five',
            // Duration: 8
            dueDate: new Date('2024-01-25'),
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
      .prepareStageReorder({
        order: ['three', 'two', 'one', 'five', 'four'],
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-25'),
      dueDateModified: false,
      stages: [
        {
          stageDefinitionId: 'three',
          // Duration: 5
          dueDate: new Date('2024-01-05'),
        },
        {
          stageDefinitionId: 'two',
          // Duration: 7
          dueDate: new Date('2024-01-11'),
        },
        {
          stageDefinitionId: 'one',
          // Duration: 5
          dueDate: new Date('2024-01-15'),
        },
        {
          stageDefinitionId: 'five',
          // Duration: 8
          dueDate: new Date('2024-01-22'),
        },
        {
          stageDefinitionId: 'four',
          // Duration: 4
          dueDate: new Date('2024-01-25'),
        },
      ],
    })
  })

  test('No op reorder when the due date is on a weekend', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2023-08-01'),
        dueDate: new Date('2023-08-20'),
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2023-08-05'),
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2023-08-20'),
          },
        ],
      },
      {
        dayMode: DayMode.BUSINESS,
        lockConfig: {
          mode: LockMode.FIXED,
          canceled: true,
          completed: true,
        },
      }
    )
      .prepareStageReorder({
        order: ['one', 'two'],
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2023-08-01'),
      startDateModified: false,
      dueDate: new Date('2023-08-21'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          dueDate: new Date('2023-08-07'),
        },
        {
          stageDefinitionId: 'two',
          dueDate: new Date('2023-08-21'),
        },
      ],
    })
  })

  test('Undoing reordering is a no op', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-25'),
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
          {
            stageDefinitionId: 'four',
            // Duration: 4
            dueDate: new Date('2024-01-18'),
          },
          {
            stageDefinitionId: 'five',
            // Duration: 8
            dueDate: new Date('2024-01-25'),
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
      .prepareStageReorder({
        order: ['three', 'two', 'one', 'five', 'four'],
      })
      .prepareStageReorder({
        order: ['one', 'two', 'three', 'four', 'five'],
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-25'),
      dueDateModified: false,
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
        {
          stageDefinitionId: 'four',
          // Duration: 4
          dueDate: new Date('2024-01-18'),
        },
        {
          stageDefinitionId: 'five',
          // Duration: 8
          dueDate: new Date('2024-01-25'),
        },
      ],
    })
  })

  test('Reordering before adjusting', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2024-09-09'), // Monday
        dueDate: new Date('2024-09-20'), // Friday
        activeStageDefinitionId: 'two',
        stages: [
          // Duration: 1
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-09-09'), // Monday
          },
          // Duration: 1
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-09-09'), // Monday
          },
          // Duration: 2
          {
            stageDefinitionId: 'four',
            dueDate: new Date('2024-09-10'), // Tuesday
          },
          // Duration: 1
          {
            stageDefinitionId: 'five',
            dueDate: new Date('2024-09-10'), // Tuesday
          },
          // Duration: 2
          {
            stageDefinitionId: 'six',
            dueDate: new Date('2024-09-11'), // Wednesday
          },
          // Duration: 8
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-09-20'), // Friday
          },
        ],
      },
      { dayMode: DayMode.BUSINESS }
    )
      .prepareStageReorder({
        order: ['one', 'two', 'three', 'four', 'five', 'six'],
      })
      .prepareProjectAdjustment({
        strategy: StrategyType.DISTRIBUTE,
        target: 'start',
        value: new Date('2024-09-01'), // Adds 5 business days, but lands on a sunday
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-09-02'), // Monday
      dueDate: new Date('2024-09-20'), // Friday
      stages: [
        {
          stageDefinitionId: 'one',
          duration: 1,
          dueDate: new Date('2024-09-02'), // Monday
          startDateModified: true,
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'two',
          duration: 1,
          dueDate: new Date('2024-09-02'), // Monday
          startDateModified: true,
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'three',
          duration: 11,
          dueDate: new Date('2024-09-16'), // Monday
          startDateModified: true,
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'four',
          duration: 3,
          dueDate: new Date('2024-09-18'), // Wednesday
          startDateModified: true,
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'five',
          duration: 1,
          dueDate: new Date('2024-09-18'), // Wednesday
          startDateModified: true,
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'six',
          duration: 3,
          dueDate: new Date('2024-09-20'), // Friday
          startDateModified: true,
          dueDateModified: true,
        },
      ],
    })
  })
})
