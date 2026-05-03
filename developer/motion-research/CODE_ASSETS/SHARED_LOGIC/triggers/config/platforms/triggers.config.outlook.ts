import { TriggerActionConfig } from '../triggers.config.models'

/**
 * Configuration for the inbound email events from Outlook
 */
export const outlookTriggerConfig: TriggerActionConfig = {
  id: 'outlook-message-received',
  label: 'When an email is received',
  payloadAlias: 'Inbound email',
  hint: 'Type in natural language any filters you want to add. For example: "If the subject contains \'Support\'" or "If the email is from a specific domain"',
  fields: [
    { id: 'body', label: 'Body' },
    { id: 'subject', label: 'Subject' },
    { id: 'from', label: 'From' },
    { id: 'cc', label: 'CC' },
    { id: 'to', label: 'To' },
    { id: 'categories', label: 'Categories' },
    { id: 'receivedDateTime', label: 'Received Date' },
    { id: 'attachments_formatted', label: 'Attachments' },
  ],
  requiredFields: [
    { id: 'conversation_id', label: 'Conversation ID' },
    { id: 'message_id', label: 'Message ID' },
  ],
}

export const outlookTriggerActions: TriggerActionConfig[] = [
  outlookTriggerConfig,
]
