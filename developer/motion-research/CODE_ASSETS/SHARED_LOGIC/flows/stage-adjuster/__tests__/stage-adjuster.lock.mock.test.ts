import { mock } from 'vitest-mock-extended'

import { expectResults } from './utils'

import { DayMode, LockMode, StageAdjuster } from '../stage-adjuster'
import { NoopStrategy } from '../strategies/implementations/noop.strategy'
import { StrategyType } from '../strategies/strategy.types'

const mockStrategy = mock<NoopStrategy>()
vi.mock('../strategies/strategies', () => {
  return {
    loadStrategy: () => mockStrategy,
  }
})

describe('Stage Adjuster (Stage locking w/ mock)', () => {
  beforeAll(() => {
    mockStrategy.adjustProject.mockClear()
    mockStrategy.adjustStage.mockClear()
    mockStrategy.resolveStage.mockClear()
  })

  test('Preserves locked stage durations', () => {
    mockStrategy.adjustStage.mockImplementationOnce((stages) => {
      // Locked stages are hidden, so we should only receive one stage.
      expect(stages.length).toEqual(1)
      expect(stages[0].start).toEqual(0)
      expect(stages[0].duration).toEqual(3)
      expect(stages[0].due).toEqual(2)

      // Shrink the stage to one duration and see what happens
      return {
        start: 0,
        stages: [1],
      }
    })

    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-10'),
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-07'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-10'),
            completed: true,
          },
        ],
      },
      {
        dayMode: DayMode.CALENDAR,
        lockConfig: { mode: LockMode.FIXED, canceled: true, completed: true },
      }
    )
      .prepareStageAdjustment({
        strategy: StrategyType.NOOP,
        stageDefinitionId: 'two',
        value: new Date('2024-01-01'),
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-08'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          dueDate: new Date('2024-01-05'),
          canceled: true,
          completed: false,
        },
        {
          stageDefinitionId: 'two',
          dueDate: new Date('2024-01-05'),
          canceled: false,
          completed: false,
        },
        {
          stageDefinitionId: 'three',
          dueDate: new Date('2024-01-08'),
          canceled: false,
          completed: true,
        },
      ],
    })
  })

  test('Only allows shrinking locked stages before', () => {
    mockStrategy.adjustStage.mockImplementationOnce((stages) => {
      expect(stages.length).toEqual(2)
      expect(stages[0].start).toEqual(0)
      expect(stages[0].duration).toEqual(5)
      expect(stages[0].due).toEqual(4)
      expect(stages[1].start).toEqual(4)
      expect(stages[1].duration).toEqual(3)
      expect(stages[1].due).toEqual(6)

      return {
        start: 0,
        stages: [1, 2],
      }
    })

    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-10'),
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-07'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-10'),
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
      .prepareStageAdjustment({
        strategy: StrategyType.NOOP,
        stageDefinitionId: 'two',
        value: new Date('2024-01-01'),
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-05'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          dueDate: new Date('2024-01-01'),
          canceled: true,
          completed: false,
        },
        {
          stageDefinitionId: 'two',
          dueDate: new Date('2024-01-02'),
          canceled: false,
          completed: false,
        },
        {
          stageDefinitionId: 'three',
          dueDate: new Date('2024-01-05'),
          canceled: false,
          completed: true,
        },
      ],
    })
  })

  test('Only allows shrinking locked stages after', () => {
    mockStrategy.adjustStage.mockImplementationOnce((stages) => {
      expect(stages.length).toEqual(2)
      expect(stages[0].start).toEqual(0)
      expect(stages[0].duration).toEqual(3)
      expect(stages[0].due).toEqual(2)
      expect(stages[1].start).toEqual(2)
      expect(stages[1].duration).toEqual(4)
      expect(stages[1].due).toEqual(5)

      return {
        start: 0,
        stages: [2, 2],
      }
    })

    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-10'),
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-05'),
            canceled: true,
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-07'),
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-10'),
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
      .prepareStageAdjustment({
        strategy: StrategyType.NOOP,
        stageDefinitionId: 'two',
        value: new Date('2024-01-10'),
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-07'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          dueDate: new Date('2024-01-05'),
          canceled: true,
          completed: false,
        },
        {
          stageDefinitionId: 'two',
          dueDate: new Date('2024-01-06'),
          canceled: false,
          completed: false,
        },
        {
          stageDefinitionId: 'three',
          dueDate: new Date('2024-01-07'),
          canceled: false,
          completed: true,
        },
      ],
    })
  })
})
