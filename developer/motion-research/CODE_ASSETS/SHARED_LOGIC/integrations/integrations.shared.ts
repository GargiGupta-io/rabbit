import { isOneOf } from '@motion/utils/array'
import { values } from '@motion/utils/object'

import { z } from 'zod/v3'

/**
 * These are integration platforms that are not actionable by the user.
 */
export const systemIntegrationPlatforms = [
  'motion',
  'motion-meeting-notes',
  'webhook-ingestion',
] as const

export type SystemIntegrationPlatforms =
  (typeof systemIntegrationPlatforms)[number]

/**
 * The list of integration platforms that are internal to Motion
 * and does not use Nango.
 */
export const internalIntegrationPlatforms = [
  'api-secret',
  ...systemIntegrationPlatforms,
] as const

export type InternalIntegrationPlatforms =
  (typeof internalIntegrationPlatforms)[number]

/**
 * 👇 The list of supported integration platforms (register yours here).
 * ('unknown' is used for safe parsing)
 */
export const supportedIntegrationPlatforms = [
  'unknown', // Used for parsing errors
  ...internalIntegrationPlatforms,
  '1password-scim',
  'active-campaign',
  'adobe-umapi',
  'adp',
  'affinity',
  'aircall-basic',
  'airtable-pat',
  'algolia',
  'anrok',
  'apollo',
  'apollo-oauth',
  'appstle-subscriptions',
  'ashby',
  'attio',
  'atlas-so',
  'auth0-cc',
  'avalara',
  'azure-devops',
  'bamboohr-basic',
  'beehiiv',
  'bill',
  'bitdefender',
  'blackbaud-basic',
  'blandai',
  'booking-com',
  'box',
  'braze',
  'brevo-api-key',
  'brex-api-key',
  'brightcrowd',
  'buildium',
  'builtwith',
  'callrail',
  'canny',
  'canva-scim',
  'chargebee',
  'chattermill',
  'checkhq',
  'checkout-com',
  'circle-so',
  'cloudentity',
  'coda',
  'commercetools',
  'companycam',
  'copper-api-key',
  'databricks-account',
  'databricks-workspace',
  'datadog',
  'discourse',
  'dixa',
  'document360',
  'docuware',
  'drupal',
  'e-conomic',
  'emarsys',
  'emarsys-oauth',
  'entrata',
  'evaluagent',
  'exa',
  'falai',
  'figma-scim',
  'findymail',
  'firefish',
  'fireflies',
  'fiserv-api-key',
  'freshdesk',
  'freshsales',
  'freshservice',
  'freshteam',
  'front',
  'gainsight-cc',
  'gem',
  'github-pat',
  'gong',
  'google-mail',
  'google-sheet',
  'google-slides',
  'gorgias-basic',
  'grafana',
  'grain-api-key',
  'greenhouse-assessment',
  'greenhouse-basic',
  'greenhouse-harvest',
  'greenhouse-job-board',
  'greenhouse-onboarding',
  'guru',
  'hubspot',
  'incident-io',
  'insightly',
  'kandji',
  'klaviyo',
  'kustomer',
  'jobvite',
  'jotform',
  'lattice',
  'linkedin',
  'loops-so',
  'luma',
  'mailgun',
  'malwarebytes',
  'medallia',
  'metabase',
  'microsoft-teams',
  'mindbody',
  'miro-scim',
  'mixpanel',
  'namely-pat',
  'next-cloud-ocs',
  'odoo-cc',
  'openai',
  'open-hands',
  'outlook',
  'ory',
  'pandadoc-api-key',
  'paychex',
  'paylocity',
  'pendo',
  'peopledatalabs',
  'perimeter81',
  'personio',
  'personio-recruiting',
  'personio-v2',
  'pingboard',
  'pivotaltracker',
  'plain',
  'posthog',
  'prive',
  'quickbase',
  'quickbooks',
  'ragieai',
  'rapidapi',
  'razorpay',
  'readwise',
  'readwise-reader',
  'recharge',
  'recruitcrm',
  'recruiterflow',
  'refiner',
  'replicate',
  'retell-ai',
  'rippling',
  'rock-gym-pro',
  'rootly',
  'sage-hr',
  'sage-intacct',
  'salesforce',
  'sap-concur',
  'sap-success-factors',
  'scrapedo',
  'sedna-basic',
  'sendgrid',
  'sentry',
  'sharepoint-online',
  'shortcut',
  'slack',
  'smartrecruiters-api-key',
  'snowflake-jwt',
  'spotify-oauth2-cc',
  'supabase',
  'tableau',
  'tapclicks',
  'teamtailor',
  'terraform',
  'thrivecart-api-key',
  'tldv',
  'trafft',
  'trakstar-hire',
  'twenty-crm',
  'twenty-crm-self-hosted',
  'twilio',
  'twitter-v2',
  'typefully',
  'ukg-pro',
  'unanet',
  'unipile',
  'vercel',
  'vimeo-basic',
  'whatsapp-business',
  'woocommerce',
  'workable',
  'workday',
  'xai',
  'xero-oauth2-cc',
  'zoominfo',
  'zuora',
] as const

export type SupportedIntegrationPlatforms =
  (typeof supportedIntegrationPlatforms)[number]

export const IntegrationPlatformSchema = z.enum(supportedIntegrationPlatforms)

