import { type StageArg } from '../..'
import { shiftProjectDates } from '../shift-project-dates'

describe('shiftProjectDates', () => {
  it('should shift project dates forward', () => {
    const result = shiftProjectDates({
      oldProjectStart: '2023-01-01',
      newProjectStart: '2023-01-15',
      projectDueDate: '2023-03-01',
      stageDueDates: [
        { stageDefinitionId: '1', dueDate: '2023-01-15' },
        { stageDefinitionId: '2', dueDate: '2023-02-15' },
      ] as StageArg[],
    })

    expect(result).toEqual({
      newProjectStart: '2023-01-15',
      newProjectDueDate: '2023-03-15',
      newStageDueDates: [
        { stageDefinitionId: '1', dueDate: '2023-01-29' },
        { stageDefinitionId: '2', dueDate: '2023-03-01' },
      ] as StageArg[],
    })
  })

  it('should shift project dates backward', () => {
    const result = shiftProjectDates({
      oldProjectStart: '2023-01-15',
      newProjectStart: '2023-01-01',
      projectDueDate: '2023-03-15',
      stageDueDates: [
        { stageDefinitionId: '1', dueDate: '2023-01-29' },
        { stageDefinitionId: '2', dueDate: '2023-03-01' },
      ] as StageArg[],
    })

    expect(result).toEqual({
      newProjectStart: '2023-01-01',
      newProjectDueDate: '2023-03-01',
      newStageDueDates: [
        { stageDefinitionId: '1', dueDate: '2023-01-15' },
        { stageDefinitionId: '2', dueDate: '2023-02-15' },
      ] as StageArg[],
    })
  })

  it('should not change dates when start date remains the same', () => {
    const input = {
      oldProjectStart: '2023-01-01',
      newProjectStart: '2023-01-01',
      projectDueDate: '2023-03-01',
      stageDueDates: [
        { stageDefinitionId: '1', dueDate: '2023-01-15' },
        { stageDefinitionId: '2', dueDate: '2023-02-15' },
      ] as StageArg[],
    }
    const result = shiftProjectDates(input)

    expect(result).toEqual({
      newProjectStart: '2023-01-01',
      newProjectDueDate: '2023-03-01',
      newStageDueDates: input.stageDueDates,
    })
  })

  it('should handle leap years correctly', () => {
    const result = shiftProjectDates({
      oldProjectStart: '2024-02-28',
      newProjectStart: '2024-03-01',
      projectDueDate: '2024-04-30',
      stageDueDates: [
        { stageDefinitionId: '1', dueDate: '2024-03-15' },
        { stageDefinitionId: '2', dueDate: '2024-04-15' },
      ] as StageArg[],
    })

    expect(result).toEqual({
      newProjectStart: '2024-03-01',
      newProjectDueDate: '2024-05-02',
      newStageDueDates: [
        { stageDefinitionId: '1', dueDate: '2024-03-17' },
        { stageDefinitionId: '2', dueDate: '2024-04-17' },
      ] as StageArg[],
    })
  })
})
