export const ValidCallToAction = [
  // web specific
  'DISMISSED_TEAM_TRIAL_ENDED_MODAL', // dismissedTeamTrialEndedModal
  'DISMISSED_DESKTOP_APP_DOWNLOAD_PROMPT', // dismissedDesktopAppDownloadPrompt
  'DISMISSED_MOBILE_APP_DOWNLOAD_PROMPT', // dismissedMobileAppDownloadPrompt
  'DISMISSED_JOIN_TEAM_MODAL', // dismissedJoinTeamModal
  'NOTETAKER_ONBOARDING_ALERT', // Notetaker onboarding for existing users
  'NOTETAKER_ONBOARDING_MODAL', // Notetaker onboarding modal for existing users
  'AI_SKILLS_ONBOARDING_MODAL', // AI Skills onboarding tutorial video
  'AI_EMPLOYEES_ONBOARDING_MODAL', // AI Employees onboarding tutorial video
  'AI_EMPLOYEES_TUTORIAL_SECTION_HIDDEN', // Specify if the AI Employees tutorial secstion is hidden
  'AI_TRIAL_TUTORIALS_POPOVER',
  /**
   * Specify if user should see any post onboarding after legacy user upgrade to UBP.
   * Upgrade here means the user opt in to switch to AI plans through the FE.
   */
  'LEGACY_TIER_UPGRADE_POST_ONBOARDING',
  /**
   * Specify if user should see any post onboarding after legacy user migrated to UBP.
   * Upgrade here means the user was part of the migration from legacy to UBP.
   */
  'LEGACY_TIER_MIGRATION_POST_ONBOARDING',
  'AI_EMPLOYEES_IN_APP_ONBOARDING', //  Specify if user has seen in-app AI Employees onboarding
  'LEGACY_TIER_MIGRATION_COMPLETE_MODAL', // Specify if user should see a complete modal after legacy user migrated to UBP
  'SUGGEST_CREDIT_OVERAGES',
  // mobile specific
  'SEEN_SIRI_PROMPT',
  'RESPONDED_TO_IN_APP_REVIEW',
  'IN_APP_REVIEW_LAST_SEEN',
  // gdpr
  'GDRP_SETTINGS',
  'TUTORIALS_POPOVER',
] as const

// release notes (this is dynamic and just a prefix,
// and can have arbitrary values set based on amplitude)

export const WebReleaseNotesPrefix = 'WEB_RELEASE_NOTES' as const
export const MobileReleaseNotesPrefix = 'MOBILE_RELEASE_NOTES' as const

export type WebReleaseNotes = `${typeof WebReleaseNotesPrefix}_${string}`
export type MobileReleaseNotes = `${typeof MobileReleaseNotesPrefix}_${string}`

export type CallToAction =
  | (typeof ValidCallToAction)[number]
  | WebReleaseNotes
  | MobileReleaseNotes
