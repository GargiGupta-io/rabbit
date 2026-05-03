import { isOneOf } from '@motion/utils/array'
import { FeatureTier } from '@motion/zod/client'

import { type Tier } from './types'

export const basicTier: Tier = 'BASIC'
export const proTier: Tier = 'PRO'
export const proPlusTier: Tier = 'PROPLUS'
export const proAITier: Tier = 'PROAI'
export const enterpriseTier: Tier = 'ENTERPRISE'
export const businessTier: Tier = 'BUSINESS'
export const businessPlusTier: Tier = 'BUSINESSPLUS'
export const businessAITier: Tier = 'BUSINESSAI'
export const aiWorkplaceTier: Tier = 'AIWORKPLACE'
export const aiEmployeesTier: Tier = 'AIEMPLOYEES'
export const aiBusinessExperimentalTier: Tier = 'AIBUSINESS_EXPERIMENTAL'
export const aiWorkplaceCreditsTier: Tier = 'AIWORKPLACE_CREDITS'
export const aiEmployeesLightCreditsTier: Tier = 'AIEMPLOYEES_LIGHT_CREDITS'
export const aiEmployeesStandardCreditsTier: Tier =
  'AIEMPLOYEES_STANDARD_CREDITS'
export const aiEmployeesPlusCreditsTier: Tier = 'AIEMPLOYEES_PLUS_CREDITS'
export const aiEmployeesBusinessCreditsTier: Tier =
  'AIEMPLOYEES_BUSINESS_CREDITS'
export const aiWorkplacePlusCreditsTier: Tier = 'AIWORKPLACE_PLUS_CREDITS'
export const aiEmployeesStarterCreditsTier: Tier = 'AIEMPLOYEES_STARTER_CREDITS'
export const aiEmployeesBasicCreditsTier: Tier = 'AIEMPLOYEES_BASIC_CREDITS'
export const aiWorkplaceLightCreditsTier: Tier = 'AIWORKPLACE_LIGHT_CREDITS'

export const BASE_ORDERED_TIERS: Tier[] = [
  proAITier,
  businessAITier,
  enterpriseTier,
]

/**
 * Ordered tiers for credit-based tiers that are actively being offered to users
 */
export const CREDIT_TIER_ORDERED_TIERS: Tier[] = [
  aiWorkplaceCreditsTier,
  aiEmployeesStarterCreditsTier,
  aiEmployeesLightCreditsTier,
  aiEmployeesBasicCreditsTier,
  aiEmployeesStandardCreditsTier,
  aiEmployeesPlusCreditsTier,
  aiEmployeesBusinessCreditsTier,
  enterpriseTier,
] as const

export const BASE_TIER_ORDERED_TIERS: Tier[] = [
  proAITier,
  businessAITier,
  enterpriseTier,
] as const

/**
 * Tiers that are only available for annual billing.
 * This is a hacky way to get around how we get prices for all tiers assuming that there is both monthly and annual pricing.
 * This is used only in the FE to prevent checking out for these tiers if the term is monthly.
 */
export const ANNUAL_ONLY_TIERS = [
  aiWorkplaceCreditsTier,
  aiEmployeesStarterCreditsTier,
] as const

export type CreditTier = (typeof CREDIT_TIER_ORDERED_TIERS)[number]

export type BaseTier = (typeof BASE_TIER_ORDERED_TIERS)[number]

export const isCreditBasedTier = (tier?: Tier): boolean => {
  const CREDIT_TIERS = [
    ...CREDIT_TIER_ORDERED_TIERS,
    aiWorkplacePlusCreditsTier,
    aiWorkplaceLightCreditsTier,
  ]

  return !!tier && isOneOf(tier, CREDIT_TIERS) && tier !== enterpriseTier
}

export const isBaseTier = (tier?: Tier): boolean => {
  return (
    !!tier && isOneOf(tier, BASE_TIER_ORDERED_TIERS) && tier !== enterpriseTier
  )
}

