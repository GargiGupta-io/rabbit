import { z } from 'zod/v4'

export const DeadlineTypeSchema = z.enum(['ASAP', 'HARD', 'SOFT', 'NONE'])
