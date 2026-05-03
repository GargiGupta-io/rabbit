import { defineMutation } from '@motion/rpc'

/**
 * PowerSync CRUD operation
 */
export type PowerSyncCrudOperation = {
  op_id: number
  op: 'PUT' | 'PATCH' | 'DELETE'
  type: string
  id: string
  tx_id?: number
  data?: Record<string, unknown>
  old?: Record<string, unknown>
  metadata?: string
}

/**
 * PowerSync upload request
 */
export type PowerSyncUploadRequest = {
  operations: PowerSyncCrudOperation[]
}

/**
 * PowerSync upload response
 */
export type PowerSyncUploadResponse = {
  success: boolean
  errors?: Array<{ operation: number; error: string }>
  idMappings?: Array<{ tempId: string; realId: string; table: string }>
}

/**
 * Upload CRUD operations from PowerSync client
 *
 * Batch endpoint for syncing offline changes to server.
 * Used as fallback for models without specific handlers.
 */
export const uploadPowerSyncOperations = defineMutation<
  PowerSyncUploadRequest,
  PowerSyncUploadResponse
>().using({
  method: 'POST',
  uri: () => `/powersync/upload`,
})
