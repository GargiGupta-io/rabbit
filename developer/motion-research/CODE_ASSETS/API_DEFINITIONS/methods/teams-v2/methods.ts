import { defineApi, defineMutation } from '@motion/rpc'

import { combinedSubscriptionKeys } from '../subscriptions'
import { queryKeys as queryKeysTeamSettings } from '../team-settings'
import { combinedTeamKeys, queryKeys } from '../teams'
import { RouteTypes } from '../types'

type CreateTeam = RouteTypes<'TeamsController_createV2'>
export const createTeam = defineMutation<
  CreateTeam['request'],
  CreateTeam['response']
>().using({
  uri: '/v2/teams',
  method: 'POST',
  invalidate: [...combinedTeamKeys, ...combinedSubscriptionKeys],
})

type GetCurrentTeam = RouteTypes<'TeamsController_getCurrentTeamV2'>
export const getCurrentTeam = defineApi<
  GetCurrentTeam['request'],
  GetCurrentTeam['response']
>().using({
  key: queryKeys.currentTeamV2,
  uri: '/v2/teams',
  method: 'GET',
  queryOptions: {
    staleTime: 30 * 60 * 1000, // 30 min
  },
})

type ResubscribeTeam = RouteTypes<'TeamsController_resubscribeV2'>
export const resubscribeTeam = defineMutation<
  ResubscribeTeam['request'],
  ResubscribeTeam['response']
>().using({
  uri: (args) => `/v2/teams/${args.teamId}/resubscribe`,
  method: 'POST',
  invalidate: [...combinedTeamKeys, ...combinedSubscriptionKeys],
})

type RenameTeam = RouteTypes<'TeamsController_renameV2'>
export const renameTeam = defineMutation<
  RenameTeam['request'],
  RenameTeam['response']
>().using({
  uri: (args) => `/v2/teams/${args.teamId}/rename`,
  method: 'PATCH',
  invalidate: combinedTeamKeys,
})

type CreateTeamSetupIntent = RouteTypes<'TeamsController_createSetupIntentV2'>
export const createSetupIntent = defineMutation<
  CreateTeamSetupIntent['request'],
  CreateTeamSetupIntent['response']
>().using({
  uri: (args) => `/v2/teams/${args.teamId}/setup-intent`,
  method: 'POST',
})

type GetTeamsSlackEmojis = RouteTypes<'TeamsController_getTeamsSlackEmojis'>
export const getTeamsSlackEmojis = defineApi<
  GetTeamsSlackEmojis['request'],
  GetTeamsSlackEmojis['response']
>().using({
  method: 'GET',
  uri: '/v2/teams/slack/emojis',
  key: queryKeys.slackEmojis,
})

type IsTeamConnectedToASlackBot =
  RouteTypes<'TeamsSlackBotController_isTeamConnectedToASlackBot'>
export const isTeamConnectedToASlackBot = defineApi<
  IsTeamConnectedToASlackBot['request'],
  IsTeamConnectedToASlackBot['response']
>().using({
  method: 'GET',
  uri: (args) => `/v2/teams/slackbot/connected/${args.teamId}`,
  key: queryKeys.slackBot,
})

type DisconnectSlack = RouteTypes<'TeamsSlackBotController_disconnectSlack'>
export const disconnectSlack = defineMutation<
  DisconnectSlack['request'],
  DisconnectSlack['response']
>().using({
  method: 'DELETE',
  uri: (args) => `/v2/teams/slackbot/disconnect/${args.teamId}`,
  invalidate: [queryKeys.slackBot],
})

type GenerateOAuthState =
  RouteTypes<'TeamsSlackBotController_generateOAuthState'>
export const generateOAuthState = defineMutation<
  GenerateOAuthState['request'],
  GenerateOAuthState['response']
>().using({
  method: 'GET',
  uri: (args) => `/v2/teams/slackbot/generate-oauth-state/${args.teamId}`,
})

type CreateEmojiReactionSetting =
  RouteTypes<'TeamsController_createEmojiReactionSetting'>
export const createEmojiReactionSetting = defineMutation<
  CreateEmojiReactionSetting['request'],
  CreateEmojiReactionSetting['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/teams/${args.teamId}/settings/slackbot/emojiReaction`,
  invalidate: [queryKeysTeamSettings.root],
})

