import { BlockerGraph } from './blocker-graph'

/**
 * Common specification for testing for blockers rules. We use this so we can
 * abstract the checks more generically across any types that share the same
 * interface.
 */
export type TaskBlockerSpec = {
  /**
   * The ID of the `Task`-like entity.
   */
  id?: string | null
  /**
   * The ID of the task that is blocking this task.
   * (This is for legacy support for single blockers)
   */
  blockedByTaskId?: string | null
  /**
   * The IDs of the tasks that precede or block this task
   */
  blockingTaskIds?: string[] | null
}

/**
 * Verifies that the set of tasks are a valid configuration for blockers.  This
 * assumes that the tasks supplied exist in a shared scope (e.g. a stage; possibly
 * project in the future).
 *
 * IMPORTANT: assumes tasks are in order of rank.
 *
 * @param tasks The tasks to verify; they should be from a shared scope.
 * @returns The result of the validation with an error message if validation fails.
 */
export function validateBlockers(tasks: TaskBlockerSpec[]): {
  valid: boolean
  error?: string
} {
  let invalidOrder = false

  // Accumulate the blocked tasks and their blockers
  const taskBlockerMap = tasks.reduce((acc, k) => {
    if (!k.id) {
      return acc
    }

    if (!acc.has(k.id)) {
      acc.set(k.id, new Set())
    }

    for (const blockingTaskId of k.blockingTaskIds ?? []) {
      acc.get(k.id)?.add(blockingTaskId)
    }

    if (k.blockedByTaskId) {
      // Backwards compat check.
      acc.get(k.id)?.add(k.blockedByTaskId)
    }

    // If we don't have a key, then there is something out of order.
    if (Array.from(acc.get(k.id)?.values() ?? []).some((k) => !acc.has(k))) {
      // Check this last because it might be a different error like the task ID is
      // not in scope at all.
      invalidOrder = true
    }

    return acc
  }, new Map<string, Set<string>>())

  const allBlockers = Array.from(taskBlockerMap.values()).flatMap((v) =>
    Array.from(v)
  )

  if (allBlockers.length === 0) {
    return { valid: true } // EXIT: there are no blockers specified.
  }

  // Verify that each blocked by ID references a task ID in this scope
  for (const blockedById of allBlockers) {
    if (!taskBlockerMap.has(blockedById)) {
      return {
        valid: false,
        error: `The referenced ID of the blocking task does not exist in this stage: ${blockedById}`,
      }
    }
  }

  // Verify that there are no cycles in the blockers
  const graph = new BlockerGraph()

  for (const [taskId, blockers] of taskBlockerMap.entries()) {
    for (const blockerId of blockers) {
      graph.addEdge(taskId, blockerId)
    }
  }

  if (graph.hasCycle()) {
    return {
      valid: false,
      error: 'The blockers create a cycle in the stage definition',
    }
  }

  // Every other check passed, but we saw a task which was not in order (it
  // referenced a blocker that showed up later in the set).
  if (invalidOrder) {
    return {
      valid: false,
      error: 'The blocking tasks are not in the correct order',
    }
  }

  return { valid: true }
}
