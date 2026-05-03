import { TriggerActionConfig } from '../triggers.config.models'

/**
 * Configuration for the inbound email events
 */
export const gmailTriggerConfig: TriggerActionConfig = {
  id: 'google-mail-received',
  label: 'When an email is received',
  payloadAlias: 'Inbound email',
  hint: 'Type in natural language any filters you want to add. For example: "If the subject contains \'Support\'"',
  fields: [
    { id: 'body', label: 'Body' },
    { id: 'subject', label: 'Subject' },
    { id: 'from', label: 'From' },
    { id: 'cc', label: 'CC' },
    { id: 'to', label: 'To' },
    { id: 'attachments_formatted', label: 'Attachments' },
  ],
  requiredFields: [
    { id: 'thread_id', label: 'Thread ID' },
    { id: 'message_id', label: 'Message ID' },
  ],
}

export const gmailTriggerActions: TriggerActionConfig[] = [gmailTriggerConfig]
