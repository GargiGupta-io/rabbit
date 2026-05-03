import { createKey, defineApi, defineMutation } from '@motion/rpc'
import {
  ActionItemQueryRequest,
  type MeetingInsightsQueryRequest,
  type MeetingInsightsSingleRequest,
} from '@motion/rpc-types'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: ['v2', 'notetaker'] as const,
  query: (args: MeetingInsightsQueryRequest) =>
    ['v2', 'notetaker', args] as const,
  byId: ['v2', 'notetaker', 'by-id'] as const,
  byIdWithArgs: (args?: MeetingInsightsSingleRequest) =>
    ['v2', 'notetaker', 'by-id', args] as const,
  actionItems: (args: ActionItemQueryRequest) =>
    ['v2', 'notetaker', 'action-items', args] as const,
}
type QueryMeetingInsights =
  RouteTypes<'NotetakerController_queryMeetingInsights'>
export const queryMeetingInsights = defineApi<
  QueryMeetingInsights['request'],
  QueryMeetingInsights['response']
>().using({
  method: 'POST',
  uri: '/v2/notetaker/query',
  key: (args) => queryKeys.query(args),
})

type GetMeetingInsightsById =
  RouteTypes<'NotetakerController_getMeetingInsightsById'>
export const getMeetingInsightsById = defineApi<
  GetMeetingInsightsById['request'],
  GetMeetingInsightsById['response']
>().using({
  method: 'GET',
  uri: (args) => {
    const searchParams = new URLSearchParams()

    if (args.meetingInsightsId != null) {
      searchParams.set('meetingInsightsId', args.meetingInsightsId)
    }

    if (args.recurringMeetingInsightsId != null) {
      searchParams.set(
        'recurringMeetingInsightsId',
        args.recurringMeetingInsightsId
      )
    }

    return `/v2/notetaker/single?${searchParams.toString()}`
  },
  key: (args) => queryKeys.byIdWithArgs(args),
})

export const updateMeetingInsights = defineMutation<
  RouteTypes<'NotetakerController_updateMeetingInsights'>['request'],
  RouteTypes<'NotetakerController_updateMeetingInsights'>['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/notetaker/${args.meetingInsightsId}`,
})

export const updateRecurringMeetingInsights = defineMutation<
  RouteTypes<'NotetakerController_updateRecurringMeetingInsights'>['request'],
  RouteTypes<'NotetakerController_updateRecurringMeetingInsights'>['response']
>().using({
  method: 'PATCH',
  uri: (args) => `/v2/notetaker/recurring/${args.recurringMeetingInsightsId}`,
})

export const approveActionItem = defineMutation<
  RouteTypes<'NotetakerController_approveActionItem'>['request'],
  RouteTypes<'NotetakerController_approveActionItem'>['response']
>().using({
  method: 'POST',
  uri: '/v2/notetaker/action-items/approve',
})

export const rejectActionItem = defineMutation<
  RouteTypes<'NotetakerController_rejectActionItem'>['request'],
  RouteTypes<'NotetakerController_rejectActionItem'>['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/notetaker/action-items/${args.actionItemId}/reject`,
})

export const undoRejectedActionItem = defineMutation<
  RouteTypes<'NotetakerController_undoRejectedActionItem'>['request'],
  RouteTypes<'NotetakerController_undoRejectedActionItem'>['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/notetaker/action-items/${args.actionItemId}/undo`,
})

export const sendBotNow = defineMutation<
  RouteTypes<'NotetakerController_sendBotNow'>['request'],
  RouteTypes<'NotetakerController_sendBotNow'>['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/notetaker/bot/${args.meetingInsightsId}/send-now`,
})

export const kickOffBot = defineMutation<
  RouteTypes<'NotetakerController_kickBot'>['request'],
  RouteTypes<'NotetakerController_kickBot'>['response']
>().using({
  method: 'POST',
  uri: (args) => `/v2/notetaker/bot/${args.meetingInsightsId}/kick`,
})

export const queryActionItems = defineApi<
  RouteTypes<'NotetakerController_queryActionItems'>['request'],
  RouteTypes<'NotetakerController_queryActionItems'>['response']
>().using({
  method: 'POST',
  uri: '/v2/notetaker/action-items/query',
  key: (args) => queryKeys.actionItems(args),
})

export const getMeetingInsightsCredits = defineApi<
  RouteTypes<'NotetakerController_getMeetingInsightsCredits'>['request'],
  RouteTypes<'NotetakerController_getMeetingInsightsCredits'>['response']
>().using({
  method: 'GET',
  key: () => createKey([...queryKeys.root, 'meeting-insights-credits']),
  uri: '/v2/notetaker/meeting-insights-credits',
})