// --- Tier Information ---
export const TIER_BULLETS: Partial<Record<Tier, string[]>> = {
  [basicTier]: [
    'Automatically plan your day with A.I.',
    'Project and task management',
    'Notes and Docs',
    'List and Kanban views',
    'Advanced calendar management',
    'Time tracking',
    'Desktop, iOS, and Android apps',
    'Receive warnings when you might miss deadline',
    '2-week auto-scheduling window',
    '1 task template',
    '1 workflow automation',
    '1 GB attachments storage',
    'Customer Support',
  ],
  [proTier]: [
    'Automated team project planning & coordination with A.I.',
    'Predict project delivery date with A.I.',
    'Gantt and Timeline views',
    'Multi-layer pivot tables',
    'Charts and dashboards',
    'Team capacity view',
    'Sharing with external guests',
    'SOP templates and automations',
    'Meeting booking pages (Calendly)',
    'Zapier, API & Slack integration',
    'Activity & comments (90 day history)',
    'Unlimited workflow automations',
    'Unlimited task and project templates',
    'Unlimited custom fields',
    '50 GB attachments storage',
    '3-month auto-scheduling window',
    'Priority support and central billing',
  ],
  [proPlusTier]: [
    'Advanced Charts',
    'Advanced Team Schedule',
    'Unlimited history',
    'Manual data backups',
    'SOC2 and Security Reports',
    'Advanced customer support',
    'Early access to beta features',
  ],
  [proAITier]: [
    'AI Task Planner',
    'AI Project Manager',
    'AI Calendar and Scheduling',
    'AI Meeting Notetaker',
    'AI Docs and Notes',
    'AI Writer and Editor',
    'AI Search and Ask',
    'Integrations',
    'Unlimited AI Usage',
    'Unlimited Storage',
    'iOS, Android, and Desktop apps',
    'Priority Support',
  ],
  [businessAITier]: [
    'Productivity Charts',
    'Team Capacity Planning',
    'Advanced Dashboards',
    'Reporting and Analytics',
    'Timeline and Gantt',
    'Time Tracking',
    'Central Billing',
    'Permissions',
    'Business Support',
  ],
  [aiWorkplaceTier]: [
    'AI Project Management',
    'AI Task Management',
    'AI Calendar',
    'AI Meetings',
    'AI Notes',
    'AI Docs Editor',
    'Dashboards and Reporting',
    'Timeline and Gantt',
    'Time Tracking',
    'User Permissions',
    'iOS, Android, and Desktop apps',
    'Priority Support',
  ],
  [aiEmployeesTier]: [
    'AI Executive Assistant',
    'AI Sales Representative',
    'AI Customer Support',
    'AI Marketing Associate',
    'AI Recruiter',
    'AI Researcher',
    'AI Project Manager',
    'AI Customer Success Manager',
    'AI Legal Assistant',
    'AI Product Manager',
    'Business Support',
  ],
  [aiWorkplaceCreditsTier]: [
    '1 seat',
    '1,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '3 Integration Connections',
  ],
  [aiWorkplacePlusCreditsTier]: [
    '1 seat',
    '10,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '5 Integration Connections',
  ],
  [aiEmployeesStarterCreditsTier]: [
    '1 seat',
    '10,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '5 Integration Connections',
  ],
  [aiEmployeesLightCreditsTier]: [
    '3 seats',
    '25,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '10 Integration Connections',
  ],
  [aiEmployeesBasicCreditsTier]: [
    '5 seats',
    '50,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '10 Integration Connections',
  ],
  [aiEmployeesStandardCreditsTier]: [
    '10 seats',
    '100,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '20 Integration Connections',
    'HTTP Blocks',
  ],
  [aiEmployeesPlusCreditsTier]: [
    '25 seats',
    '250,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '20 Integration Connections',
    'HTTP Blocks',
    'Priority Business Support',
  ],
  [aiEmployeesBusinessCreditsTier]: [
    '50 seats',
    '500,000 AI Credits/month',
    'AI Projects & Tasks',
    'AI Calendar & Meetings',
    'AI Docs, Wiki, & Notes',
    'AI Sheets & Databases',
    'AI Dashboards & Reports',
    'iOS, Android, Desktop apps',
    '20 Integration Connections',
    'HTTP Blocks',
    'Priority Business Support',
  ],
  [aiBusinessExperimentalTier]: [
    'AI Website Builder',
    'AI Slides',
    'AI CRM',
    'AI Support Helpdesk',
    'AI Sheets and Formulas',
    'AI Chat',
    'Forms',
    'Whiteboard',
    'Team Chat',
    'AI VOIP and Phone System',
    'Email Client',
  ],
  // 👇 This is for enterprise tier on the initial tiered pricing page.
  // For bullets on the newer tiers, make a constant for that tier. (Example: AiAgentsEnterpriseTierBullets)
  [enterpriseTier]: [
    'Enterprise-scale Integrations and API',
    'Data Backup',
    'Role Based Access Control (RBAC)',
    'Share with External Parties',
    'SOC 2 and Security Reports',
    'Complete IT and Security Questionnaires',
    'Single Sign On',
    'Engineering Support',
    'Ongoing dedicated project management expert for customer success',
  ],
}

