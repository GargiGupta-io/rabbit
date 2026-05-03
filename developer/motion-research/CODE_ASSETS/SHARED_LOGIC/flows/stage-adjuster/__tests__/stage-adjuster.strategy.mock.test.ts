import { mock } from '@motion/nest-testing'

import { DayMode, StageAdjuster } from '../stage-adjuster'
import { NoopStrategy } from '../strategies/implementations/noop.strategy'
import { StrategyType } from '../strategies/strategy.types'

const mockStrategy = mock<NoopStrategy>()
vi.mock('../strategies/strategies', () => ({
  loadStrategy: () => mockStrategy,
}))

describe('Strategy errors', () => {
  beforeEach(() => {
    mockStrategy.adjustProject.mockClear()
    mockStrategy.adjustStage.mockClear()
    mockStrategy.resolveStage.mockClear()
  })

  test('Invalid strategy result length', () => {
    mockStrategy.adjustProject.mockImplementationOnce(() => ({
      start: 0,
      stages: [],
    }))

    expect(() => {
      new StageAdjuster(
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
          value: new Date('2024-01-02'),
        })
        .calculateResult()
    }).toThrow()
  })

  test('Invalid strategy result duration', () => {
    mockStrategy.adjustProject.mockImplementationOnce(() => ({
      start: 0,
      stages: [0, 1],
    }))

    expect(() => {
      new StageAdjuster(
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
      ).prepareProjectAdjustment({
        strategy: StrategyType.NOOP,
        target: 'start',
        value: new Date('2024-01-02'),
      })
    }).toThrow()
  })
})
