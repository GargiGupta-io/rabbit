import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

import { RouteTypes } from '../types'

type GetAgentWorkflowById = RouteTypes<'AgentsController_getAgentWorkflow'>
export const getAgentWorkflowById = defineApi<
  GetAgentWorkflowById['request'],
  GetAgentWorkflowById['response']
>().using({
  key: (args) =>
    queryKeys.workflowById(args.workflowId, args.hydrate, args.mode),
  uri: (args) => {
    const searchParams = new URLSearchParams()
    if (args.hydrate && args.hydrate.length > 0) {
      searchParams.append('hydrate', args.hydrate.join(','))
    }

    if (args.mode) {
      searchParams.append('mode', args.mode)
    }

    return `/v2/agents/workflows/${args.workflowId}?${searchParams.toString()}`
  },
})

type GetPublishedAgentWorkflowByVersionGroupId =
  RouteTypes<'AgentsController_getPublishedAgentWorkflowByVersionGroupId'>
export const getPublishedAgentWorkflowByVersionGroupId = defineApi<
  GetPublishedAgentWorkflowByVersionGroupId['request'],
  GetPublishedAgentWorkflowByVersionGroupId['response']
>().using({
  key: (args) =>
    queryKeys.publishedWorkflowByVersionGroupId(args.versionGroupId),
  uri: (args) =>
    `/v2/agents/workflows/version-group/${args.versionGroupId}/published`,
})

type GetAgentWorkflowVersionsByVersionGroupId =
  RouteTypes<'AgentsController_getAgentWorkflowVersionsByVersionGroupId'>
export const getAgentWorkflowVersionsByVersionGroupId = defineApi<
  GetAgentWorkflowVersionsByVersionGroupId['request'],
  GetAgentWorkflowVersionsByVersionGroupId['response']
>().using({
  key: (args) =>
    queryKeys.workflowVersionsByVersionGroupId(args.versionGroupId),
  uri: (args) =>
    `/v2/agents/workflows/version-group/list/${args.versionGroupId}`,
})

type GetAgentWorkflowRunById =
  RouteTypes<'AgentsController_getAgentWorkflowRun'>
export const getAgentWorkflowRunById = defineApi<
  GetAgentWorkflowRunById['request'],
  GetAgentWorkflowRunById['response']
>().using({
  key: (args) => queryKeys.runById(args.workflowRunId),
  uri: (args) => `/v2/agents/run/${args.workflowRunId}`,
})

type GetAgentStepsLibrary = RouteTypes<'AgentsController_getStepLibrary'>
export const getAgentStepsLibrary = defineApi<
  GetAgentStepsLibrary['request'],
  GetAgentStepsLibrary['response']
>().using({
  key: () => queryKeys.stepsLibrary(),
  uri: () => `/v2/agents/steps/library`,
})

type GetStepToolMetadata = RouteTypes<'AgentsController_getStepToolMetadata'>
export const getStepToolMetadata = defineApi<
  GetStepToolMetadata['request'],
  GetStepToolMetadata['response']
>().using({
  key: (args) =>
    queryKeys.stepMetadata(args.stepType, args.integrationConfigId),
  uri: (args) =>
    `/v2/agents/steps/${args.stepType}/metadata/${args.integrationConfigId}`,
})

type GetAgentModels = RouteTypes<'AgentsController_getAgentModels'>
export const getAgentModels = defineApi<
  GetAgentModels['request'],
  GetAgentModels['response']
>().using({
  key: () => queryKeys.models(),
  uri: () => `/v2/agents/models`,
})

type GetPublishedCanonicalAgentWorkflows =
  RouteTypes<'AgentsController_getAllPublishedCanonicalWorkflows'>
export const getPublishedCanonicalAgentWorkflows = defineApi<
  GetPublishedCanonicalAgentWorkflows['request'],
  GetPublishedCanonicalAgentWorkflows['response']
>().using({
  key: () => queryKeys.canonicalWorkflows(),
  uri: () => `/v2/agents/canonical-workflows`,
})

type GetAgentEmployeePresets =
  RouteTypes<'AgentsEmployeeController_getAllSelectableEmployeePresets'>
export const getAgentEmployeePresets = defineApi<
  GetAgentEmployeePresets['request'],
  GetAgentEmployeePresets['response']
>().using({
  key: () => queryKeys.employeePresetList(),
  uri: () => `/v2/agents/employees/preset/list`,
})

export type GetAgentEmployees =
  RouteTypes<'AgentsEmployeeController_getEmployees'>
export const getAgentEmployees = defineApi<
  GetAgentEmployees['request'],
  GetAgentEmployees['response']
>().using({
  key: () => queryKeys.employeeList(),
  uri: () => `/v2/agents/employees/list`,
})

type GetAgentEmployeeById = RouteTypes<'AgentsEmployeeController_getEmployee'>
export const getAgentEmployeeById = defineApi<
  GetAgentEmployeeById['request'],
  GetAgentEmployeeById['response']
>().using({
  key: (args) => queryKeys.employeeById(args.employeeId),
  uri: (args) => `/v2/agents/employees/${args.employeeId}`,
})

type GetAgentWorkflowRunsQuery =
  RouteTypes<'AgentsController_getAgentWorkflowRunsQuery'>
export const getAgentWorkflowRunsQuery = defineApi<
  GetAgentWorkflowRunsQuery['request'],
  GetAgentWorkflowRunsQuery['response']
>().using({
  method: 'POST',
  key: (args) => queryKeys.runQuery(args),
  uri: () => `/v2/agents/runs/query`,
})

type GetAgentWorkflowCredits =
  RouteTypes<'AgentsController_getAgentWorkflowCredits'>
export const getAgentWorkflowCredits = defineApi<
  GetAgentWorkflowCredits['request'],
  GetAgentWorkflowCredits['response']
>().using({
  method: 'GET',
  key: () => queryKeys.credits(),
  uri: () => `/v2/agents/workflow-credits`,
})

type TestTriggerWithEventHistory =
  RouteTypes<'AgentsController_testTriggerWithEventHistory'>
export const testTriggerWithEventHistory = defineApi<
  TestTriggerWithEventHistory['request'],
  TestTriggerWithEventHistory['response']
>().using({
  method: 'POST',
  key: (args) => queryKeys.testTriggerWithEventHistory(args),
  uri: () => `/v2/agents/test-trigger`,
})
