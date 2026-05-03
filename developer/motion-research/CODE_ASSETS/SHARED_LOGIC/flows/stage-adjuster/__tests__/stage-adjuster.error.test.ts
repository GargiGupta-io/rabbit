import { expectResults } from './utils'

import { DayMode, StageAdjuster } from '../stage-adjuster'
import { StrategyType } from '../strategies/strategy.types'

describe('Stage Adjuster (Error handling)', () => {
  describe('Parameter errors', () => {
    test('Zero length stages are handled', () => {
      new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-10'),
          stages: [],
        },
        { dayMode: DayMode.BUSINESS }
      )
    })

    test('Stage out of order.', () => {
      expect(() => {
        new StageAdjuster(
          {
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-10'),
            stages: [
              {
                stageDefinitionId: 'one',
                dueDate: new Date('2024-01-08'),
              },
              {
                stageDefinitionId: 'two',
                dueDate: new Date('2024-01-06'),
              },
              {
                stageDefinitionId: 'three',
                dueDate: new Date('2024-01-10'),
              },
            ],
          },
          { dayMode: DayMode.BUSINESS }
        )
      }).toThrow()
    })

    test('Project start date has a time component.', () => {
      expect(() => {
        new StageAdjuster(
          {
            startDate: new Date('2024-01-01T01:00:00.000'),
            dueDate: new Date('2024-01-10'),
            stages: [
              {
                stageDefinitionId: 'one',
                dueDate: new Date('2024-01-02'),
              },
              {
                stageDefinitionId: 'two',
                dueDate: new Date('2024-01-10'),
              },
            ],
          },
          { dayMode: DayMode.BUSINESS }
        )
      }).toThrow()
    })

    test('Stage due date has a time component.', () => {
      expect(() => {
        new StageAdjuster(
          {
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-10'),
            stages: [
              {
                stageDefinitionId: 'one',
                dueDate: new Date('2024-01-02T01:00:00.000'),
              },
              {
                stageDefinitionId: 'two',
                dueDate: new Date('2024-01-10'),
              },
            ],
          },
          { dayMode: DayMode.BUSINESS }
        )
      }).toThrow()
    })

    test('Adjust project start date has a time component.', () => {
      expect(() => {
        new StageAdjuster(
          {
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-10'),
            stages: [
              {
                stageDefinitionId: 'one',
                dueDate: new Date('2024-01-02'),
              },
              {
                stageDefinitionId: 'two',
                dueDate: new Date('2024-01-10'),
              },
            ],
          },
          { dayMode: DayMode.BUSINESS }
        ).prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'start',
          value: new Date('2024-01-02T01:00:00.000'),
        })
      }).toThrow()
    })

    test('Adjust project due date has a time component.', () => {
      expect(() => {
        new StageAdjuster(
          {
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-10'),
            stages: [
              {
                stageDefinitionId: 'one',
                dueDate: new Date('2024-01-02'),
              },
              {
                stageDefinitionId: 'two',
                dueDate: new Date('2024-01-10'),
              },
            ],
          },
          { dayMode: DayMode.BUSINESS }
        ).prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-02T01:00:00.000'),
        })
      }).toThrow()
    })

    test('Adjust stage due date has a time component.', () => {
      expect(() => {
        new StageAdjuster(
          {
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-10'),
            stages: [
              {
                stageDefinitionId: 'one',
                dueDate: new Date('2024-01-02'),
              },
              {
                stageDefinitionId: 'two',
                dueDate: new Date('2024-01-10'),
              },
            ],
          },
          { dayMode: DayMode.BUSINESS }
        ).prepareStageAdjustment({
          strategy: StrategyType.ABSORB,
          stageDefinitionId: 'one',
          value: new Date('2024-01-02T01:00:00.000'),
        })
      }).toThrow()
    })

    test('Allows null project start date.', () => {
      const results = new StageAdjuster(
        {
          startDate: null,
          dueDate: new Date('2024-01-10'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-02'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'start',
          value: new Date('2000-01-01'),
        })
        .calculateResult()

      expectResults(results, { startDate: new Date('2024-01-02') })
    })

    test('Allows null project due date.', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: null,
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-02'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'due',
          value: new Date('2000-01-01'),
        })
        .calculateResult()

      expectResults(results, { dueDate: new Date('2024-01-10') })
    })

    test('Allows null project start and due date.', () => {
      const results = new StageAdjuster(
        {
          startDate: null,
          dueDate: null,
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-02'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'due',
          value: new Date('2000-01-01'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-02'),
        dueDate: new Date('2024-01-10'),
      })
    })

    test('Allows no matching active stage.', () => {
      const results = new StageAdjuster(
        {
          startDate: null,
          dueDate: null,
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-02'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
          ],
          activeStageDefinitionId: 'zero',
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'due',
          value: new Date('2000-01-01'),
        })
        .calculateResult()

      expectResults(results, {
        // All stages become active
        stages: [
          { stageDefinitionId: 'one', active: true },
          { stageDefinitionId: 'two', active: true },
        ],
      })
    })

    test('Allows null active stage.', () => {
      const results = new StageAdjuster(
        {
          startDate: null,
          dueDate: null,
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-02'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
          ],
          activeStageDefinitionId: null,
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.NOOP,
          target: 'due',
          value: new Date('2000-01-01'),
        })
        .calculateResult()

      expectResults(results, {
        // All stages become active
        stages: [
          { stageDefinitionId: 'one', active: true },
          { stageDefinitionId: 'two', active: true },
        ],
      })
    })

    test('Ignores project due date with a time component', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-10T01:00:00.000'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-02'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      ).calculateResult()

      expectResults(results, {
        dueDate: new Date('2024-01-10'),
      })
    })

    test('Corrects due date before last stage due date', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-12'),
          dueDate: new Date('2024-01-10'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-13'),
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-12'),
        dueDate: new Date('2024-01-15'),
        stages: [
          {
            stageDefinitionId: 'one',
            startDate: new Date('2024-01-12'),
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })

    test('Corrects start date after first stage due date', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-17'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-13'),
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-13'),
        dueDate: new Date('2024-01-15'),
        stages: [
          {
            stageDefinitionId: 'one',
            startDate: new Date('2024-01-13'),
            dueDate: new Date('2024-01-15'),
            duration: 1,
          },
        ],
      })
    })
  })
})
