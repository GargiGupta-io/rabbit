import { expectResults } from './utils'

import { DayMode, StageAdjuster } from '../stage-adjuster'
import { StrategyType } from '../strategies/strategy.types'

// We're using the NOOP strategy to test business/calendar day behavior in the stage adjuster.
// None of the inputs we pass into the "prepare" methods matter with the NOOP strategy implementation.
describe('Stage Adjuster (NOOP)', () => {
  describe('Mode: Business Days', () => {
    test('Adjust project dates on week days', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'), // Monday
          dueDate: new Date('2024-01-10'), // Wednesday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'), // Friday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'), // Wednesday
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'start',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-10'), // Wednesday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'), // Friday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'), // Wednesday
          },
        ],
      })
    })

    test('Adjust stage dates on week days', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'), // Monday
          dueDate: new Date('2024-01-10'), // Wednesday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'), // Friday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'), // Wednesday
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareStageAdjustment({
          strategy: StrategyType.NOOP,
          stageDefinitionId: 'one',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-10'), // Wednesday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'), // Friday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'), // Wednesday
          },
        ],
      })
    })

    test('Resolve stage on week days', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'), // Monday
          dueDate: new Date('2024-01-10'), // Wednesday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'), // Friday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'), // Wednesday
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareStageResolve({
          strategy: StrategyType.NOOP,
          stageDefinitionId: 'one',
          status: 'cancel',
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-10'), // Wednesday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'), // Friday
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'), // Wednesday
          },
        ],
      })
    })

    test('Adjust project dates on week ends', () => {
      // We're passing in a project that starts on Friday, and has
      // stages due on Friday, Saturday, and Sunday.
      // Since we're adjusting to business days, even though the
      // strategy is NOOP, we round weekends to the next business day
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-05'), // Friday
          dueDate: new Date('2024-01-07'), // Sunday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'), // Friday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-06'), // Saturday
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-07'), // Sunday
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'start',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-05'), // Friday
        dueDate: new Date('2024-01-08'), // Monday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'), // Friday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-08'), // Monday
          },
        ],
      })
    })

    test('Adjust project dates starting on a weekend', () => {
      // We're passing in a project that starts on Saturday, and has
      // stages due on Sunday, Monday, and Tuesday.
      // Since we're adjusting to business days, even though the
      // strategy is NOOP, we assign a duration of 1 to the first two stages,
      // 2 to the last stage, and pack them all to start on Monday.
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-06'), // Saturday
          dueDate: new Date('2024-01-09'), // Tuesday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-07'), // Sunday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-08'), // Monday
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-09'), // Tuesday
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'start',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-08'), // Monday
        dueDate: new Date('2024-01-09'), // Tuesday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-08'), // Monday
            duration: 1,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
            duration: 1,
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-09'), // Tuesday
            duration: 2,
          },
        ],
      })
    })
  })

  describe('Mode: Calendar Days', () => {
    test('Adjust project dates', () => {
      // We're passing in a project that starts on Friday, and has
      // stages due on Friday, Saturday, and Sunday.
      // Since we're adjusting to calendar days, this will
      // be a real no-op.
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-05'), // Friday
          dueDate: new Date('2024-01-07'), // Sunday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'), // Friday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-06'), // Saturday
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-07'), // Sunday
            },
          ],
        },
        { dayMode: DayMode.CALENDAR }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'start',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-05'), // Friday
        dueDate: new Date('2024-01-07'), // Sunday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'), // Friday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-06'), // Saturday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-07'), // Sunday
          },
        ],
      })
    })

    test('Adjust stage dates', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-06'), // Saturday
          dueDate: new Date('2024-01-13'), // Sunday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-07'), // Sunday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'), // Wednesday
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-13'), // Sunday
            },
          ],
        },
        { dayMode: DayMode.CALENDAR }
      )
        .prepareStageAdjustment({
          strategy: StrategyType.NOOP,
          stageDefinitionId: 'one',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-06'), // Saturday
        dueDate: new Date('2024-01-13'), // Saturday
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-07'), // Sunday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'), // Wednesday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-13'), // Saturday
          },
        ],
      })
    })

    test('Resolve stage', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-03'), // Wednesday
          dueDate: new Date('2024-01-10'), // Wednesday
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-06'), // Saturday
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'), // Wednesday
            },
          ],
        },
        { dayMode: DayMode.CALENDAR }
      )
        .prepareStageResolve({
          strategy: StrategyType.NOOP,
          stageDefinitionId: 'one',
          status: 'cancel',
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-03'),
        dueDate: new Date('2024-01-10'),
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-06'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'),
          },
        ],
      })
    })
  })
})
