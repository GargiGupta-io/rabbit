import { AdjustmentResults } from '../stage-adjuster'

export const expectResults = (
  results: AdjustmentResults,
  expects: Partial<Omit<AdjustmentResults, 'stages'>> & {
    stages?: Partial<AdjustmentResults['stages'][number]>[]
  }
) => {
  if (expects.startDate) {
    expect(results.startDate).toEqual(expects.startDate)
  }
  if (expects.startDateModified != null) {
    expect(results.startDateModified).toEqual(expects.startDateModified)
  }

  if (expects.dueDate) {
    expect(results.dueDate).toEqual(expects.dueDate)
  }
  if (expects.dueDateModified != null) {
    expect(results.dueDateModified).toEqual(expects.dueDateModified)
  }

  if (expects.stages) {
    expect(results.stages.length).toEqual(expects.stages.length)

    for (const [index, stage] of expects.stages.entries()) {
      const result = results.stages[index]

      if (stage.stageDefinitionId) {
        expect(result.stageDefinitionId).toEqual(stage.stageDefinitionId)
      }

      if ('startDate' in stage && stage.startDate) {
        assert('startDate' in result)
        expect(result.startDate).toEqual(stage.startDate)
      }
      if ('startDateModified' in stage && stage.startDateModified != null) {
        assert('startDateModified' in result)
        expect(result.startDateModified).toEqual(stage.startDateModified)
      }

      if ('dueDate' in stage && stage.dueDate) {
        assert('dueDate' in result)
        expect(result.dueDate).toEqual(stage.dueDate)
      }
      if ('dueDateModified' in stage && stage.dueDateModified != null) {
        assert('dueDateModified' in result)
        expect(result.dueDateModified).toEqual(stage.dueDateModified)
      }

      if ('duration' in stage && stage.duration != null) {
        assert('duration' in result)
        expect(result.duration).toEqual(stage.duration)
      }

      if ('modified' in stage && stage.modified != null) {
        assert('modified' in result)
        expect(result.modified).toEqual(stage.modified)
      }

      if ('canceled' in stage && stage.canceled != null) {
        assert('canceled' in result)
        expect(result.canceled).toEqual(stage.canceled)
      }
      if ('completed' in stage && stage.completed != null) {
        assert('completed' in result)
        expect(result.completed).toEqual(stage.completed)
      }
    }
  }
}
