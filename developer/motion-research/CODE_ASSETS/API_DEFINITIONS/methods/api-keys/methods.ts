import {
  createKey,
  createKey2,
  defineApi,
  defineMutation,
  typedKey,
} from '@motion/rpc'
import { byValue, Compare } from '@motion/utils/array'

import { type DTO } from '../types'

// https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
const QueryKeys = {
  root: () => createKey('api-keys'),
  list: () => typedKey<GetKeysResponse>().define(QueryKeys.root(), 'list'),
  details: () => createKey2(QueryKeys.root(), 'detail').typed<ApiKeyDto>(),
  detail: (id: string) => createKey(QueryKeys.details(), id),
}

type ApiKeyDto = DTO<'ApiKeyResponse'>
type GetKeysResponse = ApiKeyDto[]

const byCreatedAt = byValue(
  (item: ApiKeyDto) => item.createdTime,
  Compare.caseInsensitive
)

export const get = defineApi<void, GetKeysResponse>().using({
  key: QueryKeys.list(),
  uri: '/api_keys',
  transform: (data) => data.sort(byCreatedAt),
})

type CreateApiKeyDto = DTO<'CreateApiKeyRequest'>
type CreateApiKeyResponseDto = DTO<'CreateApiKeyResponse'>
export const create = defineMutation<
  CreateApiKeyDto,
  CreateApiKeyResponseDto
>().using({
  uri: '/api_keys',
  method: 'POST',
  invalidate: QueryKeys.root(),
})

type UpdateApiKeyDto = DTO<'UpdateApiKeyRequest'>
export const update = defineMutation<UpdateApiKeyDto, ApiKeyDto>().using({
  uri: '/api_keys',
  method: 'PATCH',
  invalidate: ['api-keys'],
})

// TODO: DELETE requests should not have a body
type DeleteApiKeyDto = DTO<'DeleteApiKeyRequest'>
export const deleteKey = defineMutation<DeleteApiKeyDto, void>().using({
  uri: '/api_keys',
  method: 'DELETE',
  invalidate: ['api-keys'],
})
