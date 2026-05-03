/**
 * These are System Roles that are used to determine the permissions of a user for a given resource (with the exception of Notes, which is not fully ported over yet)
 *
 * They can be provisioned via the ShareService, which will use AuthorizationService
 * to create a PermissionRole for the assigned target entity (USER, WORKSPACE, etc) with the provided systemRole as `roleType`.
 *
 * The source of truth to find out what actions each roles give access to, explore the `SystemRoleToPermissionsMap` type in the `shareable-resource.types.ts` file.
 */

export const INTEGRATION_CONFIG_SYSTEM_ROLES = ['full-access', 'view'] as const
export type IntegrationConfigsSystemRoles =
  (typeof INTEGRATION_CONFIG_SYSTEM_ROLES)[number]

export const AGENT_WORKFLOW_SYSTEM_ROLES = [
  'full-access',
  'edit',
  'view',
] as const
export type AgentWorkflowSystemRoles =
  (typeof AGENT_WORKFLOW_SYSTEM_ROLES)[number]

export const SHEET_SYSTEM_ROLES = ['full-access', 'edit', 'view'] as const
export type SheetSystemRoles = (typeof SHEET_SYSTEM_ROLES)[number]
