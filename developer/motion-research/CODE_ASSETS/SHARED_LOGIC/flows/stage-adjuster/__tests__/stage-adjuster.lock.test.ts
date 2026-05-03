import tk from 'timekeeper'

import { expectResults } from './utils'

import { DayMode, LockMode, StageAdjuster } from '../stage-adjuster'
import { StrategyType } from '../strategies/strategy.types'

tk.freeze(new Date('2024-01-01'))

describe('Stage Adjuster (Stage locking w/ mock)', () => {
  describe('Updating stage due dates', () => {
    test('Compresses multiple locked stages earlier together', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-25'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
              canceled: true,
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
            {
              stageDefinitionId: 'four',
              dueDate: new Date('2024-01-20'),
              canceled: true,
            },
            {
              stageDefinitionId: 'five',
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
        .prepareStageAdjustment({
          strategy: StrategyType.ACCORDION,
          stageDefinitionId: 'four',
          value: new Date('2024-01-10'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2023-12-31'),
        startDateModified: true,
        dueDate: new Date('2024-01-25'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2023-12-31'),
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-05'),
          },
          {
            stageDefinitionId: 'four',
            dueDate: new Date('2024-01-10'),
            canceled: true,
          },
          {
            stageDefinitionId: 'five',
            dueDate: new Date('2024-01-25'),
          },
        ],
      })
    })

    test('Compresses multiple locked stages later together', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-25'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
              canceled: true,
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
            {
              stageDefinitionId: 'four',
              dueDate: new Date('2024-01-20'),
              canceled: true,
            },
            {
              stageDefinitionId: 'five',
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
        .prepareStageAdjustment({
          strategy: StrategyType.ACCORDION,
          stageDefinitionId: 'two',
          value: new Date('2024-01-20'),
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
            dueDate: new Date('2024-01-15'),
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-20'),
            canceled: true,
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-20'),
          },
          {
            stageDefinitionId: 'four',
            dueDate: new Date('2024-01-25'),
            canceled: true,
          },
          {
            stageDefinitionId: 'five',
            dueDate: new Date('2024-01-25'),
          },
        ],
      })
    })

    test('Shifts locked stage after target stage', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
              canceled: true,
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
        .prepareStageAdjustment({
          strategy: StrategyType.ACCORDION,
          stageDefinitionId: 'two',
          value: new Date('2024-01-11'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-16'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-11'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'),
            canceled: true,
          },
        ],
      })
    })

    test('Shifts locked stage before target stage', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
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
        .prepareStageAdjustment({
          strategy: StrategyType.ACCORDION,
          stageDefinitionId: 'two',
          value: new Date('2024-01-04'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2023-12-31'),
        startDateModified: true,
        dueDate: new Date('2024-01-15'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-04'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-04'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })

    test('Allows moving leading completed stage', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              completed: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
              completed: true,
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareStageAdjustment({
          strategy: StrategyType.ACCORDION,
          stageDefinitionId: 'one',
          value: new Date('2024-01-06'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-15'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-06'),
            completed: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'),
            completed: true,
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })
  })

  describe('Update project dates', () => {
    test('Allows shrinking start date', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.ACCORDION,
          target: 'start',
          value: new Date('2024-01-15'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-15'),
        startDateModified: true,
        dueDate: new Date('2024-01-15'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-15'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-15'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })

    test('Allows shrinking due date', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.ACCORDION,
          target: 'due',
          value: new Date('2024-01-01'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-1-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-01'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-01'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-01'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-01'),
          },
        ],
      })
    })

    test('Moves locked stages with due date', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
              completed: true,
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.ACCORDION,
          target: 'due',
          value: new Date('2024-01-20'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-20'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-15'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-20'),
          },
        ],
      })
    })

    test('Moves locked stages with start date', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
              completed: true,
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.ACCORDION,
          target: 'start',
          value: new Date('2023-12-20'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2023-12-20'),
        startDateModified: true,
        dueDate: new Date('2024-01-15'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2023-12-24'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })

    test('Unlocks stages if all stages are locked', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
              completed: true,
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
              completed: true,
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.ACCORDION,
          target: 'due',
          value: new Date('2024-01-16'),
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-16'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'),
            completed: true,
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'),
            completed: true,
          },
        ],
      })
    })
  })

  describe('Resolving stages', () => {
    test('Allows changing first canceled stage to completed', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareStageResolve({
          strategy: StrategyType.SHRINK,
          stageDefinitionId: 'one',
          status: 'complete',
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-15'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-01'),
            completed: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })

    test('No-op resolve is ignored', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-05'),
              canceled: true,
            },
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-01-10'),
            },
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-01-15'),
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.SHRINK_ONLY,
            canceled: true,
            completed: true,
          },
        }
      )
        .prepareStageResolve({
          strategy: StrategyType.SHRINK,
          stageDefinitionId: 'one',
          status: 'cancel',
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-15'),
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-10'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-15'),
          },
        ],
      })
    })
  })
})
