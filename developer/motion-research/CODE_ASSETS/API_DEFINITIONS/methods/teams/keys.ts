import { createKey } from '@motion/rpc'

export const queryKeys = {
  currentTeam: createKey('current-team'),
  currentTeamV2: createKey(['v2', 'current-team']),
  slackEmojis: createKey(['v2', 'slack-emojis']),
  slackBot: createKey(['v2', 'slackbot']),
  teamEmailDomains: createKey(['team-email-domains']),
  joinableTeams: createKey(['joinable-teams']),
}

export const combinedTeamKeys = [queryKeys.currentTeam, queryKeys.currentTeamV2]
