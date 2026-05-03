import { TriggerImportRequest } from '@motion/motion-net-types'
import { defineMutation } from '@motion/rpc'

export type TriggerCrmContactImportResponse = {
  workflowId: string
  status: 'started' | 'already_running'
  emailAccountId: string
  email: string
  dryRun: boolean
}

export const triggerCrmContactImport = defineMutation<
  TriggerImportRequest,
  TriggerCrmContactImportResponse
>().using({
  uri: () => `${__NET_HOST__}/v1/crm/contact-import/trigger`,
  method: 'POST',
  body: (args) => args,
})
