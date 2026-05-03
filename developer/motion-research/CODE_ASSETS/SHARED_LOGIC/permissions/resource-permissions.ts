import { z } from 'zod/v4'

import {
  AGENT_WORKFLOW_SYSTEM_ROLES,
  INTEGRATION_CONFIG_SYSTEM_ROLES,
  SHEET_SYSTEM_ROLES,
} from './system-roles'

import { ShortTextSchema } from '../common'

/**
 * The supported resource types for sharing.
 */
export const SupportedResourceTypeSchema = z.enum([
  'NOTE',
  'integration-config',
  'agent-workflow',
  'sheet',
])

export type SupportedResourceType = z.infer<typeof SupportedResourceTypeSchema>

/**
 * This schema is used to represent the permissions the current user has for a resource.
 */
export const ResourcePermissionSchema = z.object({
  /**
   * The ID is the same as the resourceId.
   */
  id: ShortTextSchema,
  resourceId: ShortTextSchema,
  resourceType: SupportedResourceTypeSchema.exclude(['NOTE']),
  /**
   * True if the current user can read the resource on the client
   */
  canRead: z.boolean(),
  /**
   * True if the current user can write to the resource on the client
   */
  canWrite: z.boolean(),
  /**
   * True if the current user can delete the resource on the client
   */
  canDelete: z.boolean(),
  /**
   * True if the current user can share the resource on the client
   */
  canShare: z.boolean(),
  role: z.union([
    z.enum(INTEGRATION_CONFIG_SYSTEM_ROLES),
    z.enum(AGENT_WORKFLOW_SYSTEM_ROLES),
    z.enum(SHEET_SYSTEM_ROLES),
  ]),
})

export type ResourcePermission = z.infer<typeof ResourcePermissionSchema>