export const getTierTitle = (tier: Tier): string | undefined => {
  switch (tier) {
    case basicTier:
      return 'Basic'
    case proTier:
      return 'Pro'
    case proPlusTier:
      return 'Pro Plus'
    case proAITier:
      return 'Pro AI'
    case businessTier:
      return 'Business'
    case businessPlusTier:
      return 'Business Plus'
    case businessAITier:
      return 'Business AI'
    case aiWorkplaceTier:
    case aiWorkplaceCreditsTier:
      return 'AI Workplace'
    case aiWorkplaceLightCreditsTier:
      return 'AI Workplace Light'
    case aiWorkplacePlusCreditsTier:
      return 'AI Workplace Plus'
    case aiEmployeesStarterCreditsTier:
      return 'AI Employees Starter'
    case aiEmployeesBasicCreditsTier:
      return 'AI Employees Basic'
    case aiEmployeesTier:
      return 'AI Employees'
    case enterpriseTier:
      return 'Enterprise'
    case aiEmployeesLightCreditsTier:
      return 'AI Employees Light'
    case aiEmployeesStandardCreditsTier:
      return 'AI Employees Standard'
    case aiEmployeesPlusCreditsTier:
      return 'AI Employees Plus'
    case aiEmployeesBusinessCreditsTier:
      return 'AI Employees Business'
    case aiBusinessExperimentalTier:
      return 'AI Business'
    default:
      return undefined
  }
}

export const getTierBulletHeader = (
  tier: Tier,
  orderedTiers: Tier[]
): string => {
  if (isCreditBasedTier(tier)) {
    return ''
  }

  const currentTierIndex = orderedTiers.indexOf(tier)

  if (currentTierIndex <= 0) {
    return ''
  }

  const previousTier = orderedTiers[currentTierIndex - 1]
  const previousTierName = getTierTitle(previousTier)

  return previousTierName ? `Includes ${previousTierName}, plus:` : ''
}

export const getTierDescription = (
  tier: Tier,
  aiEmployeesEnabled: boolean = true
): string => {
  switch (tier) {
    case basicTier:
      return 'For individuals or small teams who need essential auto-scheduling and project management tools'
    case proTier:
      return 'For power users or teams with complex workflows that need advanced project management and scheduling features'
    case proPlusTier:
      return 'For ultra power users or teams who need advanced analytics and security reports for IT purposes. Not necessary for most users.'
    case proAITier:
      return 'For professionals and small teams'
    case businessAITier:
      return 'For power users and businesses with complex needs'
    case aiWorkplaceTier:
      return 'Suite of AI Applications for Work Management'
    case aiEmployeesTier:
      return 'Have AI Employees do actual work for you'
    case aiBusinessExperimentalTier:
      return 'All the AI apps you need to run your business'
    case enterpriseTier:
      return aiEmployeesEnabled
        ? 'Custom-engineered enterprise-grade AI Employees'
        : 'Get exclusive features for your organization'
    default:
      return ''
  }
}

export const featureToMotionProText = {
  aiAgents: 'use AI employees',
  aiDocs: 'use AI in docs',
  aiChat: 'use AI chat',
  aiSheets: 'use AI sheets',
  aiNotetaker: 'use AI notetaker',
  aiNotetakerLimit: 'use AI notetaker',
  aiProjectCreation: 'use AI project creation',
  api: 'use API',
  attachmentStorage: 'upgrade attachment storage from 1 GB to 50 GB',
  bookingLinks: 'use booking links',
  customFields: 'create unlimited custom fields',
  dashboards: 'use dashboards',
  gantt: 'use Gantt charts',
  knowledge: 'use knowledge management',
  projectDefinitions: 'create unlimited project templates',
  rbac: 'use Role Based Access Control (RBAC)',
  tasksInExternalCalendar: 'show tasks on external calendar',
  teamSchedule: 'use team schedule',
  templateTasks: 'create unlimited task templates',
  workspaces: 'create up to 20 workspaces',
  autoScheduleWindow: 'auto-schedule tasks up to 3 months in advance',
  projectAndTaskActivity: 'view project and task activity',
  slackbot: 'connect slackbot to your slack workspace',
  aiCreditsMonthly: 'credits for AI employees',
  integrationConnections: 'integrations for AI employees',
  seats: 'invite more team members',
  capacityPlanning: 'use workload charts',
}