/**
 * Valid integration status values.  The `unknown` value is used when parsing from
 * the database value fails.
 */
export const integrationStatus = [
  'unknown', // Used for parsing errors
  'connected',
  'disabled',
  'error',
  'deleted',
] as const

/**
 * The valid values for the integration scope type.  The `unknown` value is used
 * when parsing from the database value fails.
 */
export const integrationScopeType = ['unknown', 'user', 'team'] as const

/**
 * Known integration scope types which excludes the `unknown` value.
 */
export type KnownIntegrationScopeType = Exclude<
  (typeof integrationScopeType)[number],
  'unknown'
>

/**
 * Known integration platforms which excludes the `unknown` value.
 */
export type KnownIntegrationPlatforms = Exclude<
  SupportedIntegrationPlatforms,
  'unknown'
>

/**
 * Checks if the platform is a known integration platform, which excludes the
 * `unknown` value.
 * @param platform The platform to check.
 * @returns True if the platform is a known integration platform, false otherwise.
 */
export function isKnownIntegrationPlatform(
  platform: string | null | undefined
): platform is KnownIntegrationPlatforms {
  if (platform === 'unknown') {
    return false
  }

  return isOneOf(platform, supportedIntegrationPlatforms)
}

export type NangoSupportedIntegrationPlatforms = Exclude<
  KnownIntegrationPlatforms,
  'api-secret' | 'motion' | 'motion-meeting-notes' | 'webhook-ingestion'
>

/**
 * Use this function to check whether an integration platform is supported by
 * Nango.
 */
export function isNangoSupportedIntegrationPlatform(
  platform: string | null | undefined
): platform is NangoSupportedIntegrationPlatforms {
  if (!isKnownIntegrationPlatform(platform)) {
    return false
  }

  return !isOneOf(platform, internalIntegrationPlatforms)
}

export function isInternalIntegrationPlatform(
  platform: string | null | undefined
): platform is InternalIntegrationPlatforms {
  if (!isKnownIntegrationPlatform(platform)) {
    return false
  }

  return isOneOf(platform, internalIntegrationPlatforms)
}

/**
 * Use this function to check whether an integration platform is a system integration platform.
 *
 * System integration platforms are internal to Motion and are not actionable by the user.
 *
 * @param platform The platform to check.
 * @returns True if the platform is a system integration platform, false otherwise.
 */
export function isSystemIntegrationPlatform(
  platform: string | null | undefined
): platform is SystemIntegrationPlatforms {
  if (!isKnownIntegrationPlatform(platform)) {
    return false
  }

  return isOneOf(platform, systemIntegrationPlatforms)
}

/**
 * Type for the integration platform listing (available options for integrations)
 */
export type IntegrationConfigPlatformListing = {
  /**
   * The integration platform.
   */
  platform: KnownIntegrationPlatforms
  /**
   * A friendly display name for the integration platform.
   */
  displayName: string
  /**
   * A brief description of the integration platform.
   */
  description: string
}

/**
 * A list of pre-configured integrations that are available to the user.
 *
 * NOTE: Move these out if we ever want to manage these directly on BE, but that
 * is not likely the case since these are purely for display in the FE.
 */
export const preConfiguredIntegrationsPlatforms: Record<
  KnownIntegrationPlatforms,
  IntegrationConfigPlatformListing
