import { createKey, defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

export const queryKeys = {
  root: createKey(['custom-fields']),
  forWorkspace: (id: string) => createKey(queryKeys.root, 'workspaces', id),
}

type CreateCustomField =
  RouteTypes<'CustomFieldsController_createCustomFieldInstance'>

export const createCustomField = defineMutation<
  CreateCustomField['request'],
  CreateCustomField['response']
>().using({
  uri: (args: CreateCustomField['request']) =>
    `/v2/workspaces/${args.workspaceId}/custom-fields`,
  method: 'POST',
  key: (args) => queryKeys.forWorkspace(args.workspaceId),
  invalidate: (args) => queryKeys.forWorkspace(args.workspaceId),
})

type UpdateCustomField =
  RouteTypes<'CustomFieldsController_updateCustomFieldInstance'>

export const updateCustomField = defineMutation<
  UpdateCustomField['request'],
  UpdateCustomField['response']
>().using({
  uri: (args: UpdateCustomField['request']) =>
    `/v2/workspaces/${args.workspaceId}/custom-fields/${args.customFieldId}`,
  method: 'PATCH',
  key: (args) => queryKeys.forWorkspace(args.workspaceId),
  invalidate: (args) => queryKeys.forWorkspace(args.workspaceId),
  body: ({ customFieldId, workspaceId, ...args }) => args,
})

type DeleteCustomField =
  RouteTypes<'CustomFieldsController_deleteCustomFieldInstance'>

export const deleteCustomField = defineMutation<
  DeleteCustomField['request'],
  void
>().using({
  uri: (args) =>
    `/v2/workspaces/${args.workspaceId}/custom-fields/${args.customFieldId}`,
  method: 'DELETE',
  invalidate: (args) => queryKeys.forWorkspace(args.workspaceId),
})

type DuplicateCustomField =
  RouteTypes<'CustomFieldsController_copyCustomFieldInstance'>

export const duplicateCustomField = defineMutation<
  DuplicateCustomField['request'],
  DuplicateCustomField['response']
>().using({
  uri: (args) => `/v2/workspaces/${args.workspaceId}/custom-fields/copy`,
  method: 'POST',
  body: ({ workspaceId, ...args }) => args,
})
