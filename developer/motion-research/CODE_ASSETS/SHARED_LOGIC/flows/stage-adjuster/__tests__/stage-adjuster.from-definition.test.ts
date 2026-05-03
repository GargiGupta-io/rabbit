import tk from 'timekeeper'

import { expectResults } from './utils'

import { RelativeIntervalUnit } from '../../definitions'
import { DayMode, LockMode, StageAdjuster } from '../stage-adjuster'

tk.freeze(new Date('2024-01-01'))

describe('Stage Adjuster (From Definition)', () => {
  describe('Calendar Days', () => {
    test('Creating from definition with calendar days creates correct stage dates', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'stage-1',
              duration: { unit: 'DAYS', value: 5 },
            },
            {
              stageDefinitionId: 'stage-2',
              duration: { unit: 'DAYS', value: 3 },
            },
            {
              stageDefinitionId: 'stage-3',
              duration: { unit: 'DAYS', value: 7 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
          lockConfig: {
            mode: LockMode.FREE,
            canceled: false,
            completed: false,
          },
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-16'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'stage-1',
            startDate: new Date('2024-01-01'),
            startDateModified: false,
            dueDate: new Date('2024-01-06'),
            dueDateModified: false,
            duration: 6,
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
          {
            stageDefinitionId: 'stage-2',
            startDate: new Date('2024-01-06'),
            startDateModified: false,
            dueDate: new Date('2024-01-09'),
            dueDateModified: false,
            duration: 4,
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
          {
            stageDefinitionId: 'stage-3',
            startDate: new Date('2024-01-09'),
            startDateModified: false,
            dueDate: new Date('2024-01-16'),
            dueDateModified: false,
            duration: 8,
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
        ],
      })
    })

    test('Creating from definition with single stage', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'single-stage',
              duration: { unit: 'DAYS', value: 10 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-11'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'single-stage',
            startDate: new Date('2024-01-01'),
            startDateModified: false,
            dueDate: new Date('2024-01-11'),
            dueDateModified: false,
            duration: 11,
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
        ],
      })
    })
  })

  describe('Business Days', () => {
    test('Creating from definition with business days creates correct stage dates', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'), // Monday
          stages: [
            {
              stageDefinitionId: 'stage-1',
              duration: { unit: 'BUSINESS_DAYS', value: 5 }, // 5 business days
            },
            {
              stageDefinitionId: 'stage-2',
              duration: { unit: 'BUSINESS_DAYS', value: 3 }, // 3 business days
            },
            {
              stageDefinitionId: 'stage-3',
              duration: { unit: 'BUSINESS_DAYS', value: 2 }, // 2 business days
            },
          ],
        },
        {
          dayMode: DayMode.BUSINESS,
          lockConfig: {
            mode: LockMode.FREE,
            canceled: false,
            completed: false,
          },
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'), // Monday
        startDateModified: false,
        dueDate: new Date('2024-01-15'), // Monday (10 business days from Monday)
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'stage-1',
            startDate: new Date('2024-01-01'), // Monday
            startDateModified: false,
            dueDate: new Date('2024-01-08'), // Monday (5 business days)
            dueDateModified: false,
            duration: 6, // Monday-Monday in business days (inclusive)
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
          {
            stageDefinitionId: 'stage-2',
            startDate: new Date('2024-01-08'), // Monday
            startDateModified: false,
            dueDate: new Date('2024-01-11'), // Thursday (3 business days)
            dueDateModified: false,
            duration: 4,
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
          {
            stageDefinitionId: 'stage-3',
            startDate: new Date('2024-01-11'), // Thursday
            startDateModified: false,
            dueDate: new Date('2024-01-15'), // Monday (2 business days)
            dueDateModified: false,
            duration: 3,
            modified: false,
            active: true,
            canceled: false,
            completed: false,
          },
        ],
      })
    })

    test('Creating from definition starting on weekend gets adjusted to business days', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-06'), // Saturday
          stages: [
            {
              stageDefinitionId: 'stage-1',
              duration: { unit: 'BUSINESS_DAYS', value: 1 },
            },
          ],
        },
        {
          dayMode: DayMode.BUSINESS,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-06'), // Saturday
        startDateModified: false,
        dueDate: new Date('2024-01-09'), // Tuesday (next business day)
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'stage-1',
            startDate: new Date('2024-01-06'), // Saturday
            dueDate: new Date('2024-01-09'), // Tuesday
            duration: 2, // Saturday to Tuesday (inclusive, business days)
            active: true,
          },
        ],
      })
    })
  })

  describe('Weeks and Months', () => {
    test('Creating from definition with weeks duration', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'), // Monday
          stages: [
            {
              stageDefinitionId: 'stage-1',
              duration: { unit: 'WEEKS', value: 2 },
            },
            {
              stageDefinitionId: 'stage-2',
              duration: { unit: 'WEEKS', value: 1 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-22'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'stage-1',
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-15'), // 2 weeks later
            duration: 15,
            active: true,
          },
          {
            stageDefinitionId: 'stage-2',
            startDate: new Date('2024-01-15'),
            dueDate: new Date('2024-01-22'), // 1 week later
            duration: 8,
            active: true,
          },
        ],
      })
    })

    test('Creating from definition with months duration', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'stage-1',
              duration: { unit: 'MONTHS', value: 1 },
            },
            {
              stageDefinitionId: 'stage-2',
              duration: { unit: 'MONTHS', value: 2 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-04-01'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'stage-1',
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-02-01'), // 1 month later
            duration: 32, // January has 31 days
            active: true,
          },
          {
            stageDefinitionId: 'stage-2',
            startDate: new Date('2024-02-01'),
            dueDate: new Date('2024-04-01'), // 2 months later
            duration: 61, // February (29 days in 2024) + March (31 days)
            active: true,
          },
        ],
      })
    })
  })

  describe('Mixed Duration Units', () => {
    test('Creating from definition with mixed duration units', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'), // Monday
          stages: [
            {
              stageDefinitionId: 'days-stage',
              duration: { unit: 'DAYS', value: 7 },
            },
            {
              stageDefinitionId: 'weeks-stage',
              duration: { unit: 'WEEKS', value: 1 },
            },
            {
              stageDefinitionId: 'business-days-stage',
              duration: { unit: 'BUSINESS_DAYS', value: 5 },
            },
            {
              stageDefinitionId: 'months-stage',
              duration: { unit: 'MONTHS', value: 1 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        // Expected calculation:
        // Start: 2024-01-01
        // After 7 days: 2024-01-08
        // After 1 week: 2024-01-15
        // After 5 business days: 2024-01-22 (Monday -> Monday)
        // After 1 month: 2024-02-22
        dueDate: new Date('2024-02-22'),
        dueDateModified: true,
        stages: [
          {
            stageDefinitionId: 'days-stage',
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-08'),
            duration: 8,
            active: true,
          },
          {
            stageDefinitionId: 'weeks-stage',
            startDate: new Date('2024-01-08'),
            dueDate: new Date('2024-01-15'),
            duration: 8,
            active: true,
          },
          {
            stageDefinitionId: 'business-days-stage',
            startDate: new Date('2024-01-15'),
            dueDate: new Date('2024-01-22'),
            duration: 8,
            active: true,
          },
          {
            stageDefinitionId: 'months-stage',
            startDate: new Date('2024-01-22'),
            dueDate: new Date('2024-02-22'),
            duration: 32,
            active: true,
          },
        ],
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('Creating from definition with empty stages array', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'),
          stages: [],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        startDateModified: false,
        dueDate: new Date('2024-01-01'),
        dueDateModified: true,
        stages: [],
      })
    })

    test('Creating from definition with zero duration throws error', () => {
      expect(() => {
        StageAdjuster.fromDefinition({
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'zero-stage',
              duration: { unit: 'DAYS', value: 0 },
            },
          ],
        })
      }).toThrow()
    })

    test('Creating from definition with negative duration throws error', () => {
      expect(() => {
        StageAdjuster.fromDefinition({
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'negative-stage',
              duration: { unit: 'DAYS', value: -5 },
            },
          ],
        })
      }).toThrow()
    })

    test('Creating from definition with invalid duration unit throws error', () => {
      expect(() => {
        StageAdjuster.fromDefinition({
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'invalid-stage',
              duration: {
                unit: 'INVALID_UNIT' as RelativeIntervalUnit,
                value: 5,
              },
            },
          ],
        })
      }).toThrow('Unknown duration unit')
    })

    test('Creating from definition with start date containing time throws error', () => {
      expect(() => {
        StageAdjuster.fromDefinition({
          startDate: new Date('2024-01-01T10:30:00.000Z'),
          stages: [
            {
              stageDefinitionId: 'stage-1',
              duration: { unit: 'DAYS', value: 5 },
            },
          ],
        })
      }).toThrow('Attempted to parse date that was not date-only')
    })
  })

  describe('Business Logic Validation', () => {
    test('Duration is calculated correctly as inclusive dates', () => {
      // This test verifies that if a stage has duration 1, it spans from
      // start date to start date (same day), giving it a duration of 1
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'one-day-stage',
              duration: { unit: 'DAYS', value: 1 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-02'), // start + 1 day
        stages: [
          {
            stageDefinitionId: 'one-day-stage',
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-02'),
            duration: 2, // Inclusive: Jan 1 and Jan 2
            active: true,
          },
        ],
      })
    })

    test('Multiple stages with same duration unit maintain proper sequencing', () => {
      const results = StageAdjuster.fromDefinition(
        {
          startDate: new Date('2024-01-01'),
          stages: [
            {
              stageDefinitionId: 'stage-a',
              duration: { unit: 'DAYS', value: 2 },
            },
            {
              stageDefinitionId: 'stage-b',
              duration: { unit: 'DAYS', value: 2 },
            },
            {
              stageDefinitionId: 'stage-c',
              duration: { unit: 'DAYS', value: 2 },
            },
          ],
        },
        {
          dayMode: DayMode.CALENDAR,
        }
      ).calculateResult()

      expectResults(results, {
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-07'),
        stages: [
          {
            stageDefinitionId: 'stage-a',
            startDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-03'), // 2 days: 1st, 2nd, due on 3rd
            duration: 3,
          },
          {
            stageDefinitionId: 'stage-b',
            startDate: new Date('2024-01-03'),
            dueDate: new Date('2024-01-05'), // 2 days: 3rd, 4th, due on 5th
            duration: 3,
          },
          {
            stageDefinitionId: 'stage-c',
            startDate: new Date('2024-01-05'),
            dueDate: new Date('2024-01-07'), // 2 days: 5th, 6th, due on 7th
            duration: 3,
          },
        ],
      })
    })
  })
})
