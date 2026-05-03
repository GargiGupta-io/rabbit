import {
  aiEmployeesBusinessCreditsTier,
  aiEmployeesLightCreditsTier,
  aiEmployeesPlusCreditsTier,
  aiEmployeesStandardCreditsTier,
  aiEmployeesTier,
  aiWorkplaceCreditsTier,
  aiWorkplaceTier,
  BASE_ORDERED_TIERS,
  basicTier,
  businessAITier,
  businessPlusTier,
  businessTier,
  CREDIT_TIER_FEATURES_MAP,
  enterpriseTier,
  getAutoScheduleWindowLimits,
  getTierBulletHeader,
  getTierDescription,
  getTierTitle,
  isCreditBasedTier,
  proAITier,
  proTier,
} from '../constants'

describe('Tiered Pricing Constants', () => {
  describe('getTierTitle', () => {
    it('returns correct titles for all tiers', () => {
      expect(getTierTitle(basicTier)).toBe('Basic')
      expect(getTierTitle(proTier)).toBe('Pro')
      expect(getTierTitle(proAITier)).toBe('Pro AI')
      expect(getTierTitle(enterpriseTier)).toBe('Enterprise')
    })

    it('returns undefined for invalid tier', () => {
      expect(getTierTitle('INVALID' as any)).toBeUndefined()
    })
  })

  describe('getTierBulletHeader', () => {
    it('returns correct headers for all base tiers', () => {
      expect(getTierBulletHeader(proAITier, BASE_ORDERED_TIERS)).toBe('')
      expect(getTierBulletHeader(businessAITier, BASE_ORDERED_TIERS)).toBe(
        'Includes Pro AI, plus:'
      )
      expect(getTierBulletHeader(enterpriseTier, BASE_ORDERED_TIERS)).toBe(
        'Includes Business AI, plus:'
      )
    })

    it('returns correct headers for exp-2', () => {
      const tiers = [basicTier, proTier, proAITier, enterpriseTier]

      expect(getTierBulletHeader(basicTier, tiers)).toBe('')
      expect(getTierBulletHeader(proTier, tiers)).toBe('Includes Basic, plus:')
      expect(getTierBulletHeader(proAITier, tiers)).toBe('Includes Pro, plus:')
      expect(getTierBulletHeader(enterpriseTier, tiers)).toBe(
        'Includes Pro AI, plus:'
      )
    })

    it('returns correct headers for exp-3', () => {
      const tiers = [
        basicTier,
        proTier,
        businessTier,
        businessPlusTier,
        enterpriseTier,
      ]

      expect(getTierBulletHeader(basicTier, tiers)).toBe('')
      expect(getTierBulletHeader(proTier, tiers)).toBe('Includes Basic, plus:')
      expect(getTierBulletHeader(businessTier, tiers)).toBe(
        'Includes Pro, plus:'
      )
      expect(getTierBulletHeader(businessPlusTier, tiers)).toBe(
        'Includes Business, plus:'
      )
      expect(getTierBulletHeader(enterpriseTier, tiers)).toBe(
        'Includes Business Plus, plus:'
      )
    })

    it('returns empty string for invalid tier', () => {
      expect(getTierBulletHeader('INVALID' as any, BASE_ORDERED_TIERS)).toBe('')
    })
  })

  describe('getTierDescription', () => {
    it('returns non-empty string for all tiers', () => {
      expect(getTierDescription(basicTier)).toBeTruthy()
      expect(getTierDescription(proTier)).toBeTruthy()
      expect(getTierDescription(proAITier)).toBeTruthy()
      expect(getTierDescription(businessAITier)).toBeTruthy()
      expect(getTierDescription(aiWorkplaceTier)).toBeTruthy()
      expect(getTierDescription(aiEmployeesTier)).toBeTruthy()
    })

    it('returns different descriptions for enterprise tier with different AI settings', () => {
      const descriptionWithAI = getTierDescription(enterpriseTier, true)
      const descriptionWithoutAI = getTierDescription(enterpriseTier, false)

      expect(descriptionWithAI).toBeTruthy()
      expect(descriptionWithoutAI).toBeTruthy()
      expect(descriptionWithAI).not.toBe(descriptionWithoutAI)
    })

    it('returns empty string for invalid tier', () => {
      expect(getTierDescription('INVALID' as any)).toBe('')
    })
  })

  describe('isCreditBasedTier', () => {
    it('returns true for credit-based tiers', () => {
      expect(isCreditBasedTier(aiWorkplaceCreditsTier)).toBe(true)
      expect(isCreditBasedTier(aiEmployeesLightCreditsTier)).toBe(true)
      expect(isCreditBasedTier(aiEmployeesStandardCreditsTier)).toBe(true)
      expect(isCreditBasedTier(aiEmployeesPlusCreditsTier)).toBe(true)
      expect(isCreditBasedTier(aiEmployeesBusinessCreditsTier)).toBe(true)
    })

    it('returns false for enterprise tier', () => {
      expect(isCreditBasedTier(enterpriseTier)).toBe(false)
    })

    it('returns false for non-credit tiers', () => {
      expect(isCreditBasedTier(basicTier)).toBe(false)
      expect(isCreditBasedTier(proTier)).toBe(false)
      expect(isCreditBasedTier(proAITier)).toBe(false)
      expect(isCreditBasedTier(businessAITier)).toBe(false)
    })

    it('returns false for undefined tier', () => {
      expect(isCreditBasedTier(undefined)).toBe(false)
    })
  })

  describe('CREDIT_TIER_FEATURES_MAP', () => {
    it('has defined structure for all credit tiers', () => {
      expect(CREDIT_TIER_FEATURES_MAP.AIWORKPLACE_CREDITS).toBeDefined()
      expect(CREDIT_TIER_FEATURES_MAP.AIEMPLOYEES_LIGHT_CREDITS).toBeDefined()
      expect(
        CREDIT_TIER_FEATURES_MAP.AIEMPLOYEES_STANDARD_CREDITS
      ).toBeDefined()
      expect(CREDIT_TIER_FEATURES_MAP.AIEMPLOYEES_PLUS_CREDITS).toBeDefined()
      expect(
        CREDIT_TIER_FEATURES_MAP.AIEMPLOYEES_BUSINESS_CREDITS
      ).toBeDefined()
      expect(CREDIT_TIER_FEATURES_MAP.ENTERPRISE).toBeDefined()
    })

    it('includes all required features for each tier', () => {
      const requiredFeatures = [
        'AI Projects & Tasks',
        'AI Calendar & Meetings',
        'AI Docs, Wiki, & Notes',
        'AI Sheets & Databases',
        'AI Dashboards & Reports',
        'iOS, Android, Desktop apps',
        'Customer Support',
        'Integration Connections',
      ]

      Object.values(CREDIT_TIER_FEATURES_MAP).forEach((tierFeatures) => {
        requiredFeatures.forEach((feature) => {
          expect(
            tierFeatures?.[feature as keyof typeof tierFeatures]
          ).toBeDefined()
        })
      })
    })

    it('has consistent data types for boolean features', () => {
      const booleanFeatures = [
        'AI Projects & Tasks',
        'AI Calendar & Meetings',
        'AI Docs, Wiki, & Notes',
        'AI Sheets & Databases',
        'AI Dashboards & Reports',
        'iOS, Android, Desktop apps',
        'Customer Support',
        'AI Executive Assistant',
        'AI Sales Representative',
        'AI Customer Support',
        'AI Marketing Associate',
        'AI Recruiter',
        'AI Researcher',
        'AI Project Manager',
        'AI HR & Legal Assistant',
        'HTTP Blocks',
        'Priority Business Support',
        'Build your own AI Employee',
        'Custom API and Webhooks',
        'Custom AI Employees (Built by Motion Engineers)',
        'Custom Integrations (Built by Motion Engineers)',
        'White Glove Onboarding, Implementation, and Support',
        'Ongoing dedicated Forward Deployed Engineer',
      ]

      Object.values(CREDIT_TIER_FEATURES_MAP).forEach((tierFeatures) => {
        booleanFeatures.forEach((feature) => {
          const value = tierFeatures?.[feature as keyof typeof tierFeatures]
          if (value !== undefined) {
            expect(typeof value).toBe('boolean')
          }
        })
      })
    })
  })

  describe('getAuthScheduleWindowLimits', () => {
    it('has correct window limits for all tiers', () => {
      expect(getAutoScheduleWindowLimits(basicTier)).toBe(14)
      expect(getAutoScheduleWindowLimits(proTier)).toBe(92)
      expect(getAutoScheduleWindowLimits(proAITier)).toBe(92)
      expect(getAutoScheduleWindowLimits(enterpriseTier)).toBe(92)
    })
  })
})
