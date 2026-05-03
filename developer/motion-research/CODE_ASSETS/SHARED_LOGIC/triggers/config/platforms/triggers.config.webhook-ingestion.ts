import { TriggerActionConfig } from '../triggers.config.models'

/**
 * Configuration for webhook ingestion events
 */
export const webhookIngestionTriggerConfig: TriggerActionConfig = {
  id: 'webhook-ingestion-received',
  label: 'When a webhook is received',
  payloadAlias: 'Webhook Data',
  hint: `Describe your webhook trigger with EXACT field names from your payload. 

Examples:
• "When status field equals 'paid' and amount > 100" 
• "POST requests where payload.event is 'user.signup'"
• "If headers contain x-signature and data.priority is 'high'"
• "My payload {orderId, status, items} has status='shipped'"

You can also filter by:
• HTTP method (e.g., "only POST requests")
• Headers (e.g., "when x-api-key header equals 'secret'")
• Query params (e.g., "if query param test=true")
• Source IP (e.g., "from IP 192.168.1.1")

⚠️ REQUIRED: Include actual field names or example payload. We cannot guess your webhook structure!`,
  fields: [
    // The payloadFormatted field provides the webhook payload as formatted text
    { id: 'payloadFormatted', label: 'Payload' },
    { id: 'method', label: 'HTTP Method' },
    { id: 'headers', label: 'Headers' },
    { id: 'queryParams', label: 'Query Parameters' },
    { id: 'receivedAt', label: 'Received At' },
    { id: 'sourceIp', label: 'Source IP' },
  ],
  requiredFields: [],
}

export const webhookIngestionTriggerActions: TriggerActionConfig[] = [
  webhookIngestionTriggerConfig,
]
