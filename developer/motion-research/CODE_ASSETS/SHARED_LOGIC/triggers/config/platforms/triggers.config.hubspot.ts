import { TriggerActionConfig, TriggerField } from '../triggers.config.models'

const idField: TriggerField = { id: 'id', label: 'ID' }
const portalIdField: TriggerField = { id: 'portal_id', label: 'Portal ID' }

/**
 * Specification of the entity fields for HubSpot Triggers
 */
const entityFields: Record<string, TriggerField[]> = {
  Contact: [
    { id: 'first_name', label: 'First Name' },
    { id: 'last_name', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'company_name', label: 'Company Name' },
    { id: 'job_title', label: 'Job Title' },
    { id: 'lifecycle_stage', label: 'Lifecycle Stage' },
    { id: 'lead_status', label: 'Lead Status' },
  ],
  Company: [
    { id: 'name', label: 'Name' },
    { id: 'domain', label: 'Domain' },
    { id: 'industry', label: 'Industry' },
    { id: 'phone', label: 'Phone' },
    { id: 'city', label: 'City' },
    { id: 'state', label: 'State' },
    { id: 'annual_revenue', label: 'Annual Revenue' },
    { id: 'number_of_employees', label: 'Number of Employees' },
  ],
  Deal: [
    { id: 'deal_name', label: 'Deal Name' },
    { id: 'amount', label: 'Amount' },
    { id: 'deal_stage', label: 'Deal Stage' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'close_date', label: 'Close Date' },
    { id: 'deal_type', label: 'Deal Type' },
    { id: 'deal_owner', label: 'Deal Owner' },
  ],
}

/**
 * Dynamically constructs the trigger configuration for HubSpot entities
 */
function createTriggerConfig() {
  const entries: TriggerActionConfig[] = []

  const vowels = ['a', 'e', 'i', 'o', 'u']

  for (const [entity, fields] of Object.entries(entityFields)) {
    const article = vowels.includes(entity.toLowerCase()[0]) ? 'an' : 'a'
    const entityLower = entity.toLowerCase()

    const createdConfig: TriggerActionConfig = {
      id: `hubspot-${entityLower}-created`,
      label: `When ${article} ${entity} is Created`,
      payloadAlias: entity,
      hint: `Type in natural language any filters you need. Ex: "If ${entity === 'Contact' ? 'email contains @acme.com' : entity === 'Deal' ? 'amount is greater than 10000' : 'industry is Technology'} get the ${fields[0]?.label?.toLowerCase() || 'name'}"`,
      fields,
      requiredFields: [idField, portalIdField],
    }

    const updatedConfig: TriggerActionConfig = {
      id: `hubspot-${entityLower}-updated`,
      label: `When ${article} ${entity} is Updated`,
      payloadAlias: entity,
      hint: `Type in natural language any filters you need. Ex: "When ${article} ${entityLower} ${entity === 'Deal' ? 'stage changes to Closed Won' : entity === 'Contact' ? 'lifecycle stage changes to Customer' : 'is updated'} get the ${fields[0]?.label?.toLowerCase() || 'name'}"`,
      fields,
      requiredFields: [idField, portalIdField],
    }

    entries.push(createdConfig)
    entries.push(updatedConfig)
  }

  return entries
}

/**
 * Export the generated configuration.
 */
export const hubspotTriggersConfig: TriggerActionConfig[] =
  createTriggerConfig()
