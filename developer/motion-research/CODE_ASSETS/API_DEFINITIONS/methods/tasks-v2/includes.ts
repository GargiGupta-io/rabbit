import { type TasksV2QueryIncludeSchema } from '@motion/zod/client'

export const taskAllIncludes = [
  'parent',
  'chunks',
  'blockers',
  'attachments',
  'event',
] satisfies TasksV2QueryIncludeSchema[]
