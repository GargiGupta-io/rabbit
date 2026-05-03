import { ShortTextSchema } from '@motion/shared/common'

import z from 'zod/v4'

import {
  DateFieldSchema,
  MultiPersonFieldSchema,
  MultiSelectFieldSchema,
  NumberFieldSchema,
  PersonFieldSchema,
  SelectFieldSchema,
  TextFieldSchema,
  UrlFieldSchema,
} from '../models'
import { createModelSyncEvent, createPushEvent } from '../utils/create-events'

export const CreateTextFieldSchema = TextFieldSchema.pick({
  type: true,
  name: true,
})

export const CreateUrlFieldSchema = UrlFieldSchema.pick({
  type: true,
  name: true,
})

export const CreateDateFieldSchema = DateFieldSchema.pick({
  type: true,
  name: true,
})

export const CreatePersonFieldSchema = PersonFieldSchema.pick({
  type: true,
  name: true,
})

export const CreateMultiPersonFieldSchema = MultiPersonFieldSchema.pick({
  type: true,
  name: true,
})

export const CreateNumberFieldSchema = NumberFieldSchema.pick({
  type: true,
  name: true,
  metadata: true,
})

export const CreateSelectFieldSchema = SelectFieldSchema.pick({
  type: true,
  name: true,
}).extend({
  metadata: SelectFieldSchema.shape.metadata
    .pick({
      options: true,
    })
    .extend({
      options: z.array(
        SelectFieldSchema.shape.metadata.shape.options.element.pick({
          color: true,
          value: true,
        })
      ),
    }),
})

export const CreateMultiSelectFieldSchema = MultiSelectFieldSchema.pick({
  type: true,
  name: true,
}).extend({
  metadata: MultiSelectFieldSchema.shape.metadata
    .pick({
      options: true,
    })
    .extend({
      options: z.array(
        MultiSelectFieldSchema.shape.metadata.shape.options.element.pick({
          color: true,
          value: true,
        })
      ),
    }),
})

export const CreateCustomFieldSchema = z.discriminatedUnion('type', [
  CreateTextFieldSchema,
  CreateUrlFieldSchema,
  CreateDateFieldSchema,
  CreatePersonFieldSchema,
  CreateMultiPersonFieldSchema,
  CreateNumberFieldSchema,
  CreateSelectFieldSchema,
  CreateMultiSelectFieldSchema,
])

export const PushCreateCustomField = createPushEvent(
  'custom-field.create',
  1,
  z.object({
    workspaceId: z.string(),
    field: CreateCustomFieldSchema,
  })
)
export type PushCreateCustomField = z.output<typeof PushCreateCustomField>

export const UpdateTextFieldSchema = TextFieldSchema.pick({
  name: true,
  type: true,
})

export const UpdateUrlFieldSchema = UrlFieldSchema.pick({
  name: true,
  type: true,
})

export const UpdateDateFieldSchema = DateFieldSchema.pick({
  name: true,
  type: true,
})

export const UpdatePersonFieldSchema = PersonFieldSchema.pick({
  name: true,
  type: true,
})

export const UpdateMultiPersonFieldSchema = MultiPersonFieldSchema.pick({
  name: true,
  type: true,
})

export const UpdateNumberFieldSchema = NumberFieldSchema.pick({
  name: true,
  type: true,
  metadata: true,
})

export const UpdateSelectFieldSchema = SelectFieldSchema.pick({
  name: true,
  type: true,
}).extend({
  metadata: SelectFieldSchema.shape.metadata
    .pick({
      options: true,
    })
    .extend({
      options: z.array(
        SelectFieldSchema.shape.metadata.shape.options.element
          .omit({
            deletedTime: true,
          })
          .partial({
            id: true,
          })
      ),
    }),
})

export const UpdateMultiSelectFieldSchema = MultiSelectFieldSchema.pick({
  name: true,
  type: true,
}).extend({
  metadata: MultiSelectFieldSchema.shape.metadata
    .pick({
      options: true,
    })
    .extend({
      options: z.array(
        MultiSelectFieldSchema.shape.metadata.shape.options.element
          .omit({
            deletedTime: true,
          })
          .partial({
            id: true,
          })
      ),
    }),
})

export const UpdateCustomFieldSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  field: z.discriminatedUnion('type', [
    UpdateTextFieldSchema,
    UpdateUrlFieldSchema,
    UpdateDateFieldSchema,
    UpdatePersonFieldSchema,
    UpdateMultiPersonFieldSchema,
    UpdateNumberFieldSchema,
    UpdateSelectFieldSchema,
    UpdateMultiSelectFieldSchema,
  ]),
})
export const PushUpdateCustomField = createPushEvent(
  'custom-field.update',
  1,
  UpdateCustomFieldSchema
)
export type PushUpdateCustomField = z.output<typeof PushUpdateCustomField>

export const PushDeleteCustomField = createPushEvent(
  'custom-field.delete',
  1,
  z.object({ id: z.string(), workspaceId: z.string() })
)
export type PushDeleteCustomField = z.output<typeof PushDeleteCustomField>

export const PushCopyCustomField = createPushEvent(
  'custom-field.copy',
  1,
  z.object({
    destinationWorkspaceIds: ShortTextSchema.array().min(1).max(100),
    workspaceId: ShortTextSchema,
    customFieldInstanceId: ShortTextSchema,
  })
)
export type PushCopyCustomField = z.output<typeof PushCopyCustomField>

export const CustomFieldCreated = createModelSyncEvent(
  'custom-field.created',
  1,
  ['customFields']
)
export type CustomFieldCreated = z.output<typeof CustomFieldCreated>

export const CustomFieldUpdated = createModelSyncEvent(
  'custom-field.updated',
  1,
  ['customFields']
)
export type CustomFieldUpdated = z.output<typeof CustomFieldUpdated>

export const CustomFieldDeleted = createModelSyncEvent(
  'custom-field.hard-deleted',
  1,
  ['customFields']
)
export type CustomFieldDeleted = z.output<typeof CustomFieldDeleted>
