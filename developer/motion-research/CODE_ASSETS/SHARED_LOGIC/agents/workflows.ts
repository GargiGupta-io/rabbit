/**
 * The shared workflow run status values.
 */
export const workflowRunStatus = [
  'pending', // The workflow run has been registered and queued in Hatchet
  'started', // Hatchet has started executing
  'waiting', // The workflow is suspended, waiting to resume
  'success', // The workflow completed successfully
  'error', // The workflow failed
  'canceled',
] as const
