import type {
  SingleModelListResponse,
  SingleModelResponse,
} from '@motion/motion-net-types'
import { defineApi } from '@motion/rpc'

import { queryKeys } from './keys'

export const getForms = defineApi<void, SingleModelListResponse>().using({
  method: 'GET',
  uri: `${__NET_HOST__}/v1/forms`,
  key: queryKeys.forms(),
})

export const getForm = defineApi<
  { formId: string },
  SingleModelResponse
>().using({
  method: 'GET',
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}`,
  key: ({ formId }) => queryKeys.form(formId),
})

export const getFormResponses = defineApi<
  { formId: string },
  SingleModelListResponse
>().using({
  method: 'GET',
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}/responses`,
  key: ({ formId }) => queryKeys.formResponses(formId),
})

export const getFormResponse = defineApi<
  { formId: string; responseId: string },
  SingleModelResponse
>().using({
  method: 'GET',
  uri: ({ formId, responseId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/responses/${responseId}`,
  key: ({ responseId }) => queryKeys.formResponse(responseId),
})

export const getFormPresets = defineApi<void, SingleModelListResponse>().using({
  method: 'GET',
  uri: `${__NET_HOST__}/v1/forms/presets`,
  key: queryKeys.formPresets(),
})

/**
 * Get the form response linked to an entity via EntityLinks.
 * Follows the Notes pattern: /v1/notes/entity/{entityId}
 */
export const getFormResponseForEntity = defineApi<
  { entityId: string },
  SingleModelResponse
>().using({
  method: 'GET',
  uri: ({ entityId }) =>
    `${__NET_HOST__}/v1/forms/responses/entity/${entityId}`,
  key: ({ entityId }) => queryKeys.formResponseForEntity(entityId),
})
