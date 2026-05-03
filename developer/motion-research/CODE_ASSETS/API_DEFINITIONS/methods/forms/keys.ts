import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('forms'),
  forms: () => createKey(queryKeys.root(), 'forms'),
  form: (formId: string) => createKey(queryKeys.root(), 'form', formId),
  formResponse: (responseId: string) =>
    createKey(queryKeys.root(), 'form-response', responseId),
  formResponses: (formId: string) =>
    createKey(queryKeys.root(), 'form-responses', formId),
  formResponseForEntity: (entityId: string) =>
    createKey(queryKeys.root(), 'response-for-entity', entityId),
  formPresets: () => createKey(queryKeys.root(), 'form-presets'),
}
