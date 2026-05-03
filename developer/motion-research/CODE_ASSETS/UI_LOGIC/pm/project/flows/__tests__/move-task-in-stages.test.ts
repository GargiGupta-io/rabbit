import {
  type FlowTemplateFormTask,
  type FlowTemplateStage,
} from '../form-fields'
import { moveTaskInStages } from '../move-task-in-stages'

describe('moveTaskInStages', () => {
  it('should move task within the same stage', () => {
    const stages = [
      {
        id: '1',
        name: 'Stage 1',
        tasks: [{ id: 'task1' }, { id: 'task2' }, { id: 'task3' }],
      },
    ] as FlowTemplateStage[]
    const result = moveTaskInStages(
      {
        id: 'task1',
      } as FlowTemplateFormTask,
      stages,
      2
    )

    expect(result[0].tasks).toEqual([
      { id: 'task2' },
      { id: 'task3' },
      { id: 'task1' },
    ])
  })

  it('should move task to a different stage', () => {
    const stages = [
      { id: '1', name: 'Stage 1', tasks: [{ id: 'task1' }, { id: 'task2' }] },
      { id: '2', name: 'Stage 2', tasks: [{ id: 'task3' }] },
    ] as FlowTemplateStage[]
    const result = moveTaskInStages(
      {
        id: 'task1',
      } as FlowTemplateFormTask,
      stages,
      1,
      1
    )

    expect(result[0].tasks).toEqual([{ id: 'task2' }])
    expect(result[1].tasks).toEqual([{ id: 'task3' }, { id: 'task1' }])
  })
})
