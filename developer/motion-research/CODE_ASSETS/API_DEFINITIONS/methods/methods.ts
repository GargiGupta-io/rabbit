import * as access from './access'
import * as agentWorkflows from './agent-workflows'
import * as ai from './ai'
import * as analytics from './analytics'
import * as apiKeys from './api-keys'
import * as blockingTimeslot from './blocking-timeslot'
import * as booking from './booking'
import * as bootstrap from './bootstrap'
import * as calendarEvents from './calendar-events'
import * as calendars from './calendars'
import * as charts from './charts'
import * as commentsV2 from './comments-v2'
import * as comms from './comms'
import * as crm from './crm'
import * as customFields from './custom-fields'
import * as emailAccounts from './email-accounts'
import * as emailVerification from './email-verification'
import * as feedV2 from './feed-v2'
import * as files from './files-v2'
import * as folders from './folders'
import * as forms from './forms'
import * as inbox from './inbox'
import * as integrations from './integrations'
import * as internal from './internal'
import * as knowledge from './knowledge'
import * as llmChatSessions from './llm-chat-session'
import * as motionNet from './motion-net'
import * as notes from './notes'
import * as notetaker from './notetaker'
import * as notifications from './notifications'
import * as onboarding from './onboarding'
import * as powersync from './powersync'
import * as privacy from './privacy'
import * as projectDefinitions from './project-definitions'
import * as projectGuestPermissions from './project-guest-permissions'
import * as projectGuests from './project-guests'
import * as projects from './projects'
import * as projectsV2 from './projects-v2'
import * as recentlyOpened from './recently-opened'
import * as referrals from './referrals'
import * as scheduledEntities from './scheduled-entities'
import * as search from './search'
import * as secrets from './secrets'
import * as share from './share'
import * as shareNet from './share-net'
import * as sheets from './sheets'
import * as stageDefinitions from './stage-definitions'
import * as stripe from './stripe'
import * as subscriptions from './subscriptions'
import * as subscriptionsV2 from './subscriptions-v2'
import * as tasksV2 from './tasks-v2'
import * as teamSettings from './team-settings'
import * as teamTasks from './team-tasks'
import * as teams from './teams'
import * as teamsV2 from './teams-v2'
import * as templates from './templates'
import * as threads from './threads'
import * as tutorials from './tutorials'
import * as userSettings from './user-settings'
import * as users from './users'
import * as usersV2 from './users-v2'
import * as views from './views-v2'
import * as viewsV3 from './views-v3'
import * as websiteBuilder from './website-builder'
import * as workspacesV2 from './workspaces-v2'

export type * from './crm'

export const API = {
  internal,
  access,
  ai,
  analytics,
  comms,
  agentWorkflows,
  apiKeys,
  blockingTimeslot,
  booking,
  bootstrap,
  calendarEvents,
  calendars,
  crm,
  motionNet,
  charts,
  commentsV2,
  customFields,
  emailAccounts,
  emailVerification,
  feedV2,
  files,
  folders,
  forms,
  inbox,
  integrations,
  knowledge,
  llmChatSessions,
  notes,
  notetaker,
  notifications,
  onboarding,
  powersync,
  privacy,
  projectDefinitions,
  projects,
  projectsV2,
  projectGuestPermissions,
  projectGuests,
  recentlyOpened,
  referrals,
  scheduledEntities,
  search,
  secrets,
  share,
  shareNet,
  sheets,
  stageDefinitions,
  stripe,
  subscriptions,
  subscriptionsV2,
  tasksV2,
  teams,
  teamsV2,
  teamSettings,
  teamTasks,
  templates,
  threads,
  tutorials,
  websiteBuilder,
  users,
  userSettings,
  usersV2,
  views,
  viewsV3,
  workspacesV2,
}
