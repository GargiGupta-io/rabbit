import { defineMutation } from '@motion/rpc'

import { automationQueryKeys } from './keys'

import { RouteTypes } from '../../types'

type CreateAutomationRequest = RouteTypes<'PipelineAutomation_CreateAutomation'>
export const createAutomation = defineMutation<
  CreateAutomationRequest['request'],
  CreateAutomationRequest['response']
>().using({
  uri: () => `${__NET_HOST__}/v1/crm/pipeline-automations`,
  method: 'POST',
  invalidate: (args) => [
    automationQueryKeys.automationsForPipeline(args.pipelineId),
  ],
})

type UpdateAutomationRequest = RouteTypes<'PipelineAutomation_UpdateAutomation'>
export const updateAutomation = defineMutation<
  UpdateAutomationRequest['request'],
  UpdateAutomationRequest['response']
>().using({
  uri: (args) =>
    `${__NET_HOST__}/v1/crm/pipeline-automations/automations/${args.automationId}`,
  method: 'PATCH',
})
