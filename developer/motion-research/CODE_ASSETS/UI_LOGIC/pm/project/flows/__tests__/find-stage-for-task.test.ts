import { findStageForTask } from '../find-stage-for-task'
import { type FlowTemplateStage } from '../form-fields'

describe('findStageForTask', () => {
  it('should return the correct stage when task is found', () => {
    const stages = [
      { id: '1', name: 'Stage 1', tasks: [{ id: 'task1' }, { id: 'task2' }] },
      { id: '2', name: 'Stage 2', tasks: [{ id: 'task3' }, { id: 'task4' }] },
    ] as FlowTemplateStage[]
    const result = findStageForTask(stages, 'task3')

    expect(result).toEqual(stages[1])
  })

  it('should return undefined when task is not found', () => {
    const stages = [
      { id: '1', name: 'Stage 1', tasks: [{ id: 'task1' }, { id: 'task2' }] },
      { id: '2', name: 'Stage 2', tasks: [{ id: 'task3' }, { id: 'task4' }] },
    ] as FlowTemplateStage[]
    const result = findStageForTask(stages, 'task5')

    expect(result).toBeUndefined()
  })

  it('should return undefined when stages array is empty', () => {
    const stages = [] as FlowTemplateStage[]
    const result = findStageForTask(stages, 'task1')

    expect(result).toBeUndefined()
  })

  it('should return the correct stage when dropzone is found', () => {
    const stages = [
      {
        id: '1',
        name: 'Stage 1',
        tasks: [{ id: 'empty-1.1' }, { id: 'task2' }],
      },
      { id: '2', name: 'Stage 2', tasks: [{ id: 'task3' }, { id: 'task4' }] },
    ] as FlowTemplateStage[]
    const result = findStageForTask(stages, 'empty-1.1')

    expect(result).toEqual(stages[1])
  })
})