> = {
  'api-secret': {
    platform: 'api-secret',
    displayName: 'API Keys',
    description: 'API keys are used for the HTTP block in AI Employee skills.',
  },
  motion: {
    platform: 'motion',
    displayName: 'Motion',
    description: 'Motion is the internal integration platform for Motion.',
  },
  'motion-meeting-notes': {
    platform: 'motion-meeting-notes',
    displayName: 'Motion Meeting Notes',
    description:
      'Motion Meeting Notes is the internal integration platform for Motion Meeting Notes.',
  },
  hubspot: {
    platform: 'hubspot',
    displayName: 'HubSpot',
    description: 'Read data from your HubSpot CRM and keep it up to date.',
  },
  salesforce: {
    platform: 'salesforce',
    displayName: 'Salesforce',
    description:
      'Update leads and opportunities, sync tasks, and keep CRM data up to date automatically.',
  },
  'google-mail': {
    platform: 'google-mail',
    displayName: 'Gmail',
    description:
      'Automatically draft and send emails, organize emails, and more.',
  },
  'google-sheet': {
    platform: 'google-sheet',
    displayName: 'Google Sheets',
    description:
      'Read, write, update, and manage spreadsheet data programmatically.',
  },
  'google-slides': {
    platform: 'google-slides',
    displayName: 'Google Slides',
    description:
      'Create presentations from templates and replace placeholder text to automate presentation generation.',
  },
  'microsoft-teams': {
    platform: 'microsoft-teams',
    displayName: 'Microsoft Teams',
    description:
      'Post messages to channels, share updates, and collaborate with your team more efficiently.',
  },
  slack: {
    platform: 'slack',
    displayName: 'Slack',
    description:
      'Send messages to channels or teammates, post updates, and keep your team in the loop.',
  },
  anrok: {
    platform: 'anrok',
    displayName: 'Anrok',
    description:
      'Automate tax compliance and reporting with seamless integration to your workflow.',
  },
  'github-pat': {
    platform: 'github-pat',
    displayName: 'Github (Personal Access Token)',
    description:
      'Automate repository management, issue tracking, and code collaboration workflows.',
  },
  mailgun: {
    platform: 'mailgun',
    displayName: 'Mailgun',
    description:
      'Automate email sending, track delivery, and manage email campaigns programmatically.',
  },
  metabase: {
    platform: 'metabase',
    displayName: 'Metabase',
    description:
      'Automate data analysis, generate reports, and share insights with your team.',
  },
  'pandadoc-api-key': {
    platform: 'pandadoc-api-key',
    displayName: 'Pandadoc',
    description:
      'Automate document creation, e-signature workflows, and contract management processes.',
  },
  posthog: {
    platform: 'posthog',
    displayName: 'PostHog',
    description:
      'Automate product analytics, track user behavior, and generate insights from your data.',
  },
  rootly: {
    platform: 'rootly',
    displayName: 'Rootly',
    description:
      'Automate incident response, manage runbooks, and streamline incident management workflows.',
  },
  '1password-scim': {
    platform: '1password-scim',
    displayName: '1password',
    description:
      'Automate organizing passwords and secrets, and manage user provisioning via SCIM.',
  },
  'active-campaign': {
    platform: 'active-campaign',
    displayName: 'ActiveCampaign',
    description:
      'Automate leads, sales, and customer management for your ActiveCampaign CRM.',
  },
  'adobe-umapi': {
    platform: 'adobe-umapi',
    displayName: 'Adobe User Management',
    description:
      'Automate user management for your Adobe teams and products from within Motion.',
  },
  adp: {
    platform: 'adp',
    displayName: 'ADP',
    description:
      'Manage payroll, employee onboarding, and HR for ADP from within Motion.',
  },
  affinity: {
    platform: 'affinity',
    displayName: 'Affinity',
    description:
      'Automate Affinity CRM management, lead tracking, and synchronization from within Motion.',
  },
  'aircall-basic': {
    platform: 'aircall-basic',
    displayName: 'Aircall',
    description:
      'Automate business phone calling solutions from within Motion.',
  },
  'airtable-pat': {
    platform: 'airtable-pat',
    displayName: 'Airtable',
    description:
      'Automate record creation, updates, and table management within your Airtable bases.',
  },
  algolia: {
    platform: 'algolia',
    displayName: 'Algolia',
    description:
      'Automate indexing, customize search experiences, and manage your Algolia search data.',
  },
  apollo: {
    platform: 'apollo',
    displayName: 'Apollo (Legacy)',
    description:
      'Legacy Apollo integration - use apollo-oauth for new connections',
  },
  'apollo-oauth': {
    platform: 'apollo-oauth',
    displayName: 'Apollo',
    description:
      'Automate sales intelligence, lead generation, and contact enrichment with Apollo via OAuth authentication',
  },
  'appstle-subscriptions': {
    platform: 'appstle-subscriptions',
    displayName: 'Appstle Subscriptions',
    description:
      'Manage subscriptions for your Shopify store right from within Motion.',
  },
  ashby: {
    platform: 'ashby',
    displayName: 'Ashby',
    description:
      'Automate referring candidates, tracking down leads, and scheduling interviews for Ashby.',
  },
  'atlas-so': {
    platform: 'atlas-so',
    displayName: 'Atlas.so',
    description:
      'Automate ticket tracking, customer support, and NPS ratings for Atlas.',
  },
  attio: {
    platform: 'attio',
    displayName: 'Attio',
    description:
      'Automate managing deals and sales pipelines with the Attio Motion integration.',
  },
  'auth0-cc': {
    platform: 'auth0-cc',
    displayName: 'Auth0',
    description:
      'Automate user management, authentication flows, and identity provider configurations.',
  },
  avalara: {
    platform: 'avalara',
    displayName: 'Avalara',
    description: 'Automate sales tax compliance globally for Avalara.',
  },
  'azure-devops': {
    platform: 'azure-devops',
    displayName: 'Azure Devops',
    description:
      'Automate work item tracking, build and release pipelines, and manage Azure DevOps projects.',
  },
  'bamboohr-basic': {
    platform: 'bamboohr-basic',
    displayName: 'BambooHR',
    description: 'Automate HR management via Bamboo from within Motion.',
  },
  beehiiv: {
    platform: 'beehiiv',
    displayName: 'Beehiiv',
    description: 'Automate audience and content management for creators.',
  },
  bill: {
    platform: 'bill',
    displayName: 'Bill (Connect API)',
    description:
      'Automate accounts payable and receivable, manage invoices, and streamline payment workflows.',
  },
  bitdefender: {
    platform: 'bitdefender',
    displayName: 'Bitdefender',
    description:
      'Automate cybersecurity operations like CVE detection, threat mitigation, and access control.',
  },
  'blackbaud-basic': {
    platform: 'blackbaud-basic',
    displayName: 'Blackbaud',
    description: 'Manage your nonprofit Blackbaud account from within Motion.',
  },
  blandai: {
    platform: 'blandai',
    displayName: 'BlandAI',
    description: 'Automate outbound cold calling, right from within Motion.',
  },
  'booking-com': {
    platform: 'booking-com',
    displayName: 'Booking.com',
    description: 'Create and manage your Booking.com bookings.',
  },
  braze: {
    platform: 'braze',
    displayName: 'Braze',
    description:
      'Manage customer engagement, support issues, and marketing via Braze, from within Motion.',
  },
  'brevo-api-key': {
    platform: 'brevo-api-key',
    displayName: 'Brevo',
    description:
      'Automate email marketing, manage contacts, send transactional emails, and manage SMS campaigns.',
  },
  'brex-api-key': {
    platform: 'brex-api-key',
    displayName: 'Brex',
    description:
      'Automate expense management and financial operations for Brex from within Motion.',
  },
  brightcrowd: {
    platform: 'brightcrowd',
    displayName: 'BrightCrowd',
    description: 'Manage your student and alumni network for BrightCrowd.',
  },
  buildium: {
    platform: 'buildium',
    displayName: 'Buildium',
    description: 'Manage your rental listings and tenants.',
  },
  builtwith: {
    platform: 'builtwith',
    displayName: 'BuiltWith',
    description:
      'Analyze technology choices for thousands of ecommerce companies.',
  },
  callrail: {
    platform: 'callrail',
    displayName: 'CallRail',
    description:
      'Automatically track all sales and customer calls to detect opportunities.',
  },
  canny: {
    platform: 'canny',
    displayName: 'Canny',
    description: 'Automate user feedback management.',
  },
  'canva-scim': {
    platform: 'canva-scim',
    displayName: 'Canva',
    description:
      'Automate user provisioning and team management for your Canva organization via SCIM.',
  },
  chargebee: {
    platform: 'chargebee',
    displayName: 'Chargebee',
    description:
      'Automate subscription billing, manage customer lifecycles, and handle recurring payments.',
  },
  chattermill: {
    platform: 'chattermill',
    displayName: 'ChatterMill',
    description:
      'Analyze support tickets and convert them into revenue opportunities.',
  },
  checkhq: {
    platform: 'checkhq',
    displayName: 'CheckHQ',
    description:
      'Automate tedious accounting operations and stay in compliance.',
  },
  'checkout-com': {
    platform: 'checkout-com',
    displayName: 'Checkout.com',
    description: "Automate your ecommerce store's checkout experience.",
  },
  'circle-so': {
    platform: 'circle-so',
    displayName: 'Circle.so',
    description:
      'Automate community management, course development, and event planning.',
  },
  cloudentity: {
    platform: 'cloudentity',
    displayName: 'Cloudentity',
    description:
      'Manage and enforce fine-grained authorization policies for your applications and APIs.',
  },
  coda: {
    platform: 'coda',
    displayName: 'Coda',
    description:
      'Automate workflows within your Coda docs, manage data, and connect to other tools.',
  },
  commercetools: {
    platform: 'commercetools',
    displayName: 'Commercetools',
    description:
      'Automate e-commerce operations, manage product catalogs, and process orders on a headless platform.',
  },
  companycam: {
    platform: 'companycam',
    displayName: 'Companycam',
    description:
      'Streamline photo documentation, manage project visuals, and share updates from the field.',
  },
  'copper-api-key': {
    platform: 'copper-api-key',
    displayName: 'Copper',
    description:
      'Automate CRM tasks, manage customer relationships, and sync data, especially with Google Workspace.',
  },
  'databricks-account': {
    platform: 'databricks-account',
    displayName: 'Databricks (Account Management)',
    description:
      'Automate team membership and access levels via the Databricks account management API.',
  },
  'databricks-workspace': {
    platform: 'databricks-workspace',
    displayName: 'Databricks (Workspace Management)',
    description: 'Automate your databricks workspaces.',
  },
  datadog: {
    platform: 'datadog',
    displayName: 'Datadog',
    description:
      'Automate alerting, error management, and telemetry operations.',
  },
  discourse: {
    platform: 'discourse',
    displayName: 'Discourse',
    description:
      'Automate forum management, moderate discussions, and engage with your online community.',
  },
  dixa: {
    platform: 'dixa',
    displayName: 'Dixa',
    description:
      'Automate customer service workflows, manage conversations across channels, and improve agent productivity.',
  },
  document360: {
    platform: 'document360',
    displayName: 'Document360',
    description: 'Manage your company knowledgebase from within Motion.',
  },
  docuware: {
    platform: 'docuware',
    displayName: 'Docuware',
    description:
      'Automate document management and workflow creation from Motion.',
  },
  drupal: {
    platform: 'drupal',
    displayName: 'Drupal',
    description: 'Automate content management in Drupal.',
  },
  'e-conomic': {
    platform: 'e-conomic',
    displayName: 'E-conomic',
    description:
      'Automate accounting processes, manage invoicing, and track financial data for your business.',
  },
  emarsys: {
    platform: 'emarsys',
    displayName: 'Emarsys',
    description:
      'Automate omnichannel customer engagement, personalize marketing campaigns, and analyze customer data.',
  },
  'emarsys-oauth': {
    platform: 'emarsys-oauth',
    displayName: 'Emarsys Oauth',
    description:
      'Automate omnichannel customer engagement and marketing campaigns securely via OAuth.',
  },
  entrata: {
    platform: 'entrata',
    displayName: 'Entrata',
    description:
      'Automate property management tasks, manage leases, and streamline resident communications.',
  },
  evaluagent: {
    platform: 'evaluagent',
    displayName: 'Evaluagent',
    description:
      'Automate quality assurance for customer interactions and improve agent performance in contact centers.',
  },
  exa: {
    platform: 'exa',
    displayName: 'Exa',
    description:
      'Leverage AI-powered search to find information, answer questions, and automate research tasks.',
  },
  falai: {
    platform: 'falai',
    displayName: 'Fal.ai',
    description: 'Automate media creation via generative AI.',
  },
  'figma-scim': {
    platform: 'figma-scim',
    displayName: 'Figma',
    description:
      'Automate user provisioning and manage team access for your Figma organization via SCIM.',
  },
  findymail: {
    platform: 'findymail',
    displayName: 'Findymail',
    description:
      'Automate email discovery and verification to enhance your sales and marketing outreach.',
  },
  firefish: {
    platform: 'firefish',
    displayName: 'Firefish',
    description:
      'Automate candidate creation, lead tracking, and interview scheduling in Firefish CRM.',
  },
  fireflies: {
    platform: 'fireflies',
    displayName: 'Fireflies',
    description:
      'Process audio, automatically create transcripts, and extract action items.',
  },
  'fiserv-api-key': {
    platform: 'fiserv-api-key',
    displayName: 'Fiserv',
    description:
      'Automate financial transactions, manage payments, and integrate banking services.',
  },
  freshdesk: {
    platform: 'freshdesk',
    displayName: 'FreshDesk',
    description:
      'Automate support desk operations for companies using the fresh platform.',
  },
  freshsales: {
    platform: 'freshsales',
    displayName: 'Freshsales',
    description:
      'Automate CRM operations for companies using the fresh platform.',
  },
  freshservice: {
    platform: 'freshservice',
    displayName: 'FreshService',
    description: 'Automate support for companies using the fresh platform.',
  },
  freshteam: {
    platform: 'freshteam',
    displayName: 'FreshTeam',
    description:
      'Automate team management for companies using the fresh platform.',
  },
  front: {
    platform: 'front',
    displayName: 'Front',
    description:
      'Automate customer service operations with conversation management, team collaboration, and messaging workflows.',
  },
  'gainsight-cc': {
    platform: 'gainsight-cc',
    displayName: 'Gainsight CC',
    description:
      'Automate call center operations, analytics, and action items.',
  },
  gem: {
    platform: 'gem',
    displayName: 'Gem',
    description:
      'Automate recruiting workflows, manage candidate pipelines, and enhance talent acquisition.',
  },
  gong: {
    platform: 'gong',
    displayName: 'Gong',
    description:
      'Analyze sales calls, talk time, and action items from Gong inside of Motion.',
  },
  'gorgias-basic': {
    platform: 'gorgias-basic',
    displayName: 'Gorgias',
    description: 'Manage your e-commerce store with Conversational AI.',
  },
  grafana: {
    platform: 'grafana',
    displayName: 'Grafana',
    description:
      'Automate data visualization, monitor systems, and create dashboards for analytics and alerting.',
  },
  'grain-api-key': {
    platform: 'grain-api-key',
    displayName: 'Grain',
    description: 'AI meeting recorder that generates action items.',
  },
  'greenhouse-assessment': {
    platform: 'greenhouse-assessment',
    displayName: 'Greenhouse (Assessment)',
    description: 'Automate managing assessments for Greenhouse ATS',
  },
  'greenhouse-basic': {
    platform: 'greenhouse-basic',
    displayName: 'Greenhouse',
    description: 'Automate managing general Greenhouse operations.',
  },
  'greenhouse-harvest': {
    platform: 'greenhouse-harvest',
    displayName: 'Greenhouse (Harvest)',
    description: 'Automate harvest operations in Greenhouse.',
  },
  'greenhouse-job-board': {
    platform: 'greenhouse-job-board',
    displayName: 'Greenhouse (Job Board)',
    description: 'Create and manage open jobs in Greenhouse.',
  },
  'greenhouse-onboarding': {
    platform: 'greenhouse-onboarding',
    displayName: 'Greenhouse (Onboarding)',
    description: 'Manage onboardings in Greenhouse.',
  },
  guru: {
    platform: 'guru',
    displayName: 'Guru',
    description: 'Manage your Guru knowledgebase from Motion.',
  },
  'incident-io': {
    platform: 'incident-io',
    displayName: 'Incident Io',
    description:
      'Automate incident response, manage on-call schedules, and streamline communication during outages.',
  },
  insightly: {
    platform: 'insightly',
    displayName: 'Insightly',
    description:
      'Automate CRM processes, manage customer relationships, and track project progress.',
  },
  jobvite: {
    platform: 'jobvite',
    displayName: 'Jobvite',
    description: 'Automate hiring with Jobvite.',
  },
  jotform: {
    platform: 'jotform',
    displayName: 'Jotform',
    description: 'Automate forms and surveys in Jotform.',
  },
  kandji: {
    platform: 'kandji',
    displayName: 'Kandji',
    description: 'Manage Apple devices and access with Kandji.',
  },
  klaviyo: {
    platform: 'klaviyo',
    displayName: 'Klaviyo',
    description:
      'Automate email and SMS marketing, personalize customer journeys, and grow your e-commerce business.',
  },
  kustomer: {
    platform: 'kustomer',
    displayName: 'Kustomer',
    description: 'Automate Kustomer CRM management from within Motion.',
  },
  lattice: {
    platform: 'lattice',
    displayName: 'Lattice',
    description:
      'Automate performance management, track goals, and enhance employee engagement.',
  },
  linkedin: {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    description:
      'Manage LinkedIn posts, impressions, and leads straight from within Motion.',
  },
  'loops-so': {
    platform: 'loops-so',
    displayName: 'Loops So',
    description:
      'Automate email campaigns, manage audience engagement, and send targeted communications for SaaS.',
  },
  luma: {
    platform: 'luma',
    displayName: 'Luma',
    description:
      'Automate event management, host virtual and in-person events, and engage your community.',
  },
  malwarebytes: {
    platform: 'malwarebytes',
    displayName: 'Malwarebytes',
    description:
      'Automate endpoint security, manage threat detection, and protect against malware.',
  },
  medallia: {
    platform: 'medallia',
    displayName: 'Medallia',
    description:
      'Automate customer feedback collection, analyze experience data, and improve customer satisfaction.',
  },
  mindbody: {
    platform: 'mindbody',
    displayName: 'Mindbody',
    description:
      'Automate scheduling, client management, and payments for fitness and wellness businesses.',
  },
  'miro-scim': {
    platform: 'miro-scim',
    displayName: 'Miro',
    description:
      'Automate user provisioning and manage team access for your Miro collaborative whiteboards via SCIM.',
  },
  mixpanel: {
    platform: 'mixpanel',
    displayName: 'Mixpanel',
    description:
      'Automate product analytics, track user behavior, and gain insights to improve your product.',
  },
  'next-cloud-ocs': {
    platform: 'next-cloud-ocs',
    displayName: 'Next Cloud Ocs',
    description:
      'Automate file management, sync user data, and extend your Nextcloud collaboration platform.',
  },
  'odoo-cc': {
    platform: 'odoo-cc',
    displayName: 'Odoo',
    description:
      'Automate business processes across CRM, ERP, accounting, and more with Odoo business apps.',
  },
  openai: {
    platform: 'openai',
    displayName: 'Openai',
    description:
      'Automate openai LLM usage, generate text, and integrate AI capabilities into Motion workflows.',
  },
  outlook: {
    platform: 'outlook',
    displayName: 'Outlook',
    description:
      'Automate email management, schedule meetings, and organize your Outlook calendar and contacts.',
  },
  paychex: {
    platform: 'paychex',
    displayName: 'Paychex',
    description:
      'Automate payroll processing, manage HR tasks, and streamline employee benefits administration.',
  },
  quickbase: {
    platform: 'quickbase',
    displayName: 'Quickbase',
    description:
      'Automate workflows in your Quickbase applications, manage data, and connect custom low-code apps.',
  },
  quickbooks: {
    platform: 'quickbooks',
    displayName: 'QuickBooks Online',
    description:
      'Manage accounting, invoicing, bills, payments, and financial reporting for your business.',
  },
  recruiterflow: {
    platform: 'recruiterflow',
    displayName: 'Recruiterflow',
    description:
      'Automate applicant tracking, manage candidate pipelines, and streamline your recruitment process.',
  },
  replicate: {
    platform: 'replicate',
    displayName: 'Replicate',
    description:
      'Automate machine learning model deployment, run AI tasks, and integrate AI into your applications.',
  },
  rippling: {
    platform: 'rippling',
    displayName: 'Rippling',
    description:
      'Automate employee onboarding, manage payroll and benefits, and streamline HR and IT operations.',
  },
  'rock-gym-pro': {
    platform: 'rock-gym-pro',
    displayName: 'Rock Gym Pro',
    description:
      'Automate gym management, member check-ins, and class scheduling for climbing facilities.',
  },
  'sap-concur': {
    platform: 'sap-concur',
    displayName: 'Sap Concur',
    description:
      'Automate travel booking, expense reporting, and invoice management.',
  },
  'sap-success-factors': {
    platform: 'sap-success-factors',
    displayName: 'Sap Success Factors',
    description:
      'Automate HR processes, manage talent, and streamline workforce planning with SAP SuccessFactors.',
  },
  'sedna-basic': {
    platform: 'sedna-basic',
    displayName: 'Sedna',
    description:
      'Streamline team communication, manage shared inboxes for high-volume email, and automate messaging workflows.',
  },
  sendgrid: {
    platform: 'sendgrid',
    displayName: 'Sendgrid',
    description:
      'Automate email sending for transactional and marketing purposes, and track email deliverability.',
  },
  sentry: {
    platform: 'sentry',
    displayName: 'Sentry',
    description:
      'Automate error tracking, monitor application performance, and get insights into software bugs.',
  },
  box: {
    platform: 'box',
    displayName: 'Box',
    description:
      'Manage files, folders, and collaborate securely with enterprise cloud storage. Copy templates, share files, and automate document workflows.',
  },
  'sharepoint-online': {
    platform: 'sharepoint-online',
    displayName: 'SharePoint',
    description:
      'Access and manage SharePoint lists, documents, and sites to automate content workflows.',
  },
  shortcut: {
    platform: 'shortcut',
    displayName: 'Shortcut',
    description:
      'Automate software project management, track issues, and collaborate on development workflows.',
  },
  'smartrecruiters-api-key': {
    platform: 'smartrecruiters-api-key',
    displayName: 'Smartrecruiters',
    description:
      'Automate recruitment processes, manage job postings, and track candidates effectively using API key access.',
  },
  'spotify-oauth2-cc': {
    platform: 'spotify-oauth2-cc',
    displayName: 'Spotify',
    description:
      'Automate playlist creation, manage music libraries, and access Spotify song data.',
  },
  tapclicks: {
    platform: 'tapclicks',
    displayName: 'Tapclicks',
    description:
      'Automate marketing data aggregation, generate reports, and analyze campaign performance across channels.',
  },
  twilio: {
    platform: 'twilio',
    displayName: 'Twilio',
    description:
      'Automate communications via SMS, voice, and video, and build custom messaging workflows.',
  },
  'ukg-pro': {
    platform: 'ukg-pro',
    displayName: 'Ukg Pro',
    description:
      'Automate HR, payroll, and workforce management tasks to optimize your human capital.',
  },
  unanet: {
    platform: 'unanet',
    displayName: 'Unanet',
    description:
      'Automate project-based ERP and PSA, manage resources, and track project financials for GovCon and A&E firms.',
  },
  'vimeo-basic': {
    platform: 'vimeo-basic',
    displayName: 'Vimeo Basic',
    description:
      'Automate video uploads, manage your video library, and share content seamlessly.',
  },
  'whatsapp-business': {
    platform: 'whatsapp-business',
    displayName: 'Whatsapp Business',
    description:
      'Automate customer communication, send notifications, and manage conversations on WhatsApp Business.',
  },
  workday: {
    platform: 'workday',
    displayName: 'Workday',
    description:
      'Automate financial management, human capital management, and enterprise planning processes.',
  },
  xai: {
    platform: 'xai',
    displayName: 'Xai',
    description:
      "Integrate and automate workflows with Xai's artificial intelligence models and services.",
  },
  'xero-oauth2-cc': {
    platform: 'xero-oauth2-cc',
    displayName: 'Xero',
    description:
      'Automate accounting tasks, manage invoices and expenses, and sync financial data with Xero.',
  },
  'namely-pat': {
    platform: 'namely-pat',
    displayName: 'Namely',
    description:
      'Automate HR processes, manage payroll, benefits, and employee data in one unified platform.',
  },
  'open-hands': {
    platform: 'open-hands',
    displayName: 'Open Hands',
    description:
      'Automate AI-powered coding assistance and collaborate on software development projects.',
  },
  ory: {
    platform: 'ory',
    displayName: 'Ory',
    description:
      'Automate identity management, authentication, and authorization for modern applications.',
  },
  paylocity: {
    platform: 'paylocity',
    displayName: 'Paylocity',
    description:
      'Automate payroll processing, HR management, and workforce insights for your organization.',
  },
  pendo: {
    platform: 'pendo',
    displayName: 'Pendo',
    description:
      'Automate product analytics, in-app guides, and user feedback to improve digital experiences.',
  },
  peopledatalabs: {
    platform: 'peopledatalabs',
    displayName: 'People Data Labs',
    description:
      'Enrich contact data, verify emails, and access comprehensive people and company information.',
  },
  perimeter81: {
    platform: 'perimeter81',
    displayName: 'Perimeter81',
    description:
      'Automate secure network access, manage VPN connections, and protect cloud resources.',
  },
  personio: {
    platform: 'personio',
    displayName: 'Personio v1',
    description:
      'Automate HR processes including recruiting, onboarding, and employee management.',
  },
  'personio-recruiting': {
    platform: 'personio-recruiting',
    displayName: 'Personio Recruiting',
    description:
      'Streamline recruitment workflows, manage applicants, and automate hiring processes.',
  },
  'personio-v2': {
    platform: 'personio-v2',
    displayName: 'Personio v2',
    description:
      'Enhanced HR automation with advanced features for employee management and payroll.',
  },
  pingboard: {
    platform: 'pingboard',
    displayName: 'Pingboard',
    description:
      'Automate org chart management, employee directories, and team collaboration.',
  },
  pivotaltracker: {
    platform: 'pivotaltracker',
    displayName: 'Pivotaltracker',
    description:
      'Automate agile project management, track user stories, and manage software development workflows.',
  },
  plain: {
    platform: 'plain',
    displayName: 'Plain',
    description:
      'Automate customer support workflows with AI-powered helpdesk capabilities.',
  },
  prive: {
    platform: 'prive',
    displayName: 'Prive',
    description:
      'Automate subscription management and monetize your content or services.',
  },
  ragieai: {
    platform: 'ragieai',
    displayName: 'Ragieai',
    description:
      'Build and deploy RAG (Retrieval-Augmented Generation) applications with AI-powered search.',
  },
  rapidapi: {
    platform: 'rapidapi',
    displayName: 'RapidAPI',
    description:
      'Access thousands of APIs and automate integrations with external services.',
  },
  razorpay: {
    platform: 'razorpay',
    displayName: 'RazorPay',
    description:
      'Automate payment processing, manage subscriptions, and handle financial transactions.',
  },
  readwise: {
    platform: 'readwise',
    displayName: 'Readwise',
    description:
      'Sync and organize your reading highlights from books, articles, and podcasts.',
  },
  'readwise-reader': {
    platform: 'readwise-reader',
    displayName: 'Readwise Reader',
    description:
      'Automate content curation, manage your reading list, and sync annotations across devices.',
  },
  recharge: {
    platform: 'recharge',
    displayName: 'Recharge',
    description:
      'Automate subscription commerce, manage recurring billing, and grow your subscription business.',
  },
  recruitcrm: {
    platform: 'recruitcrm',
    displayName: 'RecruitCRM',
    description:
      'Automate recruitment workflows, manage candidate pipelines, and streamline hiring processes.',
  },
  refiner: {
    platform: 'refiner',
    displayName: 'Refiner',
    description:
      'Automate user surveys, collect feedback, and measure customer satisfaction.',
  },
  'retell-ai': {
    platform: 'retell-ai',
    displayName: 'Retell.ai',
    description:
      'Build conversational AI agents for voice calls and automate customer interactions.',
  },
  'sage-hr': {
    platform: 'sage-hr',
    displayName: 'Sage HR',
    description:
      'Automate HR management, track employee performance, and manage leave requests.',
  },
  'sage-intacct': {
    platform: 'sage-intacct',
    displayName: 'Sage Intacct',
    description:
      'Automate financial management, accounting workflows, and generate financial reports.',
  },
  scrapedo: {
    platform: 'scrapedo',
    displayName: 'Scrape.do',
    description:
      'Automate web scraping tasks and extract data from websites at scale.',
  },
  'snowflake-jwt': {
    platform: 'snowflake-jwt',
    displayName: 'Snowflake',
    description:
      'Automate data warehouse operations, run analytics queries, and manage cloud data.',
  },
  supabase: {
    platform: 'supabase',
    displayName: 'Supabase',
    description:
      'Automate backend operations with open-source Firebase alternative for database and auth.',
  },
  tableau: {
    platform: 'tableau',
    displayName: 'Tableau',
    description:
      'Automate data visualization, refresh dashboards, and share business intelligence insights.',
  },
  teamtailor: {
    platform: 'teamtailor',
    displayName: 'Teamtailor',
    description:
      'Automate recruitment marketing, manage job postings, and enhance candidate experience.',
  },
  terraform: {
    platform: 'terraform',
    displayName: 'Terraform',
    description:
      'Automate infrastructure provisioning and manage cloud resources as code.',
  },
  'thrivecart-api-key': {
    platform: 'thrivecart-api-key',
    displayName: 'Thrivecart',
    description:
      'Automate shopping cart operations, manage sales funnels, and process payments.',
  },
  tldv: {
    platform: 'tldv',
    displayName: 'tl;dv',
    description:
      'Record, transcribe, and summarize meetings with AI-powered insights.',
  },
  trafft: {
    platform: 'trafft',
    displayName: 'Trafft',
    description:
      'Automate appointment booking, manage schedules, and streamline service-based businesses.',
  },
  'trakstar-hire': {
    platform: 'trakstar-hire',
    displayName: 'Trakstar Hire',
    description:
      'Automate applicant tracking, streamline hiring workflows, and manage recruitment.',
  },
  'twenty-crm': {
    platform: 'twenty-crm',
    displayName: 'Twenty CRM',
    description:
      'Open-source CRM to automate customer relationships and sales processes.',
  },
  'twenty-crm-self-hosted': {
    platform: 'twenty-crm-self-hosted',
    displayName: 'Twenty CRM (Self Hosted)',
    description:
      'Self-hosted open-source CRM for complete control over customer data and workflows.',
  },
  'twitter-v2': {
    platform: 'twitter-v2',
    displayName: 'Twitter (v2 API)',
    description:
      'Manage posting and re-posting content onto Twitter, directly from Motion.',
  },
  typefully: {
    platform: 'typefully',
    displayName: 'Typefully',
    description:
      'Automate social media content creation, schedule posts, and grow your audience.',
  },
  unipile: {
    platform: 'unipile',
    displayName: 'Unipile',
    description:
      'Unified API to automate messaging across multiple platforms and channels.',
  },
  vercel: {
    platform: 'vercel',
    displayName: 'Vercel',
    description:
      'Automate deployments, manage serverless functions, and scale web applications.',
  },
  woocommerce: {
    platform: 'woocommerce',
    displayName: 'Woocommerce',
    description:
      'Automate e-commerce operations, manage products, orders, and inventory for WordPress stores.',
  },
  workable: {
    platform: 'workable',
    displayName: 'Workable',
    description:
      'Automate recruitment processes, post jobs, and collaborate on hiring decisions.',
  },
  zoominfo: {
    platform: 'zoominfo',
    displayName: 'ZoomInfo',
    description:
      'Access B2B contact data, enrich leads, and automate sales intelligence workflows.',
  },
  zuora: {
    platform: 'zuora',
    displayName: 'Zuora',
    description:
      'Automate subscription billing, manage recurring revenue, and handle complex pricing models.',
  },
  'webhook-ingestion': {
    platform: 'webhook-ingestion',
    displayName: 'Webhooks',
    description:
      'Receive and process webhook events from any external system or service.',
  },
}

/**
 * Returns a list of integration platforms that are not configured (exclusive of
 * the configured platforms)
 * @param configuredPlatforms The list of platforms which are already configured
 */
export function resolveUnconfiguredIntegrationPlatforms(
  configuredPlatforms: (typeof supportedIntegrationPlatforms)[number][]
) {
  return values(preConfiguredIntegrationsPlatforms).filter(
    (integrationOption) =>
      !configuredPlatforms.includes(
        integrationOption.platform as KnownIntegrationPlatforms
      )
  )
}
