import z from 'zod/v4'

/**
 * The groups that a step can belong to. This allows grouping of different steps
 * that correspond to different actions on the platform (e.g. Salesforce).
 */
export const AgentStepGroupSchema = z.enum([
  'Motion',
  'Salesforce',
  'HubSpot',
  'QuickBooks',
  'Apollo',
  'Gmail',
  'Outlook',
  'SharePoint',
  'Google Sheets',
  'Google Slides',
  'Box',
  'BrandBoss',
  'CoreBridge',
  'FileMaker',
  'Front',
  'Workfront',
  'Google Search',
  'More Integrations',
  'HTTP',
  'HTTP (API Key)',
  'Exa',
  'Slack',
  'Microsoft Teams',
  'L&E',
  'General Utilities',
  'Runtime Files',
])

/**
 * The step platform groups.
 */
export type AgentStepGroup = z.infer<typeof AgentStepGroupSchema>

/**
 * The model visibility options that are used by the FE to control which models
 * are visible in the design surface.
 */
export const agentModelVisibility = [
  'default',
  'only-when-exposed',
  // TODO: Other visibilities?
] as const

/**
 * The key for the integration override when it's targeting the trigger.
 */
export const IntegrationOverrideTriggerKey = 'trigger'
