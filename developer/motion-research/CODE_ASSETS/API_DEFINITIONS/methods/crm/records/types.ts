import {
  CompaniesListResponse,
  CompaniesSingleResponse,
  ContactsListResponse,
  ContactsSingleResponse,
  DealParticipantsSingleResponse,
  DealsListResponse,
  DealsSingleResponse,
  PipelinesListResponse,
  PipelinesSingleResponse,
  PipelineStagesSingleResponse,
} from '@motion/motion-net-types'
import { Prettify } from '@motion/zod/client'

import { RouteTypes } from '../../types-index'

export type AttachCollection<T extends Record<string, any>> = Prettify<
  {
    [K in keyof T]: T[K] extends void
      ? never
      : T[K]['request'] & { $collection: K }
  }[keyof T]
>

export type RecordListResponse =
  | CompaniesListResponse
  | ContactsListResponse
  | PipelinesListResponse
  | DealsListResponse

export type RecordSingleResponse =
  | CompaniesSingleResponse
  | ContactsSingleResponse
  | PipelinesSingleResponse
  | DealsSingleResponse
  | PipelineStagesSingleResponse
  | DealParticipantsSingleResponse

export type RecordListResponseOf<
  T extends RecordListResponse['meta']['model'],
> = Extract<RecordListResponse, { meta: { model: T } }>

export type RecordSingleResponseOf<
  T extends RecordSingleResponse['meta']['model'],
> = Extract<RecordSingleResponse, { meta: { model: T } }>

export type RecordGetRequest = AttachCollection<{
  companies: RouteTypes<'Company_GetById'>
  pipelines: RouteTypes<'Pipeline_GetById'>
  pipelineStages: RouteTypes<'PipelineStage_GetById'>
  deals: RouteTypes<'Deal_GetById'>
  dealParticipants: RouteTypes<'DealParticipant_GetById'>
  contacts: RouteTypes<'Contact_GetById'>
}>

export type RecordQueryRequest = AttachCollection<{
  companies: RouteTypes<'Company_Query'>
  pipelines: RouteTypes<'Pipeline_Query'>
  deals: RouteTypes<'Deal_Query'>
  contacts: RouteTypes<'Contact_Query'>
}>
