import { expectResults } from './utils'

import { DayMode, StageAdjuster } from '../stage-adjuster'
import { StrategyType } from '../strategies/strategy.types'

describe('Stage Adjuster', () => {
  describe('Distribute', () => {
    // This is a repro from https://dev-app.usemotion.com/web/pm/workspaces/u7_D-Iy8jdmn3IAvEkdfR?task=ctDWGsVxkJDWOhLEnUc_e
    test('Moving start date up with all dates specified', () => {
      const results = new StageAdjuster(
        {
          startDate: new Date('2024-09-09'), // Monday
          dueDate: new Date('2024-09-20'), // Friday
          activeStageDefinitionId: 'one',
          stages: [
            // Duration: 1
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-09-09'), // Monday
            },
            // Duration: 1
            {
              stageDefinitionId: 'two',
              dueDate: new Date('2024-09-09'), // Monday
            },
            // Duration: 8
            {
              stageDefinitionId: 'three',
              dueDate: new Date('2024-09-18'), // Wednesday
            },
            // Duration: 2
            {
              stageDefinitionId: 'four',
              dueDate: new Date('2024-09-19'), // Thursday
            },
            // Duration: 1
            {
              stageDefinitionId: 'five',
              dueDate: new Date('2024-09-19'), // Thursday
            },
            // Duration: 2
            {
              stageDefinitionId: 'six',
              dueDate: new Date('2024-09-20'), // Friday
            },
          ],
        },
        { dayMode: DayMode.BUSINESS }
      )
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'start',
          value: new Date('2024-09-01'), // Adds 5 business days, but lands on a sunday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-09-02'), // Monday
        dueDate: new Date('2024-09-20'), // Friday
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 1,
            dueDate: new Date('2024-09-02'), // Monday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'two',
            duration: 1,
            dueDate: new Date('2024-09-02'), // Monday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 11,
            dueDate: new Date('2024-09-16'), // Monday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'four',
            duration: 3,
            dueDate: new Date('2024-09-18'), // Wednesday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'five',
            duration: 1,
            dueDate: new Date('2024-09-18'), // Wednesday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'six',
            duration: 3,
            dueDate: new Date('2024-09-20'), // Friday
            dueDateModified: false,
          },
        ],
      })
    })

    test('handles scaling due date up with fully specified dates', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-09'), // Tuesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            // Duration: 2 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-02'), // Tuesday
          },
          {
            // Duration: 3 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-04'), // Thursday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-09'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          value: new Date('2024-01-16'), // Adding 5 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'two',
            duration: 5,
            dueDate: new Date('2024-01-09'), // Tuesday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 6,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date down with fully specified dates', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            // Duration: 3 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            // Duration: 7 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          value: new Date('2024-01-09'), // Removing 5 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-09'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 2,
            dueDate: new Date('2024-01-02'), // Tuesday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'two',
            duration: 3,
            dueDate: new Date('2024-01-04'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 4,
            dueDate: new Date('2024-01-09'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date up with partial scalable stages', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-09'), // Tuesday
        activeStageDefinitionId: 'two',
        stages: [
          {
            // Duration: 2 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-02'), // Tuesday
          },
          {
            // Duration: 3 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-04'), // Thursday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-09'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          value: new Date('2024-01-16'), // Adding 5 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 2,
            dueDate: new Date('2024-01-02'), // Tuesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 5,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 7,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date down with partial scalable stages', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'two',
        stages: [
          {
            // Duration: 3 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            // Duration: 7 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          value: new Date('2024-01-09'), // Removing 5 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-09'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 2,
            dueDate: new Date('2024-01-04'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 4,
            dueDate: new Date('2024-01-09'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date down past scalable stages', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'three',
        stages: [
          {
            // Duration: 3 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            // Duration: 7 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          value: new Date('2024-01-05'), // Removing 8 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-05'), // Friday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 3,
            dueDate: new Date('2024-01-05'), // Friday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 1,
            dueDate: new Date('2024-01-05'), // Friday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date down onto a weekend', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'two',
        stages: [
          {
            // Duration: 3 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            // Duration: 7 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          // Removing 8 business days, but fall on a saturday.
          value: new Date('2024-01-06'), // Saturday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-08'), // The next business day
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 2,
            dueDate: new Date('2024-01-04'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 3,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: true,
          },
        ],
      })
    })

    // Test case: https://app.graphite.dev/github/pr/usemotion/motion/8879/feat-flows-Replace-Stage-Adjuster-with-refactored-version?utm_source=gt-slack-notif&pmgid=965170#discussion-IC_kwDOL_0cvs6Ue2xM
    test('handles scaling due date down a week', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-11-21'), // Thursday
        dueDate: new Date('2024-11-29'),
        stages: [
          {
            // Duration: 1
            stageDefinitionId: 'one',
            dueDate: new Date('2024-11-21'),
          },
          {
            // Duration: 2
            stageDefinitionId: 'two',
            dueDate: new Date('2024-11-22'),
          },
          {
            // Duration: 5
            stageDefinitionId: 'three',
            dueDate: new Date('2024-11-28'),
          },
          {
            // Duration: 2
            stageDefinitionId: 'four',
            dueDate: new Date('2024-11-29'),
          },
          {
            // Duration: 1
            stageDefinitionId: 'five',
            dueDate: new Date('2024-11-29'),
            canceled: true,
          },
          {
            // Duration: 1
            stageDefinitionId: 'six',
            dueDate: new Date('2024-11-29'),
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          // Removing 5 business days
          value: new Date('2024-11-22'), // Friday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-11-21'), // Thursday
        startDateModified: false,
        dueDate: new Date('2024-11-22'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 1,
            dueDate: new Date('2024-11-21'), // Thursday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 1,
            dueDate: new Date('2024-11-21'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'three',
            duration: 2,
            dueDate: new Date('2024-11-22'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'four',
            duration: 1,
            dueDate: new Date('2024-11-22'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'five',
            duration: 1,
            dueDate: new Date('2024-11-22'), // Thursday
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'six',
            duration: 1,
            dueDate: new Date('2024-11-22'), // Thursday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date up with one scalable stage', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-09'), // Tuesday
        activeStageDefinitionId: 'three',
        stages: [
          {
            // Duration: 2 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-02'), // Tuesday
          },
          {
            // Duration: 3 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-04'), // Thursday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-09'), // Monday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          // Add 5 business days
          value: new Date('2024-01-16'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            // Past stage -> +0
            stageDefinitionId: 'one',
            duration: 2,
            dueDate: new Date('2024-01-02'), // Tuesday
            dueDateModified: false,
          },
          {
            // Past stage -> +0
            stageDefinitionId: 'two',
            duration: 3,
            dueDate: new Date('2024-01-04'), // Thursday
            dueDateModified: false,
          },
          {
            // Only active stage -> +5
            stageDefinitionId: 'three',
            duration: 9,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling due date down with one scalable stage', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'three',
        stages: [
          {
            // Duration: 3 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            // Duration: 7 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          value: new Date('2024-01-08'), // Removing 6 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-08'), // Monday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 4,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'three',
            duration: 1,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles scaling start date up with resolved stages', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-09-09'), // Monday
        dueDate: new Date('2024-09-20'), //  Friday
        activeStageDefinitionId: 'two',
        stages: [
          {
            // Duration: 1 (resolved)
            stageDefinitionId: 'one',
            dueDate: new Date('2024-09-09'), // Monday
            canceled: true,
          },
          {
            // Duration 1
            stageDefinitionId: 'two',
            dueDate: new Date('2024-09-09'), // Monday
          },
          {
            // Duration 8
            stageDefinitionId: 'three',
            dueDate: new Date('2024-09-18'), // Wednesday
          },
          {
            // Duration 2 (resolved)
            stageDefinitionId: 'four',
            dueDate: new Date('2024-09-19'), // Thursday
            completed: true,
          },
          {
            // Duration 1
            stageDefinitionId: 'five',
            dueDate: new Date('2024-09-19'), // Thursday
          },
          {
            // Duration 2
            stageDefinitionId: 'six',
            dueDate: new Date('2024-09-20'), // Friday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'start',
          value: new Date('2024-09-01'), // Adds 5 business days
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-09-02'), // Monday
        startDateModified: true,
        dueDate: new Date('2024-09-20'), // Friday
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 1,
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'two',
          },
          {
            stageDefinitionId: 'three',
          },
          {
            stageDefinitionId: 'four',
            duration: 2,
            dueDateModified: true,
          },
          {
            stageDefinitionId: 'five',
          },
          {
            stageDefinitionId: 'six',
          },
        ],
      })
    })

    test('handles due date not matching stage due date', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        // Due date mismatches - will be ignored.
        dueDate: new Date('2024-01-02'), // Tuesday
        activeStageDefinitionId: 'three',
        stages: [
          {
            // Duration: 2 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-02'), // Tuesday
          },
          {
            // Duration: 3 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-04'), // Thursday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-09'), // Monday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          // Add 5 business days
          value: new Date('2024-01-16'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            // Past stage -> +0
            stageDefinitionId: 'one',
            duration: 2,
            dueDate: new Date('2024-01-02'), // Tuesday
            dueDateModified: false,
          },
          {
            // Past stage -> +0
            stageDefinitionId: 'two',
            duration: 3,
            dueDate: new Date('2024-01-04'), // Thursday
            dueDateModified: false,
          },
          {
            // Only active stage -> +5
            stageDefinitionId: 'three',
            duration: 9,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('handles start date after first stage due date', () => {
      const results = new StageAdjuster({
        // Start date overlaps with first stage - will be treated as
        // 2024-01-02
        startDate: new Date('2024-01-05'), // Friday
        dueDate: new Date('2024-01-09'), // Tuesday
        activeStageDefinitionId: 'three',
        stages: [
          {
            // Duration: 1 business days
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-02'), // Tuesday
          },
          {
            // Duration: 3 business days
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-04'), // Thursday
          },
          {
            // Duration: 4 business days
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-09'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.DISTRIBUTE,
          target: 'due',
          // Add 5 business days
          value: new Date('2024-01-16'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-02'), // Tuesday
        startDateModified: true,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            // Past stage -> +0
            stageDefinitionId: 'one',
            duration: 1,
            dueDate: new Date('2024-01-02'), // Tuesday
            dueDateModified: false,
          },
          {
            // Past stage -> +0
            stageDefinitionId: 'two',
            duration: 3,
            dueDate: new Date('2024-01-04'), // Thursday
            dueDateModified: false,
          },
          {
            // Only active stage -> +4
            stageDefinitionId: 'three',
            duration: 9,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })
  })

  describe('Absorb', () => {
    test('first stage absorbs start date adjustment moving into the past', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'start',
          value: new Date('2023-12-25'), // Monday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2023-12-25'), // Monday
        startDateModified: true,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 8,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 4,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'three',
            duration: 7,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: false,
          },
        ],
      })
    })

    test('last stage absorbs due date adjustment moving into the future', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-25'), // Thursday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-25'), // Thursday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 4,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'three',
            duration: 14,
            dueDate: new Date('2024-01-25'), // Thursday
            dueDateModified: true,
          },
        ],
      })
    })

    test('first stage absorbs start date adjustment moving slightly forward within duration', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'start',
          value: new Date('2024-01-03'), // Wednesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-03'), // Wednesday
        startDateModified: true,
        dueDate: new Date('2024-01-16'), // Tuesday
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 1,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 4,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'three',
            duration: 7,
            dueDate: new Date('2024-01-16'), // Tuesday
            dueDateModified: false,
          },
        ],
      })
    })

    test('last stage absorbs due date adjustment moving slightly backward within duration', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-16'), // Tuesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
          {
            stageDefinitionId: 'two',
            dueDate: new Date('2024-01-08'), // Monday
          },
          {
            stageDefinitionId: 'three',
            dueDate: new Date('2024-01-16'), // Tuesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-08'), // Monday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-08'), // Thursday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 3,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'two',
            duration: 4,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: false,
          },
          {
            stageDefinitionId: 'three',
            duration: 1,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: true,
          },
        ],
      })
    })

    test('single stage absorbs start date adjustment moving into the past', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-03'), // Wednesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'start',
          value: new Date('2023-12-25'), // Monday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2023-12-25'), // Monday
        startDateModified: true,
        dueDate: new Date('2024-01-03'), // Wednesday
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 8,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
        ],
      })
    })

    test('single stage absorbs start date adjustment moving into the future', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-03'), // Wednesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'start',
          value: new Date('2024-01-02'), // Tueday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-02'), // Tuesday
        startDateModified: true,
        dueDate: new Date('2024-01-03'), // Wednesday
        dueDateModified: false,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 2,
            dueDate: new Date('2024-01-03'), // Wednesday
            dueDateModified: false,
          },
        ],
      })
    })

    test('single stage absorbs due date adjustment moving into the future', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-03'), // Wednesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-05'), // Friday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-05'), // Friday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 5,
            dueDate: new Date('2024-01-05'), // Friday
            dueDateModified: true,
          },
        ],
      })
    })

    test('single stage absorbs due date adjustment moving onto a weekend', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-03'), // Wednesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-07'), // Sunday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-08'), // Monday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 6,
            dueDate: new Date('2024-01-08'), // Monday
            dueDateModified: true,
          },
        ],
      })
    })

    test('single stage absorbs due date adjustment moving from a weekend to a weekend', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-07'), // Sunday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-07'), // Sunday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-13'), // Saturday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-15'), // Monday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 11,
            dueDate: new Date('2024-01-15'), // Monday
            dueDateModified: true,
          },
        ],
      })
    })

    test('single stage absorbs due date adjustment moving to a weekend when start date is also a weekend', () => {
      const results = new StageAdjuster({
        startDate: new Date('2023-12-31'), // Sunday
        dueDate: new Date('2024-01-03'), // Wednesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-13'), // Saturday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: true,
        dueDate: new Date('2024-01-15'), // Monday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 11,
            dueDate: new Date('2024-01-15'), // Monday
            dueDateModified: true,
          },
        ],
      })
    })

    test('single stage absorbs due date adjustment moving into the past', () => {
      const results = new StageAdjuster({
        startDate: new Date('2024-01-01'), // Monday
        dueDate: new Date('2024-01-03'), // Wednesday
        activeStageDefinitionId: 'one',
        stages: [
          {
            stageDefinitionId: 'one',
            dueDate: new Date('2024-01-03'), // Wednesday
          },
        ],
      })
        .prepareProjectAdjustment({
          strategy: StrategyType.ABSORB,
          target: 'due',
          value: new Date('2024-01-02'), // Tuesday
        })
        .calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-02'), // Tuesday
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'one',
            duration: 2,
            dueDate: new Date('2024-01-02'), // Tuesday
            dueDateModified: true,
          },
        ],
      })
    })

    test('throws error if start date moves forward more than first stage can absorb', () => {
      expect(() => {
        new StageAdjuster({
          startDate: new Date('2024-01-01'), // Monday
          dueDate: new Date('2024-01-03'), // Wednesday
          activeStageDefinitionId: 'one',
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-03'), // Wednesday
            },
          ],
        })
          .prepareProjectAdjustment({
            strategy: StrategyType.ABSORB,
            target: 'start',
            value: new Date('2024-01-04'), // Thursday
          })
          .calculateResult()
      }).toThrow()
    })

    test('throws error if due date date moves backwards more than first stage can absorb', () => {
      expect(() => {
        new StageAdjuster({
          startDate: new Date('2024-01-01'), // Monday
          dueDate: new Date('2024-01-03'), // Wednesday
          activeStageDefinitionId: 'one',
          stages: [
            {
              stageDefinitionId: 'one',
              dueDate: new Date('2024-01-03'), // Wednesday
            },
          ],
        })
          .prepareProjectAdjustment({
            strategy: StrategyType.ABSORB,
            target: 'due',
            value: new Date('2023-12-29'), // Friday
          })
          .calculateResult()
      }).toThrow()
    })
  })
})
