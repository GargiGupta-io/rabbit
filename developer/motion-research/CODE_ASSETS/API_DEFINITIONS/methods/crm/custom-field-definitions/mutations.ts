import { defineMutation } from '@motion/rpc'

import { RouteTypes } from '../../types'
import { queryKeys } from '../records/keys'

type CreateCustomFieldDefinition = RouteTypes<'CustomFieldDefinitions_Post'>
export const createCustomFieldDefinition = defineMutation<
  CreateCustomFieldDefinition['request'],
  CreateCustomFieldDefinition['response']
>().using({
  uri: `${__NET_HOST__}/v1/custom-field-definitions`,
  method: 'POST',
  body: (args) => args,
  invalidate: () => queryKeys.recordsShapes(),
})

type UpdateCustomFieldDefinition = RouteTypes<'CustomFieldDefinitions_Patch'>
export const updateCustomFieldDefinition = defineMutation<
  UpdateCustomFieldDefinition['request'],
  UpdateCustomFieldDefinition['response']
>().using({
  uri: (args: UpdateCustomFieldDefinition['request']) =>
    `${__NET_HOST__}/v1/custom-field-definitions/${args.id}`,
  method: 'PATCH',
  body: ({ id, ...rest }) => rest,
  invalidate: () => queryKeys.recordsShapes(),
})

type DeleteCustomFieldDefinition = RouteTypes<'CustomFieldDefinitions_Delete'>
export const deleteCustomFieldDefinition = defineMutation<
  DeleteCustomFieldDefinition['request'],
  DeleteCustomFieldDefinition['response']
>().using({
  uri: (args: DeleteCustomFieldDefinition['request']) =>
    `${__NET_HOST__}/v1/custom-field-definitions/${args.id}`,
  method: 'DELETE',
  invalidate: () => queryKeys.recordsShapes(),
})
