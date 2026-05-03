import { defineMutation } from '@motion/rpc'

import { automationQueryKeys } from '../crm/automations'
import { RouteTypes } from '../types'

type RunMessageNow = RouteTypes<'InternalMessage_RunMessageNow'>
export const runMessageNow = defineMutation<
  RunMessageNow['request'],
  RunMessageNow['response']
>().using({
  method: 'POST',
  uri: (args) =>
    `${__NET_HOST__}/v1/api/internal/messages/${args.entityType}/${args.entityId}/run`,
  body: (data) => data,
  invalidate: (args) => {
    if (args.entityType === 'pipeline-automation-run-step') {
      return [automationQueryKeys.automationRuns()]
    }

    return []
  },
})
