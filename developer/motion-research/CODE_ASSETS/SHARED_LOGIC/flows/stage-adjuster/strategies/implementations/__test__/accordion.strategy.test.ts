import { StrategyStage } from '../../strategy.types'
import { AccordionStrategy } from '../accordion.strategy'

describe('Accordion Strategy', () => {
  const strategy = new AccordionStrategy()

  describe('Adjust project', () => {
    const stages: StrategyStage[] = [
      { start: 0, due: 5, duration: 6 },
      { start: 5, due: 5, duration: 1 },
      { start: 5, due: 7, duration: 3 },
    ]

    it('Moves project start earlier', () => {
      expect(strategy.adjustProject(stages, 'start', -4)).toEqual({
        start: -4,
        stages: [10, 1, 3],
      })
    })

    it('Moves project start later', () => {
      expect(strategy.adjustProject(stages, 'start', 5)).toEqual({
        start: 5,
        stages: [1, 1, 3],
      })
    })

    it('Moving project start after first stage due date also moves first stage due date', () => {
      expect(strategy.adjustProject(stages, 'start', 6)).toEqual({
        start: 6,
        stages: [1, 1, 2],
      })
    })

    it('Moves project due earlier', () => {
      expect(strategy.adjustProject(stages, 'due', -2)).toEqual({
        start: 0,
        stages: [6, 1, 1],
      })
    })

    it('Moves project due later', () => {
      expect(strategy.adjustProject(stages, 'due', 10)).toEqual({
        start: 0,
        stages: [6, 1, 13],
      })
    })

    it('Moving project due date before second to last stage due date also moves second to last stage due date', () => {
      expect(strategy.adjustProject(stages, 'due', -3)).toEqual({
        start: 0,
        stages: [5, 1, 1],
      })
    })

    it('Moving project due date before project start moves everything', () => {
      expect(strategy.adjustProject(stages, 'due', -10)).toEqual({
        start: -3,
        stages: [1, 1, 1],
      })
    })
  })

  describe('Adjust stage', () => {
    const stages: StrategyStage[] = [
      { start: 0, due: 5, duration: 6 },
      { start: 5, due: 7, duration: 3 },
      { start: 7, due: 10, duration: 4 },
    ]

    describe('Adjusts first stage', () => {
      it('Moves first stage due date earlier', () => {
        expect(strategy.adjustStage(stages, 0, -5)).toEqual({
          start: 0,
          stages: [1, 8, 4],
        })
      })

      it('Moves first stage due date later', () => {
        expect(strategy.adjustStage(stages, 0, 2)).toEqual({
          start: 0,
          stages: [8, 1, 4],
        })
      })

      it('Moving first stage due date before project start date shifts project start', () => {
        expect(strategy.adjustStage(stages, 0, -6)).toEqual({
          start: -1,
          stages: [1, 9, 4],
        })
      })

      it('Moving first stage due date after next stage due date shifts next stage start', () => {
        expect(strategy.adjustStage(stages, 0, 3)).toEqual({
          start: 0,
          stages: [9, 1, 3],
        })
      })
    })

    describe('Adjusts middle stage', () => {
      it('Moves stage due date earlier', () => {
        expect(strategy.adjustStage(stages, 1, -2)).toEqual({
          start: 0,
          stages: [6, 1, 6],
        })
      })

      it('Moves stage due date later', () => {
        expect(strategy.adjustStage(stages, 1, 2)).toEqual({
          start: 0,
          stages: [6, 5, 2],
        })
      })

      it('Moving stage due date before previous stage due date shifts previous stage due date', () => {
        expect(strategy.adjustStage(stages, 1, -3)).toEqual({
          start: 0,
          stages: [5, 1, 7],
        })
      })

      it('Moving stage due date after next stage due date shifts next stage due date', () => {
        expect(strategy.adjustStage(stages, 1, 4)).toEqual({
          start: 0,
          stages: [6, 7, 1],
        })
      })
    })

    describe('Adjusts last stage', () => {
      it('Moves last stage due date earlier', () => {
        expect(strategy.adjustStage(stages, 2, -3)).toEqual({
          start: 0,
          stages: [6, 3, 1],
        })
      })

      it('Moves last stage due date later', () => {
        expect(strategy.adjustStage(stages, 2, 3)).toEqual({
          start: 0,
          stages: [6, 3, 7],
        })
      })

      it('Moving last stage due date before previous stage due date shifts previous stage due date', () => {
        expect(strategy.adjustStage(stages, 2, -4)).toEqual({
          start: 0,
          stages: [6, 2, 1],
        })
      })
    })
  })
})
