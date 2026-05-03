import { defineApi, defineMutation } from '@motion/rpc'
import { type TeamWithRelationsSerializer } from '@motion/rpc-types'

import { combinedTeamKeys, queryKeys } from './keys'

import { allSubscriptionKeys, combinedSubscriptionKeys } from '../subscriptions'
import { RouteTypes } from '../types'
import { queryKeys as workspaceV2QueryKeys } from '../workspaces-v2'

type GetCurrentTeamResponse = {
  userId: string
  team: TeamWithRelationsSerializer
}

export const getCurrentTeam = defineApi<
  void,
  TeamWithRelationsSerializer
>().using({
  key: queryKeys.currentTeam,
  uri: '/teams?isNew=true',
  transform: (data: GetCurrentTeamResponse) => data.team,
  queryOptions: {
    staleTime: 600_000,
  },
})

type RenameTeam = RouteTypes<'TeamsController_rename'>
export const renameTeam = defineMutation<
  RenameTeam['request'] & { id: string },
  void
>().using({
  uri: (args) => `teams/${args.id}/rename`,
  invalidate: combinedTeamKeys,
  method: 'POST',
})

type InviteTeamMembers = RouteTypes<'TeamsController_inviteTeamMemberWithSeats'>
export const inviteTeamMembers = defineMutation<
  InviteTeamMembers['request'] & { id: string },
  void
>().using({
  uri: (args) => `teams/${args.id}/members/new`,
  invalidate: [...combinedTeamKeys, workspaceV2QueryKeys.root],
  method: 'POST',
})

type UpdateBucketSeats = RouteTypes<'TeamsController_updateBucketSeats'>
export const updateBucketSeats = defineMutation<
  UpdateBucketSeats['request'] & { id: string },
  void
>().using({
  uri: (args) => `teams/${args.id}/seats`,
  invalidate: [...combinedTeamKeys, ...combinedSubscriptionKeys],
  method: 'PATCH',
})

type ResubscribeTeam = RouteTypes<'TeamsController_resubscribe'>
export const resubscribe = defineMutation<
  ResubscribeTeam['request'] & { teamId: string },
  | {
      joinedTeam: TeamWithRelationsSerializer
    }
  | { error: string; clientSecret: string }
>().using({
  uri: (args) => `teams/${args.teamId}/resubscribe`,
  invalidate: combinedTeamKeys,
  method: 'POST',
})

type UpdateTeamMemberRoles = RouteTypes<'TeamMembersController_updateRoles'>
export const updateTeamMemberRoles = defineMutation<
  UpdateTeamMemberRoles['request'] & { teamId: string },
  void
>().using({
  uri: (args) => `teams/${args.teamId}/members/roles`,
  invalidate: [...combinedTeamKeys, workspaceV2QueryKeys.root],
  method: 'PATCH',
})

type ChangeBillingAdmin = RouteTypes<'TeamsController_changeBillingAdmin'>
export const changeBillingAdmin = defineMutation<
  ChangeBillingAdmin['request'] & { teamId: string },
  void
>().using({
  uri: (args) => `teams/${args.teamId}/billingAdmin`,
  invalidate: [...combinedTeamKeys, ...allSubscriptionKeys],
  method: 'POST',
  body: (args) => ({ newBillingAdminUserId: args.newBillingAdminUserId }),
})

type RemoveMember = RouteTypes<'TeamsController_removeMember'>
export const removeMember = defineMutation<
  RemoveMember['request'] & { teamId: string },
  void
>().using({
  uri: (args) => `teams/${args.teamId}/members/${args.userId}`,
  method: 'DELETE',
  invalidate: combinedTeamKeys,
  effects: [
    {
      on: 'success',
      action: 'update',
      key: () => queryKeys.currentTeamV2,
      merge: (_value, team: GetCurrentTeamResponse['team'], args) =>
        team && {
          ...team,
          members: team.members?.filter(({ userId }) => userId !== args.userId),
        },
    },
  ],
})

type CreateSetupIntent = RouteTypes<'TeamsController_createSetupIntent'>
export const createSetupIntent = defineMutation<
  CreateSetupIntent['request'],
  CreateSetupIntent['response']
>().using({
  uri: 'teams/setupIntent',
  method: 'POST',
})

export const cancelSubscription = defineMutation<
  { teamId: string; cancellationReason: string },
  void
>().using({
  uri: (args) => `teams/${args.teamId}/cancel`,
  method: 'POST',
  body: (args) => args,
  invalidate: [...combinedTeamKeys, ...combinedSubscriptionKeys],
})

type UpdateTeamName = RouteTypes<'TeamsController_updateTeamName'>
export const updateTeamName = defineMutation<
  UpdateTeamName['request'] & { teamId: string },
  void
>().using({
  uri: (args) => `teams/${args.teamId}/name`,
  method: 'PATCH',
  body: (args) => args,
  invalidate: combinedTeamKeys,
})

type CheckTeamEligibility = RouteTypes<'TeamsController_checkTeamEligibility'>
export const checkTeamEligibility = defineMutation<
  CheckTeamEligibility['request'],
  CheckTeamEligibility['response']
>().using({
  uri: 'v2/teams/check-team-eligibility',
  method: 'POST',
  body: (args) => args,
})
