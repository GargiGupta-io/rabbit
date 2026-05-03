import {
  type DefaultPipelineStageDto,
  PipelinesSingleResponse,
} from '@motion/motion-net-types'
import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'
import {
  RecordGetRequest,
  RecordListResponse,
  RecordQueryRequest,
  RecordSingleResponse,
} from './types'

import { RouteTypes } from '../../types'

type ActivityFeedRoute = RouteTypes<'ActivityFeed_GetActivityFeed'>

export type RecordActivityFeedRequest = ActivityFeedRoute['request']

export const getRecordV2 = defineApi<
  RecordGetRequest,
  RecordSingleResponse
>().using({
  method: 'GET',
  uri: (args: RecordGetRequest) =>
    `${__NET_HOST__}/v1/crm/records/${args.$collection}/${args.id}`,
  key: ({ $collection, id }) => queryKeys.record($collection, id),
})

export const queryRecordsV2 = defineApi<
  RecordQueryRequest,
  RecordListResponse
>().using({
  method: 'POST',
  uri: (args: RecordQueryRequest) =>
    `${__NET_HOST__}/v1/crm/records/${args.$collection}/query`,
  key: ({ $collection }) => queryKeys.records($collection),
  body: ({ $collection, ...body }) => body,
})

export const getRecordActivityFeed = defineApi<
  RecordActivityFeedRequest,
  RouteTypes<'ActivityFeed_GetActivityFeed'>['response']
>().using({
  method: 'GET',
  uri: ({ entityType, entityId, includes, excludes }) => {
    const searchParams = new URLSearchParams()
    includes?.forEach((value) => searchParams.append('includes', value))
    excludes?.forEach((value) => searchParams.append('excludes', value))

    const query = searchParams.toString()
    const base = `${__NET_HOST__}/v1/activity-feed/${entityType}/${entityId}`

    return query ? `${base}?${query}` : base
  },
  key: ({ entityType, entityId, includes, excludes }) =>
    queryKeys.activityFeed(entityType, entityId, { includes, excludes }),
})

export const getInitialPipeline = defineApi<
  void,
  PipelinesSingleResponse
>().using({
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/crm/records/pipelines/initial`,
  key: () => queryKeys.record('pipelines', 'initial-pipeline'),
})

export const getDefaultPipelineStages = defineApi<
  void,
  DefaultPipelineStageDto[]
>().using({
  method: 'GET',
  uri: () => `${__NET_HOST__}/v1/crm/records/pipelineStages/defaults`,
  key: () => queryKeys.record('pipelineStages', 'defaults'),
})
