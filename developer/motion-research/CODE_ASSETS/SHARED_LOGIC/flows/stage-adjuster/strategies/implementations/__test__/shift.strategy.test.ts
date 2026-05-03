import { StrategyStage } from '../../strategy.types'
import { ShiftStrategy } from '../shift.strategy'

describe('Shift Strategy', () => {
  const strategy = new ShiftStrategy()
  const stages: StrategyStage[] = [
    { start: 0, due: 5, duration: 6 },
    { start: 5, due: 5, duration: 1 },
    { start: 5, due: 7, duration: 3 },
  ]

  describe('Adjust project', () => {
    it('Shifts project start', () => {
      expect(strategy.adjustProject(stages, 'start', 5)).toEqual({
        start: 5,
        stages: [6, 1, 3],
      })
    })

    it('Shifts project due', () => {
      expect(strategy.adjustProject(stages, 'due', -5)).toEqual({
        start: -5,
        stages: [6, 1, 3],
      })
    })
  })

  describe('Adjust stage', () => {
    it('Shifts earlier', () => {
      expect(strategy.adjustStage(stages, 1, -6)).toEqual({
        start: -1,
        stages: [1, 1, 3],
      })
    })

    it('Shifts later', () => {
      expect(strategy.adjustStage(stages, 1, 5)).toEqual({
        start: 0,
        stages: [6, 6, 3],
      })
    })

    it('Shifts first stage earlier', () => {
      expect(strategy.adjustStage(stages, 0, -7)).toEqual({
        start: -2,
        stages: [1, 1, 3],
      })
    })

    it('Shifts first stage later', () => {
      expect(strategy.adjustStage(stages, 0, 5)).toEqual({
        start: 0,
        stages: [11, 1, 3],
      })
    })

    it('Shifts last stage earlier', () => {
      expect(strategy.adjustStage(stages, 2, -5)).toEqual({
        start: 0,
        stages: [3, 1, 1],
      })
    })

    it('Shifts last stage later', () => {
      expect(strategy.adjustStage(stages, 2, 5)).toEqual({
        start: 0,
        stages: [6, 1, 8],
      })
    })
  })
})
