import { StrategyStage } from '../../strategy.types'
import { AbsorbStrategy } from '../absorb.strategy'

describe('Absorb Strategy', () => {
  const strategy = new AbsorbStrategy()

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

    it('Throws an error on moving project start after first stage due date', () => {
      expect(() => {
        strategy.adjustProject(stages, 'start', 6)
      }).toThrow()
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

    it('Throws an error on moving project due before second to last stage due date', () => {
      expect(() => {
        strategy.adjustProject(stages, 'due', -3)
      }).toThrow()
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

      it('Throws an error when moving first stage due date before project start date', () => {
        expect(() => {
          strategy.adjustStage(stages, 0, -6)
        }).toThrow()
      })

      it('Throws an error when moving first stage due date after next stage due date', () => {
        expect(() => {
          strategy.adjustStage(stages, 0, 3)
        }).toThrow()
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

      it('Moves last stage later', () => {
        expect(strategy.adjustStage(stages, 2, 3)).toEqual({
          start: 0,
          stages: [6, 3, 7],
        })
      })

      it('Throws an error when moving stage due date before previous stage due date', () => {
        expect(() => {
          strategy.adjustStage(stages, 1, -3)
        }).toThrow()
      })

      it('Throws an error when moving stage due date after next stage due date', () => {
        expect(() => {
          strategy.adjustStage(stages, 1, 4)
        }).toThrow()
      })
    })
  })

  describe('Get available duration', () => {
    const generateStages = (
      params: {
        duration: number
        state: 'canceled' | 'completed' | 'in-progress'
      }[]
    ) => {
      const stages: StrategyStage[] = []
      let cursor = 0
      for (const { duration, state } of params) {
        stages.push({
          start: cursor,
          due: cursor + duration - 1,
          duration: duration,
          canceled: state === 'canceled',
          completed: state === 'completed',
        })
      }
      return stages
    }

    describe('After', () => {
      it('Returns available duration after', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            1,
            1
          )
        ).toEqual(4)
      })

      it('Returns infinity after last stage', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            2,
            1
          )
        ).toEqual(Infinity)
      })

      it('Returns available duration after first stage', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            0,
            1
          )
        ).toEqual(4)
      })

      it('Returns available duration after start', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            -1,
            1
          )
        ).toEqual(4)
      })

      it('Returns available duration with canceled stage', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'canceled' },
              { duration: 5, state: 'in-progress' },
            ]),
            0,
            1
          )
        ).toEqual(8)
      })

      it('Returns available duration with canceled stage until end', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'canceled' },
              { duration: 5, state: 'canceled' },
            ]),
            0,
            1
          )
        ).toEqual(8)
      })
    })

    describe('Before', () => {
      it('Returns available duration before start', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            -1,
            -1
          )
        ).toEqual(Infinity)
      })

      it('Returns available duration before first stage', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            0,
            -1
          )
        ).toEqual(4)
      })

      it('Returns available duration before last stage', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'in-progress' },
            ]),
            2,
            -1
          )
        ).toEqual(4)
      })

      it('Returns available duration before last stage with canceled stages', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'in-progress' },
              { duration: 5, state: 'canceled' },
              { duration: 5, state: 'in-progress' },
            ]),
            2,
            -1
          )
        ).toEqual(8)
      })

      it('Returns available duration before last stage with multiple canceled stages', () => {
        expect(
          strategy.getAvailableDuration(
            generateStages([
              { duration: 5, state: 'canceled' },
              { duration: 5, state: 'canceled' },
              { duration: 5, state: 'in-progress' },
            ]),
            2,
            -1
          )
        ).toEqual(12)
      })
    })
  })
})
