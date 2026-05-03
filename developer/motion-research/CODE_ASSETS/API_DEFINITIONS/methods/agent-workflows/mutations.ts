import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

type RunAgentWorkflow = RouteTypes<'AgentsController_runAgentWorkflow'>
export const runAgentWorkflow = defineMutation<
  RunAgentWorkflow['request'],
  RunAgentWorkflow['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/workflows/${args.workflowId}/run`,
  body: ({ workflowId, ...data }) => data,
  invalidate: (args) => [queryKeys.runRoot()],
})

type RerunAgentWorkflow = RouteTypes<'AgentsController_rerunAgentWorkflowRun'>
export const rerunAgentWorkflow = defineMutation<
  RerunAgentWorkflow['request'],
  RerunAgentWorkflow['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/run/${args.workflowRunId}/rerun`,
  body: ({ workflowRunId, ...data }) => data,
  invalidate: (args) => [queryKeys.runRoot()],
})

type ReExecuteWorkflowRun = RouteTypes<'AgentsController_reExecuteWorkflowRun'>
export const reExecuteWorkflowRun = defineMutation<
  ReExecuteWorkflowRun['request'],
  ReExecuteWorkflowRun['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/run/${args.workflowRunId}/re-execute`,
  body: ({ workflowRunId, ...data }) => data,
  invalidate: (args) => [queryKeys.runRoot()],
})

type CreateAgentWorkflow = RouteTypes<'AgentsController_createAgentWorkflow'>
export const createAgentWorkflow = defineMutation<
  CreateAgentWorkflow['request'],
  CreateAgentWorkflow['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/workflows/create`,
  body: (data) => data,
  invalidate: (args) => [
    queryKeys.employeeList(),
    queryKeys.canonicalWorkflows(),
  ],
})

type SaveAgentWorkflow = RouteTypes<'AgentsController_saveAgentWorkflow'>
export const saveAgentWorkflow = defineMutation<
  SaveAgentWorkflow['request'],
  SaveAgentWorkflow['response']
>().using({
  method: 'PUT',
  uri: (args) => `/v2/agents/workflows/${args.id}/save`,
  body: (data) => data,
  invalidate: (args) => [
    queryKeys.employeeList(),
    queryKeys.canonicalWorkflows(),
  ],
})

type DeleteAgentWorkflow = RouteTypes<'AgentsController_deleteAgentWorkflow'>
export const deleteAgentWorkflow = defineMutation<
  DeleteAgentWorkflow['request'],
  DeleteAgentWorkflow['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/agents/workflows/${args.workflowId}`,
  invalidate: (args) => [
    queryKeys.runRoot(),
    queryKeys.employeeList(),
    queryKeys.canonicalWorkflows(),
  ],
})

type PublishAgentWorkflow = RouteTypes<'AgentsController_publishAgentWorkflow'>
export const publishAgentWorkflow = defineMutation<
  PublishAgentWorkflow['request'],
  PublishAgentWorkflow['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/workflows/${args.workflowId}/publish`,
  invalidate: (args) => [queryKeys.root()],
})

type GenerateStepPrompt = RouteTypes<'AgentsController_generatePrompt'>
export const generateStepPrompt = defineMutation<
  GenerateStepPrompt['request'],
  GenerateStepPrompt['response']
>().using({
  mutationOptions: {
    mutationKey: queryKeys.generateStepPrompt(),
  },
  method: 'POST',
  uri: () => `/v2/agents/steps/generate-prompt`,
  body: (data) => data,
})

type GenerateStepPromptSummary =
  RouteTypes<'AgentsController_generateStepPromptSummary'>
export const generateStepPromptSummary = defineMutation<
  GenerateStepPromptSummary['request'],
  GenerateStepPromptSummary['response']
>().using({
  mutationOptions: {
    mutationKey: queryKeys.generateStepPromptSummary(),
  },
  method: 'POST',
  uri: () => `/v2/agents/steps/generate-prompt-summary`,
  body: (data) => data,
})

type RunSingleStep = RouteTypes<'AgentsController_runSingleStep'>
export const runSingleStep = defineMutation<
  RunSingleStep['request'],
  RunSingleStep['response']
>().using({
  method: 'POST',
  uri: () => `/v2/agents/steps/run`,
  body: (data) => data,
})

type BulkGenerateTriggerPrompt =
  RouteTypes<'AgentsController_generateTriggersBulk'>
export const bulkGenerateTriggerPrompt = defineMutation<
  BulkGenerateTriggerPrompt['request'],
  BulkGenerateTriggerPrompt['response']
>().using({
  mutationOptions: {
    mutationKey: queryKeys.generateTriggerPrompt(),
  },
  method: 'POST',
  uri: () => `/v2/agents/triggers/generate/bulk`,
  body: (data) => data,
})

type CreateAgentEmployeePreset =
  RouteTypes<'AgentsEmployeeController_createEmployeePreset'>
export const createAgentEmployeePreset = defineMutation<
  CreateAgentEmployeePreset['request'],
  CreateAgentEmployeePreset['response']
