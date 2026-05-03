import { z } from 'zod/v4'

import { IsoDateTimeSchema } from '../common'

export const BaseSchema = z.object({
  id: z.string().min(1),
  createdTime: IsoDateTimeSchema,
  updatedTime: IsoDateTimeSchema.nullable(),
  deletedTime: IsoDateTimeSchema.nullable(),
})
