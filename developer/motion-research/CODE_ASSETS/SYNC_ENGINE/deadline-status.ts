import {
  DeadlineStatuses,
  DeadlineStatusWithReason,
} from '@motion/shared/common'

import { z } from 'zod/v4'

export const DeadlineStatusSchema = z.enum(DeadlineStatuses)
export const DeadlineStatusWithReasonSchema = z.enum(DeadlineStatusWithReason)