>().using({
  method: 'POST',
  uri: () => `/v2/agents/employees/preset`,
})

type UpdateAgentEmployeePreset =
  RouteTypes<'AgentsEmployeeController_updateEmployeePreset'>
export const updateAgentEmployeePreset = defineMutation<
  UpdateAgentEmployeePreset['request'],
  UpdateAgentEmployeePreset['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/agents/employees/preset/${args.presetId}`,
})

type CreateAgentEmployee = RouteTypes<'AgentsEmployeeController_createEmployee'>
export const createAgentEmployee = defineMutation<
  CreateAgentEmployee['request'],
  CreateAgentEmployee['response']
>().using({
  method: 'POST',
  uri: () => `/v2/agents/employees`,
  invalidate: (args) => [queryKeys.employeeList()],
})

type AddEmployeeWorkflows =
  RouteTypes<'AgentsEmployeeController_addEmployeeWorkflows'>
export const addEmployeeWorkflows = defineMutation<
  AddEmployeeWorkflows['request'],
  AddEmployeeWorkflows['response']
>().using({
  method: 'PATCH',
  uri: () => `/v2/agents/employees/workflow`,
  invalidate: (args) => [queryKeys.employeeRoot()],
})

type OffboardEmployee = RouteTypes<'AgentsEmployeeController_offboardEmployee'>
export const offboardEmployee = defineMutation<
  OffboardEmployee['request'],
  OffboardEmployee['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/agents/employees/${args.employeeId}/offboard`,
  invalidate: (args) => [queryKeys.employeeRoot(), queryKeys.runRoot()],
})

type ResumeOrCancelWorkflow =
  RouteTypes<'AgentsController_resumeOrCancelWorkflow'>
export const resumeOrCancelWorkflow = defineMutation<
  ResumeOrCancelWorkflow['request'],
  ResumeOrCancelWorkflow['response']
>().using({
  method: 'PATCH',
  uri: (args) =>
    `/v2/agents/runs/${args.workflowRunId}/steps/${args.stepRunId}/update`,
  body: ({ action }) => ({ action }),
  invalidate: (args) => [queryKeys.runRoot()],
})

type RunWorkflowViaTriggerPayload =
  RouteTypes<'AgentsController_runWorkflowViaTriggerPayload'>
export const runWorkflowViaTriggerPayload = defineMutation<
  RunWorkflowViaTriggerPayload['request'],
  RunWorkflowViaTriggerPayload['response']
>().using({
  method: 'POST',
  uri: () => `/v2/agents/test-trigger/run`,
})

type UpdateToLatestCanonicalVersion =
  RouteTypes<'AgentsController_updateToLatestCanonicalVersion'>
export const updateToLatestCanonicalVersion = defineMutation<
  UpdateToLatestCanonicalVersion['request'],
  UpdateToLatestCanonicalVersion['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `/v2/agents/workflows/${args.workflowId}/update-to-latest-canonical-version`,
  invalidate: (args) => [queryKeys.root()],
})

type UpdateTriggersForWorkflow =
  RouteTypes<'AgentsController_updateTriggerForWorkflow'>
export const updateTriggersForWorkflow = defineMutation<
  UpdateTriggersForWorkflow['request'],
  UpdateTriggersForWorkflow['response']
>().using({
  method: 'PATCH',
  uri: (args) =>
    `/v2/agents/workflows/${args.workflowId}/trigger/${args.triggerId}`,
  body: (data) => data,
  invalidate: (args) => [queryKeys.root()],
})

type UpdateWorkflowRunFeedback =
  RouteTypes<'AgentsController_updateWorkflowRunFeedback'>
export const updateWorkflowRunFeedback = defineMutation<
  UpdateWorkflowRunFeedback['request'],
  UpdateWorkflowRunFeedback['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/runs/${args.workflowRunId}/feedback`,
  body: (data) => data,
})

type CreateWorkflowDeployment =
  RouteTypes<'AgentsDeploymentsController_createDeployment'>
export const createWorkflowDeployment = defineMutation<
  CreateWorkflowDeployment['request'],
  CreateWorkflowDeployment['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/agents/workflows/${args.workflowId}/deployments`,
  body: ({ workflowId, ...data }) => data,
})

type UpdateDeploymentMeta =
  RouteTypes<'AgentsDeploymentsController_updateDeploymentMeta'>
export const updateDeploymentMeta = defineMutation<
  UpdateDeploymentMeta['request'],
  UpdateDeploymentMeta['response']
>().using({
  method: 'PUT',
  uri: (args) =>
    `/v2/agents/workflows/${args.workflowId}/deployments/${args.userId}/meta`,
  body: ({ workflowId, userId, ...data }) => data,
})

type RevokeWorkflowDeployment =
  RouteTypes<'AgentsDeploymentsController_revokeDeployment'>
export const revokeWorkflowDeployment = defineMutation<
  RevokeWorkflowDeployment['request'],
  RevokeWorkflowDeployment['response']
>().using({
  method: 'DELETE',
  uri: (args) =>
    `/v2/agents/workflows/${args.workflowId}/deployments/${args.userId}`,
})
