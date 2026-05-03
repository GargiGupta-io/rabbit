import z from 'zod/v4'

import { parsePosition, parseRevision, serializePosition } from '../utils/parse'

export const RevisionOutSchema = z.pipe(
  z.union([z.string(), z.bigint(), z.number()]),
  z.transform((b) => {
    if (typeof b === 'string') return b
    return `0x${b.toString(16)}`
  })
)

export const RevisionInSchema = z.pipe(
  z.union([z.string(), z.bigint(), z.number()]),
  z.transform((v) => {
    if (typeof v === 'bigint') return v
    return BigInt(v)
  })
)

export const ReadPositionInSchema = z.pipe(
  z.string(),
  z.transform((v) => {
    if (v === 'start' || v === 'end') return v
    if (v.startsWith('0x')) {
      const revision = parseRevision(v)
      return { commit: revision, prepare: revision }
    }
    return parsePosition(v)
  })
)

export const AllStreamPositionOutSchema = z.pipe(
  z.union([
    z.string(),
    z.number(),
    z.bigint(),
    z.object({ commit: z.bigint(), prepare: z.bigint() }),
  ]),
  z.transform((v) => {
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'bigint') {
      return serializePosition({ commit: BigInt(v), prepare: BigInt(v) })
    }

    return serializePosition(v)
  })
)
