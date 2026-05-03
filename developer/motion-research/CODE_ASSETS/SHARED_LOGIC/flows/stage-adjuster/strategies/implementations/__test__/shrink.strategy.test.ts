import { StrategyStage } from '../../strategy.types'
import { ShrinkStrategy } from '../shrink.strategy'

describe('Shrink Strategy', () => {
  const strategy = new ShrinkStrategy()
  const stages: StrategyStage[] = [
    { start: 0, due: 5, duration: 6 },
    { start: 5, due: 7, duration: 3 },
    { start: 7, due: 10, duration: 4 },
  ]

  describe('Resolves stage', () => {
    it('Does not shrink stages in the past', () => {
      expect(strategy.resolveStage(stages, 1, 'cancel', 10)).toEqual({
        start: 0,
        stages: [6, 3, 4],
      })
    })

    it('Adds duration of remaining canceled stage to next stage', () => {
      const result = strategy.resolveStage(stages, 1, 'cancel', 6)

      expect(result).toEqual({
        start: 0,
        stages: [6, 2, 5],
      })
    })

    it('Adds duration of canceled stage to next stage', () => {
      const result = strategy.resolveStage(stages, 1, 'cancel', 2)

      expect(result).toEqual({
        start: 0,
        stages: [6, 1, 6],
      })
    })

    it('Does not shrink last stage if it is resolved', () => {
      const addResolvedStage = [
        ...stages,
        { start: 10, due: 11, duration: 2, completed: true },
      ]

      const result = strategy.resolveStage(addResolvedStage, 1, 'cancel', 2)

      expect(result).toEqual({
        start: 0,
        stages: [6, 1, 6, 2],
      })
    })
  })
})
