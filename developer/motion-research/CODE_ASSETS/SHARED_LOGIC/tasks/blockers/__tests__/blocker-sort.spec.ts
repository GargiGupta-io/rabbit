import { sortBlockers } from '../blocker-sort'
import { TaskBlockerSpec } from '../blocker-validator'

/**
 * Test cases to verify the blocker sorting.
 *
 * yarn test --filter=@motion/shared -- blocker-sort
 */
describe('Blocker sort tests', () => {
  it('sorts blockers with blocker tasks first', () => {
    const tasks: TaskBlockerSpec[] = [
      { id: 'task_4', blockingTaskIds: ['task_1', 'task_3'] },
      { id: 'task_1', blockingTaskIds: [] },
      { id: 'task_3', blockingTaskIds: ['task_2'] },
      { id: 'task_2', blockingTaskIds: ['task_1'] },
    ]

    const { sortedTasks } = sortBlockers(tasks)

    expect(sortedTasks.length).toBe(4)
    expect(sortedTasks[0].id).toBe('task_1')
    expect(sortedTasks[1].id).toBe('task_2')
    expect(sortedTasks[2].id).toBe('task_3')
    expect(sortedTasks[3].id).toBe('task_4')
  })

  it('sorts many tasks blockers appear last', () => {
    const tasks: TaskBlockerSpec[] = [
      { id: 'task_1.2', blockingTaskIds: [] },
      { id: 'task_1.7', blockingTaskIds: [] },
      { id: 'task_4', blockingTaskIds: ['task_1', 'task_3'] },
      { id: 'task_1', blockingTaskIds: [] },
      { id: 'task_1.1', blockingTaskIds: [] },
      { id: 'task_3', blockingTaskIds: ['task_2'] },
      { id: 'task_1.3', blockingTaskIds: [] },
      { id: 'task_2', blockingTaskIds: ['task_1'] },
      { id: 'task_1.4', blockingTaskIds: [] },
      { id: 'task_1.5', blockingTaskIds: [] },
    ]

    const { sortedTasks } = sortBlockers(tasks)

    expect(sortedTasks.length).toBe(10)
    // Last indices are correct
    expect(sortedTasks[7].id).toBe('task_2')
    expect(sortedTasks[8].id).toBe('task_3')
    expect(sortedTasks[9].id).toBe('task_4')
  })

  it('detects cycles', () => {
    const tasks: TaskBlockerSpec[] = [
      { id: 'task_1', blockingTaskIds: ['task_2'] },
      { id: 'task_2', blockingTaskIds: ['task_1'] },
      { id: 'task_3', blockingTaskIds: [] },
      { id: 'task_4', blockingTaskIds: [] },
    ]

    const { valid } = sortBlockers(tasks)

    expect(valid).toBe(false)
  })
})
