import { createKey, defineApi, defineMutation } from '@motion/rpc'

import { RouteTypes } from '../types'

export const queryKeys = {
  root: createKey('team-settings'),
}

type GetTeamSettings = RouteTypes<'TeamsController_getTeamSettings'>
export const getTeamSettings = defineApi<
  GetTeamSettings['request'],
  GetTeamSettings['response']
>().using({
  method: 'GET',
  uri: (args) => `/v2/teams/${args.teamId}/settings`,
  key: queryKeys.root,
})

type UpdateNotetakerTeamSettings =
  RouteTypes<'TeamsController_updateNotetakerTeamSettings'>
export const updateNotetakerTeamSettings = defineMutation<
  UpdateNotetakerTeamSettings['request'],
  UpdateNotetakerTeamSettings['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/teams/${args.teamId}/settings/notetaker`,
  body: ({ teamId, ...args }) => args,
})
