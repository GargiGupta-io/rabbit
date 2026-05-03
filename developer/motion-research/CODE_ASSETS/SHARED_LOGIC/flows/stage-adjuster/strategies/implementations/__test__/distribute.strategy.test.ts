import { StrategyStage } from '../../strategy.types'
import { DistributeStrategy } from '../distribute.strategy'

describe('Distribute Strategy', () => {
  const strategy = new DistributeStrategy()

  describe('Equal distribution', () => {
    const stages: StrategyStage[] = [
      // One inactive stage
      {
        start: 0,
        due: 5,
        duration: 6,
        active: false,
      },
      // Three active stages of equal length
      {
        start: 5,
        due: 7,
        duration: 3,
        active: true,
      },
      {
        start: 7,
        due: 9,
        duration: 3,
        active: true,
      },
      {
        start: 9,
        due: 11,
        duration: 3,
        active: true,
      },
    ]

    it('Equally allocates moving due date later', () => {
      expect(strategy.adjustProject(stages, 'due', 6)).toEqual({
        start: 0,
        stages: [6, 5, 5, 5],
      })
    })

    it('Equally allocates moving due date earlier', () => {
      expect(strategy.adjustProject(stages, 'due', -6)).toEqual({
        start: 0,
        stages: [6, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'due', -7)).toEqual({
        start: 0,
        stages: [5, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'due', -8)).toEqual({
        start: 0,
        stages: [4, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'due', -9)).toEqual({
        start: 0,
        stages: [3, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'due', -10)).toEqual({
        start: 0,
        stages: [2, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'due', -11)).toEqual({
        start: 0,
        stages: [1, 1, 1, 1],
      })
    })

    it('Equally allocates moving start date later', () => {
      expect(strategy.adjustProject(stages, 'start', 6)).toEqual({
        start: 6,
        stages: [6, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'start', 7)).toEqual({
        start: 7,
        stages: [5, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'start', 8)).toEqual({
        start: 8,
        stages: [4, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'start', 9)).toEqual({
        start: 9,
        stages: [3, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'start', 10)).toEqual({
        start: 10,
        stages: [2, 1, 1, 1],
      })

      expect(strategy.adjustProject(stages, 'start', 11)).toEqual({
        start: 11,
        stages: [1, 1, 1, 1],
      })
    })

    it('Equally allocates moving start date earlier', () => {
      expect(strategy.adjustProject(stages, 'start', -6)).toEqual({
        start: -6,
        stages: [6, 5, 5, 5],
      })
    })
  })

  describe('Shrinking', () => {
    const stages: StrategyStage[] = [
      // One inactive stage
      {
        start: 0,
        due: 5,
        duration: 6,
        active: false,
      },
      // Active stages
      {
        start: 5,
        due: 7,
        duration: 3,
        active: true,
      },
      {
        start: 7,
        due: 12,
        duration: 6,
        active: true,
      },
      {
        start: 12,
        due: 20,
        duration: 9,
        active: true,
      },
    ]

    it('Shrinks proportionally', () => {
      expect(strategy.adjustProject(stages, 'start', 6)).toEqual({
        start: 6,
        stages: [6, 2, 4, 6],
      })
    })

    it('Shrinks to one', () => {
      expect(strategy.adjustProject(stages, 'due', -15)).toEqual({
        start: 0,
        stages: [6, 1, 1, 1],
      })
    })

    it('Accordion shrinks inactive', () => {
      expect(strategy.adjustProject(stages, 'due', -16)).toEqual({
        start: 0,
        stages: [5, 1, 1, 1],
      })
    })
  })

  describe('Shrinking with resolved stage', () => {
    const stages: StrategyStage[] = [
      // One inactive stage
      {
        start: 0,
        due: 5,
        duration: 6,
        active: false,
      },
      // Active stages
      {
        start: 5,
        due: 7,
        duration: 3,
        active: true,
      },
      // One canceled stage
      {
        start: 7,
        due: 12,
        duration: 6,
        active: true,
        canceled: true,
      },
      {
        start: 12,
        due: 20,
        duration: 9,
        active: true,
      },
    ]

    it('Shrinks proportionally', () => {
      expect(strategy.adjustProject(stages, 'start', 6)).toEqual({
        start: 6,
        stages: [6, 2, 6, 4],
      })
    })

    it('Shrinks to one', () => {
      expect(strategy.adjustProject(stages, 'due', -15)).toEqual({
        start: 0,
        stages: [6, 1, 1, 1],
      })
    })

    it('Accordion shrinks inactive', () => {
      expect(strategy.adjustProject(stages, 'due', -16)).toEqual({
        start: 0,
        stages: [5, 1, 1, 1],
      })
    })
  })

  describe('Adjusting with all resolved stage', () => {
    const stages: StrategyStage[] = [
      // All stages are canceled and active
      {
        start: 0,
        due: 5,
        duration: 6,
        canceled: true,
        active: true,
      },
      {
        start: 5,
        due: 7,
        duration: 3,
        canceled: true,
        active: true,
      },
      {
        start: 7,
        due: 12,
        duration: 6,
        canceled: true,
        active: true,
      },
      {
        start: 12,
        due: 20,
        duration: 9,
        canceled: true,
        active: true,
      },
    ]

    it('Moves due date later', () => {
      // Should fall back to accordion
      expect(strategy.adjustProject(stages, 'due', 5)).toEqual({
        start: 0,
        stages: [6, 3, 6, 14],
      })
    })

    it('Moves due date earlier', () => {
      // Should fall back to accordion
      expect(strategy.adjustProject(stages, 'due', -5)).toEqual({
        start: 0,
        stages: [6, 3, 6, 4],
      })
    })

    it('Moves start date later', () => {
      // Should fall back to accordion (start-aligned)
      expect(strategy.adjustProject(stages, 'start', 5)).toEqual({
        start: 5,
        stages: [6, 3, 6, 4],
      })
    })

    it('Moves start date earlier', () => {
      // Should fall back to accordion (start-aligned)
      expect(strategy.adjustProject(stages, 'start', -5)).toEqual({
        start: -5,
        stages: [6, 3, 6, 14],
      })
    })
  })
})
