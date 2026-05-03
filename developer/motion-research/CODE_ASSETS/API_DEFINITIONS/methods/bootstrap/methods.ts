import { defineApi } from '@motion/rpc'
import type {
  BootstrapRequestSchema,
  BootstrapResponseSchema,
} from '@motion/schema-sync-engine/dtos'

/**
 * Bootstrap endpoint for fetching initial store data
 * POST /v2/ui/bootstrap
 */
export const fetchBootstrap = defineApi<
  BootstrapRequestSchema,
  BootstrapResponseSchema
>().using({
  method: 'POST',
  uri: '/v2/ui/bootstrap',
  body: (args) => args,
  key: (args) => ['bootstrap', args] as const,
})
