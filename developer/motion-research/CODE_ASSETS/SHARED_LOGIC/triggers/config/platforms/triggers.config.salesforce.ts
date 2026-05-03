import { TriggerActionConfig, TriggerField } from '../triggers.config.models'

const idField: TriggerField = { id: 'id', label: 'ID' }

/**
 * Specification of the entity fields for Salesforce Triggers
 */
const entityFields: Record<string, TriggerField[]> = {
  Lead: [
    { id: 'first_name', label: 'First Name' },
    { id: 'last_name', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'owner_id', label: 'Owner ID' },
    { id: 'phone', label: 'Phone' },
  ],
  Contact: [
    { id: 'first_name', label: 'First Name' },
    { id: 'last_name', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'account_id', label: 'Account ID' },
    { id: 'account_name', label: 'Account Name' },
    { id: 'mobile', label: 'Mobile' },
  ],
  Opportunity: [
    { id: 'opportunity_name', label: 'Opportunity Name' },
    { id: 'account_name', label: 'Account Name' },
    { id: 'amount', label: 'Amount' },
    { id: 'close_date', label: 'Close Date' },
    { id: 'stage', label: 'Stage' },
    { id: 'probability', label: 'Probability' },
  ],
  Account: [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'website', label: 'Website' },
    { id: 'industry', label: 'Industry' },
    { id: 'billing_city', label: 'Billing City' },
  ],
}

/**
 * Dynamically constructs the trigger configuration for Salesforce entities
 */
function createTriggerConfig() {
  const entries: TriggerActionConfig[] = []

  const vowels = ['a', 'e', 'i', 'o', 'u']

  for (const [entity, fields] of Object.entries(entityFields)) {
    const article = vowels.includes(entity.toLowerCase()[0]) ? 'an' : 'a'

    const createdConfig: TriggerActionConfig = {
      id: `salesforce-${entity.toLowerCase()}-created`,
      label: `When ${article} ${entity} is Created`,
      payloadAlias: entity,
      hint: 'Type in natural language any record types or filters you need. Ex: "If name contains AI get the opportunity name, website and lead"',
      fields,
      requiredFields: [idField],
    }

    const updatedConfig: TriggerActionConfig = {
      id: `salesforce-${entity.toLowerCase()}-updated`,
      label: `When ${article} ${entity} is Updated`,
      payloadAlias: entity,
      hint: 'Type in natural language any record types or filters you need. Ex: "When an opportunity enters Stage 2 get the opportunity name, website and lead"',
      fields,
      requiredFields: [idField],
    }

    entries.push(createdConfig)
    entries.push(updatedConfig)
  }

  return entries
}

/**
 * Export the generated configuration.
 */
export const salesforceTriggersConfig: TriggerActionConfig[] =
  createTriggerConfig()
