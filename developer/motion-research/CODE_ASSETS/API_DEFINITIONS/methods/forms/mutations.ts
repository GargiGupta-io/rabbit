import type {
  FormCreateDto,
  FormQuestionCreateDto,
  FormQuestionUpdateDto,
  FormRouteCreateDto,
  FormRouteUpdateDto,
  FormSectionCreateDto,
  FormSectionRouteCreateDto,
  FormSectionRouteUpdateDto,
  FormSectionUpdateDto,
  FormUpdateDto,
  SingleModelResponse,
} from '@motion/motion-net-types'
import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

export type { FormCreateDto, FormUpdateDto }

// Form mutations
export const createForm = defineMutation<
  FormCreateDto,
  SingleModelResponse
>().using({
  uri: `${__NET_HOST__}/v1/forms`,
  method: 'POST',
  body: (args) => args,
  invalidate: () => queryKeys.forms(),
})

export const updateForm = defineMutation<
  { formId: string } & FormUpdateDto,
  SingleModelResponse
>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}`,
  method: 'PATCH',
  body: ({ formId, ...args }) => args,
  invalidate: (args) => [queryKeys.form(args.formId), queryKeys.forms()],
})

export const deleteForm = defineMutation<{ formId: string }, void>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}`,
  method: 'DELETE',
  invalidate: (args) => [queryKeys.form(args.formId), queryKeys.forms()],
})

// Section mutations

export const createSection = defineMutation<
  { formId: string } & FormSectionCreateDto,
  SingleModelResponse
>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}/sections`,
  method: 'POST',
  body: ({ formId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const updateSection = defineMutation<
  { formId: string; sectionId: string } & FormSectionUpdateDto,
  SingleModelResponse
>().using({
  uri: ({ formId, sectionId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/sections/${sectionId}`,
  method: 'PATCH',
  body: ({ formId, sectionId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const deleteSection = defineMutation<
  { formId: string; sectionId: string },
  void
>().using({
  uri: ({ formId, sectionId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/sections/${sectionId}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.form(args.formId),
})

// Section route mutations
export const createSectionRoute = defineMutation<
  { formId: string; sectionId: string } & FormSectionRouteCreateDto,
  SingleModelResponse
>().using({
  uri: ({ formId, sectionId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/sections/${sectionId}/routes`,
  method: 'POST',
  body: ({ formId, sectionId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const updateSectionRoute = defineMutation<
  {
    formId: string
    sectionId: string
    routeId: string
  } & FormSectionRouteUpdateDto,
  SingleModelResponse
>().using({
  uri: ({ formId, sectionId, routeId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/sections/${sectionId}/routes/${routeId}`,
  method: 'PATCH',
  body: ({ formId, sectionId, routeId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const deleteSectionRoute = defineMutation<
  { formId: string; sectionId: string; routeId: string },
  void
>().using({
  uri: ({ formId, sectionId, routeId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/sections/${sectionId}/routes/${routeId}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.form(args.formId),
})

// Question mutations
export const createQuestion = defineMutation<
  { formId: string } & FormQuestionCreateDto,
  SingleModelResponse
>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}/questions`,
  method: 'POST',
  body: ({ formId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const updateQuestion = defineMutation<
  { formId: string; questionId: string } & FormQuestionUpdateDto,
  SingleModelResponse
>().using({
  uri: ({ formId, questionId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/questions/${questionId}`,
  method: 'PATCH',
  body: ({ formId, questionId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const deleteQuestion = defineMutation<
  { formId: string; questionId: string },
  void
>().using({
  uri: ({ formId, questionId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/questions/${questionId}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.form(args.formId),
})

// Route mutations
export const createRoute = defineMutation<
  { formId: string } & FormRouteCreateDto,
  SingleModelResponse
>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}/routes`,
  method: 'POST',
  body: ({ formId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const updateRoute = defineMutation<
  { formId: string; routeId: string } & FormRouteUpdateDto,
  SingleModelResponse
>().using({
  uri: ({ formId, routeId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/routes/${routeId}`,
  method: 'PATCH',
  body: ({ formId, routeId, ...args }) => args,
  invalidate: (args) => queryKeys.form(args.formId),
})

export const deleteRoute = defineMutation<
  { formId: string; routeId: string },
  void
>().using({
  uri: ({ formId, routeId }) =>
    `${__NET_HOST__}/v1/forms/${formId}/routes/${routeId}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.form(args.formId),
})

// Publish/Unpublish mutations
export const publishForm = defineMutation<
  { formId: string },
  SingleModelResponse
>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}/publish`,
  method: 'POST',
  invalidate: (args) => [queryKeys.form(args.formId), queryKeys.forms()],
})

export const unpublishForm = defineMutation<
  { formId: string },
  SingleModelResponse
>().using({
  uri: ({ formId }) => `${__NET_HOST__}/v1/forms/${formId}/unpublish`,
  method: 'POST',
  invalidate: (args) => [queryKeys.form(args.formId), queryKeys.forms()],
})