export const featureToMotionEnterpriseText = {
  ...featureToMotionProText,
  attachmentStorage: 'upgrade attachment storage from 50 GB to unlimited',
  workspaces: 'create unlimited workspaces',
}

// TODO: These hardcoded values should be removed once we have a backend endpoint for this
export const getAutoScheduleWindowLimits = (tier: Tier): number => {
  switch (tier) {
    case proTier:
    case proPlusTier:
    case proAITier:
    case businessAITier:
    case enterpriseTier:
      return 92
    case basicTier:
    default:
      return 14
  }
}

export const CREDIT_TIER_FEATURES = [
  'AI Chat',
  'AI Projects & Tasks',
  'AI Calendar & Meetings',
  'AI Docs, Wiki, & Notes',
  'AI Sheets & Databases',
  'AI Dashboards & Reports',
  'iOS, Android, Desktop apps',
  'Customer Support',
  'Integration Connections',
  'AI Executive Assistant',
  'AI Sales Representative',
  'AI Customer Support',
  'AI Marketing Associate',
  'AI Recruiter',
  'AI Project Manager',
  'AI HR & Legal Assistant',
  'HTTP Blocks',
  'Priority Business Support',
  'Build your own AI Employee',
  'Custom API and Webhooks',
  'Custom AI Employees (Built by Motion Engineers)',
  'Custom Integrations (Built by Motion Engineers)',
  'White Glove Onboarding, Implementation, and Support',
  'Ongoing dedicated Forward Deployed Engineer',
  'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)',
] as const

export const CREDIT_TIER_FEATURES_TOOLTIPS: Record<CreditTierFeature, string> =
  {
    'AI Chat':
      "Ask about anything—from yesterday's meeting notes to projects and docs across all workspaces. Powered by all your Motion data in one place.",
    'AI Projects & Tasks':
      'Automate SOPs, track key decisions, auto-prioritize tasks, and get alerts when projects fall behind.',
    'AI Calendar & Meetings':
      'Automatically schedules your tasks around calendar changes, and transcribes & summarizes meetings with task follow-up.',
    'AI Docs, Wiki, & Notes':
      'Write and organize personal notes or shared knowledge with AI-powered suggestions and auto-summaries.',
    'AI Sheets & Databases':
      'Populate and transform tables with AI workflows that respond to your data. Generate data with AI Agents.',
    'AI Dashboards & Reports':
      'Visualize workload and progress—get real-time reports on task distribution, project status, and more.',
    'iOS, Android, Desktop apps':
      'Stay connected and productive from anywhere with native apps for every device.',
    'Customer Support':
      'Get help when you need it from our dedicated support team',
    'Integration Connections':
      'Plug in your favorite tools—Slack, Salesforce, Hubspot, and more.',
    'AI Executive Assistant':
      'Drafts emails, triages your inbox, and keeps you organized—no human required.',
    'AI Sales Representative':
      'Researches leads, preps for meetings, and drafts personalized outreach.',
    'AI Customer Support': 'Coming soon',
    'AI Marketing Associate':
      'Generates content, monitors campaign performance, and helps you find fresh inspiration across channels.',
    'AI Recruiter':
      'Prepares interviewers with daily candidate summaries and analyzes interviews to highlight patterns and feedback trends.',
    'AI Project Manager':
      'Tracks decisions, organizes tasks, and ensures projects stay on schedule.',
    'AI HR & Legal Assistant': 'Coming soon',
    'HTTP Blocks':
      'Connect directly to any external API as part of your automated workflows.',
    'Priority Business Support':
      'Fast-track support with shorter response times and prioritized handling.',
    'Build your own AI Employee':
      'Create a custom AI teammate designed for any role or workflow',
    'Custom API and Webhooks':
      'Trigger external actions or receive data from your systems in real time.',
    'Custom AI Employees (Built by Motion Engineers)':
      'Our engineers will build and maintain AI employees designed for your workflow.',
    'Custom Integrations (Built by Motion Engineers)':
      'Let us handle complex integration work for your team.',
    'White Glove Onboarding, Implementation, and Support':
      'Dedicated setup, training, and support designed to get your team ramped fast.',
    'Ongoing dedicated Forward Deployed Engineer':
      'Partner with a dedicated Motion engineer to build and evolve your AI systems.',
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)':
      "We'll meet with your stakeholders to identify and deliver high-impact workflows.",
  }

