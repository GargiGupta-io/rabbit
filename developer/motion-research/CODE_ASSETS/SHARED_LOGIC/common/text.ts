import z from 'zod/v4'

export const TrimmedTextSchema = z.string().trim()
export const LongTextSchema = TrimmedTextSchema.max(100_000)
export const DefaultLongTextSchema = LongTextSchema.default('').optional()

export const VeryLongTextSchema = TrimmedTextSchema.max(500_000)

export const ShortTextSchema = TrimmedTextSchema.min(1).max(100)
// Allow zero-length, null, and undefined.
// Common use-case is a retool optional field: depending on what you do it can send various falsy things
export const ShortTextFalsyableSchema = TrimmedTextSchema.min(0)
  .max(100)
  .nullish()
