import tk from 'timekeeper'

import { expectResults } from './utils'

import { DayMode, LockMode, StageAdjuster } from '../stage-adjuster'

tk.freeze(new Date('2024-01-01'))

describe('Stage Adjuster (Removing)', () => {
  test('Removing a stage shifts later stages up', () => {
    const results = new StageAdjuster(
      {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        stages: [
          {
            stageDefinitionId: 'one',
            // Duration: 5
            dueDate: new Date('2024-01-05'),
          },
          {
            stageDefinitionId: 'two',
            // Duration: 7
            dueDate: new Date('2024-01-11'),
          },
          {
            stageDefinitionId: 'three',
            // Duration: 5
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
      .prepareStageRemove({
        stageDefinitionId: 'two',
      })
      .calculateResult()

    expectResults(results, {
      startDate: new Date('2024-01-01'),
      startDateModified: false,
      dueDate: new Date('2024-01-09'),
      dueDateModified: true,
      stages: [
        {
          stageDefinitionId: 'one',
          duration: 5,
          dueDate: new Date('2024-01-05'),
          dueDateModified: false,
        },
        {
          stageDefinitionId: 'three',
          duration: 5,
          dueDate: new Date('2024-01-09'),
          dueDateModified: true,
        },
        {
          stageDefinitionId: 'two',
          status: 'delete',
        },
      ],
    })
  })
})
