import { createKey } from '@motion/rpc'
import {
  type AgentWorkflowRunQueryRequestSchema,
  type TestTriggerWithEventHistoryRequestSchema,
} from '@motion/zod/client'

export const queryKeys = {
  root: () => createKey('agent-workflows'),

  canonicalWorkflows: () =>
    createKey(queryKeys.root(), 'canonical-workflows', 'list'),
  workflowById: (id: string, hydrate?: readonly string[], mode?: string) => [
    ...queryKeys.root(),
    'by-id',
    id,
    { hydrate, mode },
  ],
  publishedWorkflowByVersionGroupId: (versionGroupId: string) =>
    createKey(queryKeys.root(), 'version-group', versionGroupId, 'published'),
  credits: () => createKey(queryKeys.root(), 'credits'),

  runRoot: () => createKey(queryKeys.root(), 'runs'),
  runById: (id: string) => createKey(queryKeys.runRoot(), 'by-id', id),
  runQuery: (args: AgentWorkflowRunQueryRequestSchema) =>
    [...queryKeys.runRoot(), 'query', args.filters] as const,

  models: () => createKey(queryKeys.root(), 'models'),
  stepsLibrary: () => createKey(queryKeys.root(), 'steps-library'),
  stepMetadata: (type: string, id: string) =>
    createKey(queryKeys.root(), 'steps-metadata', type, id),

  // Mutation keys used to check if a mutation is in flight
  generateStepPrompt: () => createKey(queryKeys.root(), 'generate-step-prompt'),
  generateStepPromptSummary: () =>
    createKey(queryKeys.root(), 'generate-step-prompt-summary'),
  generateTriggerPrompt: () =>
    createKey(queryKeys.root(), 'generate-trigger-prompt'),

  // Employee
  employeePresetList: () =>
    createKey(queryKeys.root(), 'ai-employees', 'presets'),
  employeeRoot: () => createKey(queryKeys.root(), 'ai-employees'),
  employeeList: () => createKey(queryKeys.employeeRoot(), 'list'),
  employeeById: (id: string) =>
    createKey(queryKeys.employeeRoot(), 'by-id', id),

  workflowVersionsByVersionGroupId: (versionGroupId: string) =>
    createKey(queryKeys.root(), 'versions', versionGroupId),

  // Test trigger with event history
  testTriggerWithEventHistory: (
    args: TestTriggerWithEventHistoryRequestSchema
  ) => [...queryKeys.root(), 'test-trigger-with-event-history', args] as const,
}
