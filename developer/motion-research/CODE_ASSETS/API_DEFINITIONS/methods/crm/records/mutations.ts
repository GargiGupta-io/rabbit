import {
  DealCreateDto,
  SingleModelListResponse,
  SingleModelResponse,
} from '@motion/motion-net-types'
import { defineMutation, optimisticUpdate, SKIP_UPDATE } from '@motion/rpc'
import { merge } from '@motion/utils/core'

import { QueryKey } from '@tanstack/react-query'

import { queryKeys } from './keys'
import { AttachCollection } from './types'

import { RouteTypes } from '../../types'

export type RecordCreateRequest = AttachCollection<{
  companies: RouteTypes<'Company_Create'>
  pipelines: RouteTypes<'Pipeline_Create'>
  pipelineStages: RouteTypes<'PipelineStage_Create'>
  deals: RouteTypes<'Deal_Create'>
  dealParticipants: RouteTypes<'DealParticipant_Create'>
  contacts: RouteTypes<'Contact_Create'>
}>

export type RecordUpdateRequest = AttachCollection<{
  companies: RouteTypes<'Company_Update'>
  pipelines: RouteTypes<'Pipeline_Update'>
  pipelineStages: RouteTypes<'PipelineStage_Update'>
  deals: RouteTypes<'Deal_Update'>
  dealParticipants: RouteTypes<'DealParticipant_Update'>
  contacts: RouteTypes<'Contact_Update'>
}>

export type RecordDeleteRequest = AttachCollection<{
  companies: RouteTypes<'Company_Delete'>
  pipelines: RouteTypes<'Pipeline_Delete'>
  pipelineStages: RouteTypes<'PipelineStage_Delete'>
  deals: RouteTypes<'Deal_Delete'>
  dealParticipants: RouteTypes<'DealParticipant_Delete'>
  contacts: RouteTypes<'Contact_Delete'>
}>

export const createRecordV2 = defineMutation<
  RecordCreateRequest,
  SingleModelResponse
>().using({
  uri: (args: RecordCreateRequest) =>
    `${__NET_HOST__}/v1/crm/records/${args.$collection}`,
  method: 'POST',
  body: ({ $collection, ...rest }) => rest,
  key: (args) => queryKeys.records(args.$collection),
  invalidate: (args) => {
    const results: QueryKey[] = [queryKeys.records(args.$collection)]

    // When adding a new stage, we need to refetch the pipeline,
    // but we don't know from the request itself which one so we invalidate all of them
    if (args.$collection === 'pipelineStages') {
      results.push(queryKeys.records('pipelines'))
    }

    // When we create a deal with a stage, we need to refetch the pipeline
    if (args.$collection === 'deals' && args.pipelineStageId != null) {
      results.push(queryKeys.records('pipelines'))
    }

    // When creating a DealParticipant, invalidate the specific deal to refetch contacts
    if (
      args.$collection === 'dealParticipants' &&
      'dealId' in args &&
      args.dealId
    ) {
      results.push(queryKeys.record('deals', args.dealId))
    }

    if ('participantOfDealId' in args && args.participantOfDealId) {
      results.push(queryKeys.record('deals', args.participantOfDealId))
    }
    if ('primaryContactOfDealId' in args && args.primaryContactOfDealId) {
      results.push(queryKeys.record('deals', args.primaryContactOfDealId))
    }

    return results
  },
})

export const updateRecordV2 = defineMutation<
  RecordUpdateRequest,
  SingleModelResponse
>().using({
  // TODO: Why does this need to be directly defined (otherwise its not typed properly)
  uri: (args: RecordUpdateRequest) =>
    `${__NET_HOST__}/v1/crm/records/${args.$collection}/${args.id}`,
  method: 'PATCH',
  body: ({ $collection, ...rest }) => rest,
  key: (args) => queryKeys.record(args.$collection, args.id),
  name: `update-record`,
  effects: [
    optimisticUpdate({
      key: () => queryKeys.bootstrap(),
      merge(data, prev) {
        if (!prev) return SKIP_UPDATE
        merge(prev.models[data.$collection][data.id], data)
        return prev
      },
    }),
    optimisticUpdate({
      key: (args) => queryKeys.record(args.$collection, args.id),
      merge(data, prev) {
        if (!prev) return SKIP_UPDATE
        merge(prev.models[data.$collection][data.id], data)
        return prev
      },
    }),
  ],
  invalidate: (args) => {
    const results = [
      queryKeys.record(args.$collection, args.id),
      queryKeys.records(args.$collection),
    ]

    // When updating a stage, we need to refetch the pipeline,
    // but we don't know from the request itself which one so we invalidate all of them
    if (args.$collection === 'pipelineStages') {
      results.push(queryKeys.records('pipelines'))
    }
    // When we update the stage of deal, we need to refetch the pipeline
    if (args.$collection === 'deals' && args.pipelineStageId != null) {
      results.push(queryKeys.records('pipelines'))
    }

    return results
  },
})

export const deleteRecordV2 = defineMutation<RecordDeleteRequest, void>().using(
  {
    uri: (args: RecordDeleteRequest) => {
      const { $collection, id, ...remaining } = args

      const uri = new URL(
        `${__NET_HOST__}/v1/crm/records/${args.$collection}/${args.id}`
      )
      Object.entries(remaining).forEach(([key, value]) => {
        if (value) {
          uri.searchParams.append(key, value)
        }
      })

      return uri.toString()
    },
    method: 'DELETE',
    key: (args) => queryKeys.record(args.$collection, args.id),

    invalidate: (args) => {
      const results = [
        queryKeys.record(args.$collection, args.id),
        queryKeys.records(args.$collection),
      ]

      // When deleting a stage, we need to refetch the pipeline,
      // but we don't know from the request itself which one so we invalidate all of them
      if (args.$collection === 'pipelineStages') {
        results.push(queryKeys.records('pipelines'))
      }

      return results
    },
  }
)

export const createDefaultPipelines = defineMutation<
  void,
  SingleModelListResponse
>().using({
  uri: () => `${__NET_HOST__}/v1/crm/records/pipelines/defaults`,
  method: 'POST',
  key: () => queryKeys.records('pipelines'),
  invalidate: () => [queryKeys.records('pipelines')],
})

export type CrmInitializationResponse = {
  success: boolean
  pipelinesCreated: boolean
  salesWorkspaceCreated: boolean
  salesWorkspaceId: string
  errors: string[]
}

export const initializeCrm = defineMutation<
  void,
  CrmInitializationResponse
>().using({
  uri: () => `${__NET_HOST__}/v1/crm/initialization`,
  method: 'POST',
  key: () => queryKeys.records('pipelines'),
  invalidate: () => [queryKeys.records('pipelines')],
})

export type CreateDealFromContactRequest = {
  contactId: string
  body: DealCreateDto
}

export const createDealFromContact = defineMutation<
  CreateDealFromContactRequest,
  SingleModelResponse
>().using({
  uri: ({ contactId }) =>
    `${__NET_HOST__}/v1/crm/records/contacts/${contactId}/deals`,
  method: 'POST',
  body: ({ body }) => body,
  key: ({ contactId }) => queryKeys.record('contacts', contactId),
  invalidate: () => [
    queryKeys.records('contacts'),
    queryKeys.records('deals'),
    queryKeys.records('dealParticipants'),
  ],
})
