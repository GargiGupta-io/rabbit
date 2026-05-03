import { defineApi } from '@motion/rpc'

import { automationQueryKeys } from './keys'

import { RouteTypes } from '../../types'

type GetAutomationsForPipeline =
  RouteTypes<'PipelineAutomation_GetAutomationsForPipeline'>

export const getAutomationsForPipeline = defineApi<
  GetAutomationsForPipeline['request'],
  GetAutomationsForPipeline['response']
>().using({
  uri: (args) =>
    `${__NET_HOST__}/v1/crm/pipeline-automations/pipelines/${args.pipelineId}`,
  method: 'GET',
  key: (args) => automationQueryKeys.automationsForPipeline(args.pipelineId),
})

type GetAutomationRunForDeal = RouteTypes<'PipelineAutomation_GetDealRun'>

export const getAutomationRunForDeal = defineApi<
  GetAutomationRunForDeal['request'],
  GetAutomationRunForDeal['response']
>().using({
  uri: (args) =>
    `${__NET_HOST__}/v1/crm/pipeline-automations/deals/${args.dealId}`,
  method: 'GET',
  key: (args) => automationQueryKeys.automationRunsForDeal(args.dealId),
})
