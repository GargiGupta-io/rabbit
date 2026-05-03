import {
  type CommsItemLabelDefinitionDto,
  type CreateCommsItemLabelDefinitionRequest,
  type UpdateCommsItemLabelDefinitionRequest,
} from '@motion/motion-net-types'
import { defineMutation } from '@motion/rpc'

import { queryKeys } from './keys'

// Labels
type CreateLabelResponse = CommsItemLabelDefinitionDto

export const createLabel = defineMutation<
  CreateCommsItemLabelDefinitionRequest,
  CreateLabelResponse
>().using({
  method: 'POST',
  uri: () => `${__NET_HOST__}/v1/api/comms/items/labels`,
  invalidate: () => queryKeys.labels(),
})

type DeleteLabelRequest = { labelId: string }
type DeleteLabelResponse = void

export const deleteLabel = defineMutation<
  DeleteLabelRequest,
  DeleteLabelResponse
>().using({
  method: 'DELETE',
  uri: (args) =>
    `${__NET_HOST__}/v1/api/comms/items/labels/${encodeURIComponent(args.labelId)}`,
  invalidate: () => queryKeys.labels(),
})

type UpdateLabelRequest = UpdateCommsItemLabelDefinitionRequest & {
  labelId: string
}
type UpdateLabelResponse = CommsItemLabelDefinitionDto

export const updateLabel = defineMutation<
  UpdateLabelRequest,
  UpdateLabelResponse
>().using({
  method: 'PATCH',
  uri: (args) => `${__NET_HOST__}/v1/api/comms/items/labels/${args.labelId}`,
  invalidate: () => queryKeys.labels(),
})