type UpdateEmojiReactionSetting =
  RouteTypes<'TeamsController_updateEmojiReactionSetting'>
export const updateEmojiReactionSetting = defineMutation<
  UpdateEmojiReactionSetting['request'],
  UpdateEmojiReactionSetting['response']
>().using({
  method: 'PATCH',
  uri: (args) =>
    `/v2/teams/${args.teamId}/settings/slackbot/emojiReaction/${args.id}`,
  invalidate: [queryKeysTeamSettings.root],
})

type DeleteEmojiReactionSetting =
  RouteTypes<'TeamsController_deleteEmojiReactionSetting'>
export const deleteEmojiReactionSetting = defineMutation<
  DeleteEmojiReactionSetting['request'],
  DeleteEmojiReactionSetting['response']
>().using({
  method: 'DELETE',
  uri: (args) =>
    `/v2/teams/${args.teamId}/settings/slackbot/emojiReaction/${args.id}`,
  invalidate: [queryKeysTeamSettings.root],
})

type CreateTeamEmailDomain =
  RouteTypes<'TeamEmailDomainsController_createTeamEmailDomain'>
export const createTeamEmailDomain = defineMutation<
  CreateTeamEmailDomain['request'],
  CreateTeamEmailDomain['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/teams/${args.teamId}/email-domains`,
  invalidate: [queryKeys.teamEmailDomains],
})

type UpdateTeamEmailDomain =
  RouteTypes<'TeamEmailDomainsController_updateTeamEmailDomain'>
export const updateTeamEmailDomain = defineMutation<
  UpdateTeamEmailDomain['request'],
  UpdateTeamEmailDomain['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/teams/${args.teamId}/email-domains/${args.id}`,
  invalidate: [queryKeys.teamEmailDomains],
})

type JoinTeam = RouteTypes<'TeamsController_joinTeam'>
export const joinTeam = defineMutation<
  JoinTeam['request'],
  JoinTeam['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/teams/${args.teamId}/join`,
  invalidate: [...combinedTeamKeys, ...combinedSubscriptionKeys],
})

type JoinTeamUnauthenticated =
  RouteTypes<'TeamsController_joinTeamUnauthenticated'>
export const joinTeamUnauthenticated = defineMutation<
  JoinTeamUnauthenticated['request'],
  JoinTeamUnauthenticated['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/teams/${args.teamId}/join/unauthenticated`,
  invalidate: [...combinedTeamKeys, ...combinedSubscriptionKeys],
})

type GetJoinableTeams = RouteTypes<'TeamsController_getJoinableTeams'>
export const getJoinableTeams = defineApi<
  GetJoinableTeams['request'],
  GetJoinableTeams['response']
>().using({
  method: 'GET',
  uri: '/v2/teams/external/joinable',
  key: queryKeys.joinableTeams,
})

type GetJoinableTeamsUnauthenticated =
  RouteTypes<'TeamsController_getJoinableTeamsUnauthenticated'>
export const getJoinableTeamsUnauthenticated = defineApi<
  GetJoinableTeamsUnauthenticated['request'],
  GetJoinableTeamsUnauthenticated['response']
>().using({
  method: 'GET',
  uri: (args) =>
    `/v2/teams/joinable/unauthenticated?email=${encodeURIComponent(args.email)}`,
  key: queryKeys.joinableTeams,
})

type GetRegisteredTeamEmailDomains =
  RouteTypes<'TeamEmailDomainsController_getRegisteredTeamEmailDomains'>
export const getRegisteredTeamEmailDomains = defineApi<
  GetRegisteredTeamEmailDomains['request'],
  GetRegisteredTeamEmailDomains['response']
>().using({
  method: 'GET',
  uri: (args) => `/v2/teams/${args.teamId}/email-domains`,
  key: queryKeys.teamEmailDomains,
})

type GetTeamCapacity = RouteTypes<'TeamsCapacityController_getTeamCapacity'>
export const getTeamCapacity = defineApi<
  GetTeamCapacity['request'],
  GetTeamCapacity['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/teams/${args.teamId}/capacity/query`,
  body: ({ teamId, ...rest }) => rest,
  key: (args) => ['teams', args.teamId, 'capacity', args.filters],
  queryOptions: {
    staleTime: 30 * 60 * 1_000, // 30 min
  },
})
