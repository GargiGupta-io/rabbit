import { DateTime } from 'luxon'

import {
  calculateProjectStageDueDates,
  calculateProjectStageDueDatesFromIntervals,
} from '../utils'

describe('calculateProjectStageDueDates', () => {
  const stages = [
    { id: 'stage1', duration: { unit: 'DAYS' as const, value: 7 } },
    { id: 'stage2', duration: { unit: 'DAYS' as const, value: 14 } },
    { id: 'stage3', duration: { unit: 'DAYS' as const, value: 21 } },
  ]

  it('should calculate stage due dates correctly when no project deadline is provided', () => {
    const projectStartDate = DateTime.fromISO('2023-05-01')
    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      undefined
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2023-05-05' },
      { stageDefinitionId: 'stage2', dueDate: '2023-05-19' },
      { stageDefinitionId: 'stage3', dueDate: '2023-06-09' },
    ])
  })

  it('should adjust final stage due date when project deadline is later than calculated end date', () => {
    const projectStartDate = DateTime.fromISO('2023-05-01')
    const projectDeadline = DateTime.fromISO('2023-06-30')
    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      projectDeadline
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2023-05-05' },
      { stageDefinitionId: 'stage2', dueDate: '2023-05-19' },
      { stageDefinitionId: 'stage3', dueDate: '2023-06-30' },
    ])
  })

  it('should compress stage due dates when project deadline is earlier than calculated end date', () => {
    const projectStartDate = DateTime.fromISO('2023-05-01')
    const projectDeadline = DateTime.fromISO('2023-05-31')
    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      projectDeadline
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2023-05-05' },
      { stageDefinitionId: 'stage2', dueDate: '2023-05-17' },
      { stageDefinitionId: 'stage3', dueDate: '2023-05-31' },
    ])
  })

  it('should handle short deadlines', () => {
    const stages = [
      {
        id: 'stage1',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage2',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage3',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
    ]
    const projectStartDate = DateTime.fromISO('2024-12-19')
    const projectDeadline = DateTime.fromISO('2024-12-20')

    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      projectDeadline
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2024-12-19' },
      { stageDefinitionId: 'stage2', dueDate: '2024-12-19' },
      { stageDefinitionId: 'stage3', dueDate: '2024-12-20' },
    ])
  })

  it('should handle stage due dates collisions when project deadline is significantly earlier than calculated end date', () => {
    // copied from real example
    const projectStartDate = DateTime.fromISO('2025-01-07')
    const projectDeadline = DateTime.fromISO('2025-02-07')
    const stages = [
      {
        id: 'stage1',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage2',
        duration: { unit: 'DAYS' as const, value: 3 },
      },
      {
        id: 'stage3',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage4',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage5',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage6',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage7',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage8',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: 'stage9',
        duration: { unit: 'DAYS' as const, value: 2 },
      },
    ]
    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      projectDeadline
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2025-01-10' },
      { stageDefinitionId: 'stage2', dueDate: '2025-01-13' },
      { stageDefinitionId: 'stage3', dueDate: '2025-01-17' },
      { stageDefinitionId: 'stage4', dueDate: '2025-01-23' },
      { stageDefinitionId: 'stage5', dueDate: '2025-01-29' },
      { stageDefinitionId: 'stage6', dueDate: '2025-02-04' },
      { stageDefinitionId: 'stage7', dueDate: '2025-02-07' },
      { stageDefinitionId: 'stage8', dueDate: '2025-02-07' },
      { stageDefinitionId: 'stage9', dueDate: '2025-02-07' },
    ])
  })

  it('should handle weekend adjustments correctly', () => {
    const projectStartDate = DateTime.fromISO('2023-05-01') // Monday
    const stages = [
      { id: 'stage1', duration: { unit: 'DAYS' as const, value: 5 } }, // Friday
      { id: 'stage2', duration: { unit: 'DAYS' as const, value: 3 } }, // Wednesday
      { id: 'stage3', duration: { unit: 'DAYS' as const, value: 5 } }, // Next Wednesday
    ]
    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      undefined
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2023-05-05' },
      { stageDefinitionId: 'stage2', dueDate: '2023-05-10' },
      { stageDefinitionId: 'stage3', dueDate: '2023-05-17' },
    ])
  })

  it('should handle for longer stages', () => {
    const projectStartDate = DateTime.fromISO('2023-05-01') // Monday
    const stages = [
      { id: 'stage1', duration: { unit: 'DAYS' as const, value: 7 } }, // Friday
      { id: 'stage2', duration: { unit: 'DAYS' as const, value: 23 } }, // 3 weeks, 2 days - Tuesday
      { id: 'stage3', duration: { unit: 'DAYS' as const, value: 5 } }, // Next Tuesday
    ]
    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      undefined
    )

    expect(result).toEqual([
      { stageDefinitionId: 'stage1', dueDate: '2023-05-05' },
      { stageDefinitionId: 'stage2', dueDate: '2023-05-30' },
      { stageDefinitionId: 'stage3', dueDate: '2023-06-06' },
    ])
  })

  it('should handle for longer stages 2', () => {
    const stages = [
      {
        id: '248d7522-43a3-48a3-9754-b64f4ed57bd6',
        duration: { unit: 'DAYS' as const, value: 5 },
      },
      {
        id: '88f3a791-d880-417d-b4a8-3f4d1d650291',
        duration: { unit: 'DAYS' as const, value: 11 },
      },
      {
        id: '158358a6-1147-49ff-84c0-01e0a7c25083',
        duration: { unit: 'DAYS' as const, value: 32 },
      },
      {
        id: 'f2f85606-d2de-4876-a3d9-9ec9baee8b2e',
        duration: { unit: 'DAYS' as const, value: 15 },
      },
      {
        id: '1a465577-80fc-43a5-b20c-22cc4a34bb5d',
        duration: { unit: 'DAYS' as const, value: 7 },
      },
      {
        id: '9745e697-9829-47cc-8b19-daf9b7d147b3',
        duration: { unit: 'DAYS' as const, value: 3 },
      },
    ]

    // Saturday
    const projectStartDate = DateTime.fromISO('2024-09-07')
    // Monday
    const projectDeadline = DateTime.fromISO('2024-09-30')

    const result = calculateProjectStageDueDates(
      stages,
      projectStartDate,
      projectDeadline
    )

    expect(result).toEqual([
      {
        dueDate: '2024-09-09',
        stageDefinitionId: '248d7522-43a3-48a3-9754-b64f4ed57bd6',
      },
      {
        dueDate: '2024-09-12',
        stageDefinitionId: '88f3a791-d880-417d-b4a8-3f4d1d650291',
      },
      {
        dueDate: '2024-09-24',
        stageDefinitionId: '158358a6-1147-49ff-84c0-01e0a7c25083',
      },
      {
        dueDate: '2024-09-30',
        stageDefinitionId: 'f2f85606-d2de-4876-a3d9-9ec9baee8b2e',
      },
      {
        dueDate: '2024-09-30',
        stageDefinitionId: '1a465577-80fc-43a5-b20c-22cc4a34bb5d',
      },
      {
        dueDate: '2024-09-30',
        stageDefinitionId: '9745e697-9829-47cc-8b19-daf9b7d147b3',
      },
    ])
  })
})

