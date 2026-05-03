export type OnOffFeature =
  | 'tasksInExternalCalendar'
  | 'bookingLinks'
  | 'gantt'
  | 'teamSchedule'
  | 'dashboards'
  | 'aiAgents'
  | 'aiChat'
  | 'aiDocs'
  | 'aiSheets'
  | 'aiNotetaker'
  | 'aiProjectCreation'
  | 'rbac'
  | 'api'
  | 'slackbot'
  | 'knowledge'
  | 'capacityPlanning'

// Features that are capped per workspace
export const WorkspaceCappedFeatures = [
  'templateTasks',
  'customFields',
  'projectDefinitions',
] as const
export type WorkspaceCappedFeature = (typeof WorkspaceCappedFeatures)[number]

// Features that are capped per user/team
export const AccountCappedFeatures = [
  'attachmentStorage',
  'workspaces',
  'aiNotetakerLimit',
  'aiCreditsMonthly',
  'integrationConnections',
  'seats',
] as const
export type AccountCappedFeature = (typeof AccountCappedFeatures)[number]
export const isAccountCappedFeature = (
  feature: string
): feature is AccountCappedFeature =>
  AccountCappedFeatures.includes(feature as AccountCappedFeature)

export const OverageCapableFeatures = ['aiCreditsMonthly'] as const
export type OverageCapableFeature = (typeof OverageCapableFeatures)[number]
export const isOverageCapableFeature = (
  feature: string
): feature is OverageCapableFeature =>
  OverageCapableFeatures.includes(feature as OverageCapableFeature)

export type CappedFeature = WorkspaceCappedFeature | AccountCappedFeature

export type SizedFeature = 'autoScheduleWindow' | 'projectAndTaskActivity'

export type NumericFeature = CappedFeature | SizedFeature

/**
 * For more context on what each feature is, see [documentation](https://dev-app.usemotion.com/web/pm/docs/8dc171e6-3236-4216-aa47-0d24ec93c2ce)
 */
export type Feature = OnOffFeature | NumericFeature
