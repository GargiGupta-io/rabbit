import { z } from 'zod/v4'

export const PriorityLevelSchema = z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW'])