describe('calculateProjectStageDueDatesFromIntervals', () => {
  describe('when the project start date is a weekend', () => {
    it('should calculate stage due dates correctly', () => {
      const stages = [
        { id: 'stage1', duration: { unit: 'DAYS' as const, value: 7 } },
        { id: 'stage2', duration: { unit: 'DAYS' as const, value: 14 } },
        { id: 'stage3', duration: { unit: 'DAYS' as const, value: 30 } },
      ]

      // Saturday
      const projectStartDate = DateTime.fromISO('2022-01-01').startOf('day')

      const result = calculateProjectStageDueDatesFromIntervals(
        stages,
        projectStartDate
      )

      expect(result).toEqual([
        {
          stageDefinitionId: 'stage1',
          dueDate: '2022-01-07',
        },
        {
          stageDefinitionId: 'stage2',
          dueDate: '2022-01-21',
        },
        {
          stageDefinitionId: 'stage3',
          dueDate: '2022-02-22',
        },
      ])
    })
  })

  describe('when the project start date is a business day', () => {
    it('should calculate stage due dates correctly', () => {
      const stages = [
        { id: 'stage1', duration: { unit: 'DAYS' as const, value: 7 } },
        { id: 'stage2', duration: { unit: 'DAYS' as const, value: 14 } },
        { id: 'stage3', duration: { unit: 'DAYS' as const, value: 30 } },
      ]

      // Monday
      const projectStartDate = DateTime.fromISO('2022-01-03').startOf('day')

      const result = calculateProjectStageDueDatesFromIntervals(
        stages,
        projectStartDate
      )

      expect(result).toEqual([
        {
          stageDefinitionId: 'stage1',
          dueDate: '2022-01-07',
        },
        {
          stageDefinitionId: 'stage2',
          dueDate: '2022-01-21',
        },
        {
          stageDefinitionId: 'stage3',
          dueDate: '2022-02-22',
        },
      ])
    })

    it('should calculate stage due dates correctly 2', () => {
      const stages = [
        { id: 'stage1', duration: { unit: 'DAYS' as const, value: 7 } },
        { id: 'stage2', duration: { unit: 'DAYS' as const, value: 14 } },
        { id: 'stage3', duration: { unit: 'DAYS' as const, value: 30 } },
      ]

      // Friday
      const projectStartDate = DateTime.fromISO('2022-01-07').startOf('day')

      const result = calculateProjectStageDueDatesFromIntervals(
        stages,
        projectStartDate
      )

      expect(result).toEqual([
        {
          stageDefinitionId: 'stage1',
          dueDate: '2022-01-13',
        },
        {
          stageDefinitionId: 'stage2',
          dueDate: '2022-01-27',
        },
        {
          stageDefinitionId: 'stage3',
          dueDate: '2022-02-28',
        },
      ])
    })

    it('should calculate stage due dates correctly when the first stage has a 0 duration', () => {
      const stages = [
        { id: 'stage1', duration: { unit: 'DAYS' as const, value: 0 } },
        { id: 'stage2', duration: { unit: 'DAYS' as const, value: 14 } },
        { id: 'stage3', duration: { unit: 'DAYS' as const, value: 30 } },
      ]

      // Friday
      const projectStartDate = DateTime.fromISO('2022-01-07').startOf('day')

      const result = calculateProjectStageDueDatesFromIntervals(
        stages,
        projectStartDate
      )

      expect(result).toEqual([
        {
          stageDefinitionId: 'stage1',
          dueDate: '2022-01-07',
        },
        {
          stageDefinitionId: 'stage2',
          dueDate: '2022-01-21',
        },
        {
          stageDefinitionId: 'stage3',
          dueDate: '2022-02-22',
        },
      ])
    })
  })
})