export const BASE_TIER_FEATURES_TOOLTIPS: Record<BaseTierFeature, string> = {
  'AI Chat':
    "Ask about anything—from yesterday's meeting notes to projects and docs across all workspaces. Powered by all your Motion data in one place.",
  'AI Projects & Tasks':
    'Automate SOPs and track key decisions with AI-powered project management.',
  'AI Calendar & Meetings':
    'Automatically schedules your tasks around calendar changes and transcribes & summarizes meetings with task follow-up.',
  'AI Docs & Notes':
    'Write and organize personal notes or shared knowledge with AI-powered suggestions and auto-summaries.',
  'AI Sheets & Databases':
    'Populate and transform tables with AI workflows that respond to your data.',
  'AI Task Planner':
    'Intelligent task planning and prioritization powered by AI.',
  'AI Writer & Editor': 'AI-powered writing assistance and content editing.',
  'Unlimited Storage': 'Store unlimited files and attachments.',
  'iOS & Android & Desktop Apps':
    'Stay connected and productive from anywhere with native apps for every device.',
  Integrations:
    'Connect with your favorite tools—Slack, Salesforce, Hubspot, and more.',
  'Team Capacity Planning':
    'Visualize and manage team workload and availability.',
  'Advanced Dashboards & Reports':
    'Real-time reports on task distribution and project status with advanced analytics.',
  'Timeline & Gantt Charts': 'Visualize project timelines and dependencies.',
  'Time Tracking':
    'Track time spent on tasks and projects for better insights.',
  'Permissions & Access Control':
    'Control who can view and edit projects and tasks.',
  'Central Billing': 'Manage all team payments and subscriptions in one place.',
  'Priority Support':
    'Get help when you need it from our dedicated support team.',
}

export const BASE_TIER_FEATURES = [
  'AI Chat',
  'AI Projects & Tasks',
  'AI Calendar & Meetings',
  'AI Docs & Notes',
  'AI Sheets & Databases',
  'AI Task Planner',
  'AI Writer & Editor',
  'Unlimited Storage',
  'iOS & Android & Desktop Apps',
  'Integrations',
  'Team Capacity Planning',
  'Advanced Dashboards & Reports',
  'Timeline & Gantt Charts',
  'Time Tracking',
  'Permissions & Access Control',
  'Central Billing',
  'Priority Support',
] as const

export type CreditTierFeature = (typeof CREDIT_TIER_FEATURES)[number]

export type BaseTierFeature = (typeof BASE_TIER_FEATURES)[number]

/**
 * Used to display the features for credit tiers in table format
 */
export const CREDIT_TIER_FEATURES_MAP: Partial<
  Record<CreditTier, Record<CreditTierFeature, string | boolean>>
