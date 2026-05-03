import type { UserNotificationPreferences } from '@motion/shared/notifications'

import { type NotificationPreferenceId } from './constants'

/**
 * Safely access notification preference value with proper type checking.
 * This utility consolidates notification preference access logic across the app
 * to maintain consistency and reduce code duplication.
 *
 * @param preferences - User notification preferences object (can be null/undefined)
 * @param preferenceId - The notification preference ID to check
 * @returns boolean value of the preference, or false if not found/invalid
 */
export const getNotificationPreferenceValue = (
  preferences: UserNotificationPreferences | null | undefined,
  preferenceId: NotificationPreferenceId
): boolean => {
  if (!preferences) return false
  return Boolean(
    preferences[preferenceId as unknown as keyof UserNotificationPreferences]
  )
}
