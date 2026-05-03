import { MeetingBotStatusSchema } from '@motion/zod/client'

import * as v from 'valibot'

const EmailFilterSchema = v.object({
  inverse: v.optional(v.boolean()),
  operator: v.picklist(['in']),
  value: v.array(v.string()),
})

const DateFilterSchema = v.object({
  inverse: v.optional(v.boolean()),
  operator: v.picklist([
    'range',
    'defined',
    'defined-relative',
    'empty',
    'gt',
    'gte',
    'lt',
    'lte',
  ]),
  value: v.optional(
    v.union([
      v.array(v.string()),
      v.string(),
      v.number(),
      v.object({ min: v.number(), max: v.number() }),
    ])
  ),
  name: v.optional(v.string()),
})

const MeetingBotStatusFilterSchema = v.object({
  inverse: v.optional(v.boolean()),
  operator: v.picklist(['in']),
  value: v.array(v.picklist(MeetingBotStatusSchema)),
})

export const NotetakerFilterSchema = v.object({
  ids: v.optional(v.array(v.string())),
  startTime: v.optional(DateFilterSchema),
  meetingBotStatus: v.optional(MeetingBotStatusFilterSchema),

  attendees: v.optional(EmailFilterSchema),
  host: v.optional(EmailFilterSchema),
})
export type NotetakerFilterSchema = v.InferInput<typeof NotetakerFilterSchema>
