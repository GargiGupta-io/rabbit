/**
 * Employee profiles that are selectable in the frontend UI.
 */
export const employeeProfiles = [
  'executive_assistant',
  'product',
  'researcher',
  'sales',
  'seo',
  'support',
  'recruiter',
  'project_manager',
  'custom',
] as const

export type EmployeeProfile = (typeof employeeProfiles)[number]