> = {
  [aiWorkplaceCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '3',
    'AI Executive Assistant': false,
    'AI Sales Representative': false,
    'AI Customer Support': false,
    'AI Marketing Associate': false,
    'AI Recruiter': false,
    'AI Project Manager': false,
    'AI HR & Legal Assistant': false,
    'HTTP Blocks': false,
    'Priority Business Support': false,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiWorkplacePlusCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '5',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': false,
    'Priority Business Support': false,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiEmployeesStarterCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '5',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': false,
    'Priority Business Support': false,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiEmployeesBasicCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '10',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': false,
    'Priority Business Support': false,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiEmployeesLightCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '10',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': false,
    'Priority Business Support': false,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiEmployeesStandardCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '20',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': true,
    'Priority Business Support': false,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiEmployeesPlusCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '50',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': true,
    'Priority Business Support': true,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [aiEmployeesBusinessCreditsTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': '100',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': true,
    'Priority Business Support': true,
    'Build your own AI Employee': false,
    'Custom API and Webhooks': false,
    'Custom AI Employees (Built by Motion Engineers)': false,
    'Custom Integrations (Built by Motion Engineers)': false,
    'White Glove Onboarding, Implementation, and Support': false,
    'Ongoing dedicated Forward Deployed Engineer': false,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': false,
  },
  [enterpriseTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs, Wiki, & Notes': true,
    'AI Sheets & Databases': true,
    'AI Dashboards & Reports': true,
    'iOS, Android, Desktop apps': true,
    'Customer Support': true,
    'Integration Connections': 'Custom',
    'AI Executive Assistant': true,
    'AI Sales Representative': true,
    'AI Customer Support': true,
    'AI Marketing Associate': true,
    'AI Recruiter': true,
    'AI Project Manager': true,
    'AI HR & Legal Assistant': true,
    'HTTP Blocks': true,
    'Priority Business Support': true,
    'Build your own AI Employee': true,
    'Custom API and Webhooks': true,
    'Custom AI Employees (Built by Motion Engineers)': true,
    'Custom Integrations (Built by Motion Engineers)': true,
    'White Glove Onboarding, Implementation, and Support': true,
    'Ongoing dedicated Forward Deployed Engineer': true,
    'Workflow Scoping (Stakeholder Meetings for High-Value Use Cases)': true,
  },
}

/**
 * Used to display the features for the rolled back Pro AI and Business AI tiers in table format
 * TODO: Update when base tier features are finalized
 */
export const BASE_TIER_FEATURES_MAP: Partial<
  Record<BaseTier, Record<BaseTierFeature, string | boolean>>
> = {
  [proAITier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs & Notes': true,
    'AI Sheets & Databases': true,
    'AI Task Planner': true,
    'AI Writer & Editor': true,
    'Unlimited Storage': true,
    'iOS & Android & Desktop Apps': true,
    Integrations: true,
    'Team Capacity Planning': false,
    'Advanced Dashboards & Reports': false,
    'Timeline & Gantt Charts': false,
    'Time Tracking': false,
    'Permissions & Access Control': false,
    'Central Billing': false,
    'Priority Support': false,
  },
  [businessAITier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs & Notes': true,
    'AI Sheets & Databases': true,
    'AI Task Planner': true,
    'AI Writer & Editor': true,
    'Unlimited Storage': true,
    'iOS & Android & Desktop Apps': true,
    Integrations: true,
    'Team Capacity Planning': true,
    'Advanced Dashboards & Reports': true,
    'Timeline & Gantt Charts': true,
    'Time Tracking': true,
    'Permissions & Access Control': true,
    'Central Billing': true,
    'Priority Support': true,
  },
  [enterpriseTier]: {
    'AI Chat': true,
    'AI Projects & Tasks': true,
    'AI Calendar & Meetings': true,
    'AI Docs & Notes': true,
    'AI Sheets & Databases': true,
    'AI Task Planner': true,
    'AI Writer & Editor': true,
    'Unlimited Storage': true,
    'iOS & Android & Desktop Apps': true,
    Integrations: true,
    'Team Capacity Planning': true,
    'Advanced Dashboards & Reports': true,
    'Timeline & Gantt Charts': true,
    'Time Tracking': true,
    'Permissions & Access Control': true,
    'Central Billing': true,
    'Priority Support': true,
  },
}

/**
 * Returns true if the tier is eligible for an upgrade to the UBP.
 * Only tiers created before AI Workplace are eligible for an upgrade to the UBP.
 *
 * @param tier - The tier to check
 * @returns True if the tier is eligible for an upgrade to the UBP, false otherwise
 */
export const isLegacyTierEligibleForUbpUpgrade = (tier: Tier): boolean => {
  return FeatureTier.indexOf(tier) < FeatureTier.indexOf('AIWORKPLACE')
}

export const getLtv = (
  tier: Tier | undefined,
  isMonthly: boolean | undefined,
  isLowCostTrial: boolean | undefined
): number => {
  const ltv: Partial<Record<Tier, number>> = {
    [aiWorkplaceCreditsTier]: isLowCostTrial ? 25.95 : 100.17,
    [aiEmployeesStarterCreditsTier]: isLowCostTrial ? 42.39 : 197.74,
    [aiEmployeesLightCreditsTier]: isMonthly
      ? 503.53
      : isLowCostTrial
        ? 179.02
        : 335.69,
    [aiEmployeesStandardCreditsTier]: isMonthly
      ? 785.8
      : isLowCostTrial
        ? 271.09
        : 523.87,
    // 👇 Same as Standard since FB can't tell the difference
    [aiEmployeesPlusCreditsTier]: isMonthly
      ? 785.8
      : isLowCostTrial
        ? 271.09
        : 523.87,
  }
  return tier && tier in ltv ? ltv[tier]! : 1
}
