export const UserTaskDefaultSettingsLevels = ['GLOBAL', 'WORKSPACE'] as const
export type UserTaskDefaultSettingsLevel =
  (typeof UserTaskDefaultSettingsLevels)[number]
