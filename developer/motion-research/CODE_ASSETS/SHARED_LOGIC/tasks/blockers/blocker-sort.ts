import { TaskBlockerSpec } from './blocker-validator'

/**
 * Topological sort of a given array of tasks so that the tasks blocking other tasks
 * appear earlier in the array.
 * @param tasks The set of tasks which must be sorted in order to ensure blocker dependencies appear first.
 * @returns A a result object with a boolean indicating whether the result is valid and the sorted array.
 */
export function sortBlockers<T extends TaskBlockerSpec>(
  tasks: T[]
): { valid: boolean; sortedTasks: T[] } {
  // Create a mapping from task ID to the task object
  const taskMap = new Map(tasks.map((task) => [task.id, task]))

  // Initialize in-degree map (count of dependencies per task)
  const inDegree = new Map<string, number>()

  // Adjacency list (task -> tasks it unblocks)
  const graph = new Map<string, string[]>()

  // Populate graph and in-degree map
  for (const task of tasks) {
    if (!task.id) {
      continue
    }

    inDegree.set(task.id, 0)
    graph.set(task.id, [])
  }

  for (const task of tasks) {
    if (!task.blockingTaskIds?.length || !task.id) {
      continue
    }

    for (const blockedById of task.blockingTaskIds) {
      if (!taskMap.has(blockedById)) {
        throw new Error(`Task ${blockedById} does not exist`)
      }

      graph.get(blockedById)?.push(task.id)

      inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1)
    }
  }

  // Find all tasks with no dependencies (in-degree 0)
  const queue: string[] = []

  for (const [taskId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(taskId)
    }
  }

  // Process tasks in topological order
  const sortedTasks: T[] = []

  while (queue.length > 0) {
    const taskId = queue.shift() ?? '' // hint to TS

    const k = taskMap.get(taskId)

    if (!k) {
      continue
    }

    sortedTasks.push(k as T)

    for (const dependentTaskId of graph.get(taskId) ?? '') {
      let degree = inDegree.get(dependentTaskId)

      if (!degree) {
        continue
      }

      inDegree.set(dependentTaskId, degree - 1)

      if (inDegree.get(dependentTaskId) === 0) {
        queue.push(dependentTaskId)
      }
    }
  }

  return {
    // If not all tasks were processed, there's a cycle
    valid: sortedTasks.length === tasks.length,
    sortedTasks,
  }
}
