/**
 * These are the display names for the knowledge that is created during onboarding
 */
export const OnboardingKnowledgeDisplayName = {
  Role: 'Role',
  Business: 'Business',
  CompanyWebsite: 'Company Website',
  WebsiteSummary: 'Website summary',
} as const

export type OnboardingKnowledgeDisplayName =
  (typeof OnboardingKnowledgeDisplayName)[keyof typeof OnboardingKnowledgeDisplayName]

export const CommonKnowledgeDisplayName = {
  ...OnboardingKnowledgeDisplayName,
  CompanyName: 'Company Name',
} as const

export type CommonKnowledgeDisplayName =
  (typeof CommonKnowledgeDisplayName)[keyof typeof CommonKnowledgeDisplayName]
