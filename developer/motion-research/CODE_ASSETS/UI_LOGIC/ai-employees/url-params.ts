import { type AgentWorkflowRunSchema } from '@motion/zod/client'

export type AIEmployeeUrlSearchParams = {
  skillRunId: AgentWorkflowRunSchema['id']
}
