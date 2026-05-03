import {
  FatalErrorStatusDetailsSchema,
  type MeetingInsightsSchema,
  RetryableErrorStatusDetailsSchema,
} from '@motion/zod/client'

import {
  InProgressStatusDetails,
  isFatalErrorStatus,
  isInProgressStatus,
  isJoiningStatus,
  isProcessingStatus,
  isRetryableErrorStatus,
  isWarningStatus,
  JoiningStatusDetails,
  ProcessingStatusDetails,
  WarningStatusDetails,
} from '../status-details'

describe('status-details', () => {
  const createMockMeetingInsights = (
    status: MeetingInsightsSchema['meetingBotStatus'],
    details: MeetingInsightsSchema['meetingBotStatusDetails']
  ): MeetingInsightsSchema =>
    ({
      meetingBotStatus: status,
      meetingBotStatusDetails: details,
    }) as MeetingInsightsSchema

  describe('isJoiningStatus', () => {
    it.each(JoiningStatusDetails)(
      'returns true for joining status %s',
      (status) => {
        const insights = createMockMeetingInsights('IN_PROGRESS', status)

        expect(isJoiningStatus(insights)).toBe(true)
      }
    )

    it('returns false for non-joining status', () => {
      const insights = createMockMeetingInsights(
        'IN_PROGRESS',
        'BOT_IN_CALL_RECORDING'
      )

      expect(isJoiningStatus(insights)).toBe(false)
    })

    it('returns false for null insights', () => {
      expect(isJoiningStatus(null)).toBe(false)
    })

    it('returns false for undefined insights', () => {
      expect(isJoiningStatus(undefined)).toBe(false)
    })
  })

  describe('isInProgressStatus', () => {
    it.each(InProgressStatusDetails)(
      'returns true for in-progress status %s',
      (status) => {
        const insights = createMockMeetingInsights('IN_PROGRESS', status)

        expect(isInProgressStatus(insights)).toBe(true)
      }
    )

    it('returns false for non-in-progress status', () => {
      const insights = createMockMeetingInsights(
        'IN_PROGRESS',
        'BOT_JOINING_CALL'
      )

      expect(isInProgressStatus(insights)).toBe(false)
    })

    it('returns false for null insights', () => {
      expect(isInProgressStatus(null)).toBe(false)
    })

    it('returns false for undefined insights', () => {
      expect(isInProgressStatus(undefined)).toBe(false)
    })
  })

  describe('isProcessingStatus', () => {
    it.each(ProcessingStatusDetails)(
      'returns true for processing status %s',
      (status) => {
        const insights = createMockMeetingInsights('IN_PROGRESS', status)

        expect(isProcessingStatus(insights)).toBe(true)
      }
    )

    it('returns false for non-processing status', () => {
      const insights = createMockMeetingInsights(
        'IN_PROGRESS',
        'BOT_IN_CALL_RECORDING'
      )

      expect(isProcessingStatus(insights)).toBe(false)
    })

    it('returns false for null insights', () => {
      expect(isProcessingStatus(null)).toBe(false)
    })

    it('returns false for undefined insights', () => {
      expect(isProcessingStatus(undefined)).toBe(false)
    })
  })

  describe('isWarningStatus', () => {
    it.each(WarningStatusDetails)(
      'returns true for warning status %s',
      (status) => {
        const insights = createMockMeetingInsights('COMPLETED', status)

        expect(isWarningStatus(insights)).toBe(true)
      }
    )

    it('returns false for non-warning status', () => {
      const insights = createMockMeetingInsights(
        'COMPLETED',
        'BOT_IN_CALL_RECORDING'
      )

      expect(isWarningStatus(insights)).toBe(false)
    })

    it('returns false for null insights', () => {
      expect(isWarningStatus(null)).toBe(false)
    })

    it('returns false for undefined insights', () => {
      expect(isWarningStatus(undefined)).toBe(false)
    })
  })

  describe('isRetryableErrorStatus', () => {
    it.each(RetryableErrorStatusDetailsSchema)(
      'returns true for retryable error status %s',
      (status) => {
        const insights = createMockMeetingInsights('FAILED', status)

        expect(isRetryableErrorStatus(insights)).toBe(true)
      }
    )

    it.each(FatalErrorStatusDetailsSchema)(
      'returns false for fatal error status %s',
      (status) => {
        const insights = createMockMeetingInsights('FAILED', status)

        expect(isRetryableErrorStatus(insights)).toBe(false)
      }
    )

    it('returns false for null insights', () => {
      expect(isRetryableErrorStatus(null)).toBe(false)
    })

    it('returns false for undefined insights', () => {
      expect(isRetryableErrorStatus(undefined)).toBe(false)
    })
  })

  describe('isFatalErrorStatus', () => {
    it.each(FatalErrorStatusDetailsSchema)(
      'returns true for fatal error status %s',
      (status) => {
        const insights = createMockMeetingInsights('FAILED', status)

        expect(isFatalErrorStatus(insights)).toBe(true)
      }
    )

    it.each(RetryableErrorStatusDetailsSchema)(
      'returns false for retryable error status %s',
      (status) => {
        const insights = createMockMeetingInsights('FAILED', status)

        expect(isFatalErrorStatus(insights)).toBe(false)
      }
    )

    it('returns false for null insights', () => {
      expect(isFatalErrorStatus(null)).toBe(false)
    })

    it('returns false for undefined insights', () => {
      expect(isFatalErrorStatus(undefined)).toBe(false)
    })
  })
})
