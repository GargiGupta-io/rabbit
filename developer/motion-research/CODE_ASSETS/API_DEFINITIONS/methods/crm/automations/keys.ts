import { createKey } from '@motion/rpc'

export const automationQueryKeys = {
  root: () => createKey('crm/automations'),
  automations: () => createKey(automationQueryKeys.root(), 'automations'),
  automationsForPipeline: (pipelineId: string) =>
    createKey(automationQueryKeys.automations(), 'pipelines', pipelineId),
  automationRuns: () => createKey(automationQueryKeys.root(), 'runs'),
  automationRunsForDeal: (dealId: string) =>
    createKey(automationQueryKeys.automationRuns(), 'deals', dealId),
}
