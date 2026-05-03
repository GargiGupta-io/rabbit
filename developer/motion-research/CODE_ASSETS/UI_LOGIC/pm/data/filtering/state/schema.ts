import { createNoneId } from '@motion/shared/identifiers'

import * as v from 'valibot'

export const LooseTextFilterSchema = v.object({
  inverse: v.optional(v.boolean()),
  operator: v.picklist([
    'beginsWith',
    'endsWith',
    'contains',
    'in',
    'defined',
    'equals',
    'empty',
  ]),
  value: v.optional(v.union([v.array(v.string()), v.string()])),
})
export const RecordTextFilterSchema = v.record(
  v.string(),
  v.record(v.string(), LooseTextFilterSchema)
)

export const LooseNumberFilterSchema = v.object({
  inverse: v.optional(v.boolean()),
  operator: v.picklist([
    'range',
    'gt',
    'gte',
    'lt',
    'lte',
    'equals',
    'defined',
    'empty',
  ]),
  value: v.optional(
    v.union([
      v.array(v.string()),
      v.string(),
      v.number(),
      v.optional(v.object({ min: v.number(), max: v.number() })),
    ])
  ),
  name: v.optional(v.string()),
})

export const LooseNonNullableNumberFilterSchema = v.object({
  inverse: v.optional(v.boolean()),
  operator: v.picklist(['range', 'gt', 'gte', 'lt', 'lte', 'equals']),
  value: v.optional(
    v.union([
      v.array(v.string()),
      v.string(),
      v.number(),
      v.optional(v.object({ min: v.number(), max: v.number() })),
    ])
  ),
})

export const RecordNumberFilterSchema = v.record(
  v.string(),
  v.record(v.string(), LooseNumberFilterSchema)
)

export const LooseIdFilterSchema = v.optional(
  v.nullable(
    v.object({
      inverse: v.optional(v.boolean()),
      operator: v.string(),
      value: v.array(v.string()),
    })
  ),
  null
)
export type LooseIdFilterSchema = v.InferInput<typeof LooseIdFilterSchema>

export const LooseNullableIdFilterSchema = v.optional(
  v.nullable(
    v.object({
      inverse: v.optional(v.boolean()),
      operator: v.string(),
      value: v.pipe(
        v.array(v.union([v.string(), v.null_()])),
        v.transform((data) =>
          data.map((x) => (x === null ? createNoneId('user') : x))
        )
      ),
    })
  ),
  null
)
export type LooseNullableIdFilterSchema = v.InferInput<
  typeof LooseNullableIdFilterSchema
>

export const RecordIdFilterSchema = v.record(
  v.string(),
  v.record(v.string(), LooseIdFilterSchema)
)

export const LooseDateFilterSchema = v.optional(
  v.nullable(
    v.object({
      inverse: v.optional(v.boolean()),
      operator: v.string(),
      value: v.optional(v.any()),
      from: v.optional(v.any()),
      to: v.optional(v.any()),
      name: v.optional(v.string()),
      duration: v.optional(v.string()),
    })
  ),
  null
)

export type LooseDateValueFilterSchema = v.InferInput<
  typeof LooseDateFilterSchema
>

export const RecordDateFilterSchema = v.record(
  v.string(),
  v.record(v.string(), LooseDateFilterSchema)
)

export const LooseBooleanFilterSchema = v.optional(v.nullable(v.string()), null)
export type LooseBooleanFilterSchema = v.InferInput<
  typeof LooseBooleanFilterSchema
>

export const InclusionFilterSchema = v.optional(
  v.nullable(v.picklist(['include', 'exclude', 'only'])),
  'exclude'
)
const LooseInclusionFilterSchema = v.optional(
  v.nullable(v.picklist(['include', 'exclude', 'only'])),
  null
)

const CustomFieldsSchema = v.object({
  text: RecordTextFilterSchema,
  url: RecordTextFilterSchema,

  multiSelect: RecordIdFilterSchema,
  select: RecordIdFilterSchema,
  person: RecordIdFilterSchema,
  multiPerson: RecordIdFilterSchema,

  number: RecordNumberFilterSchema,

  date: RecordDateFilterSchema,
})

export const RecurringFilterSchema = v.optional(
  v.nullable(v.picklist(['CURRENT', 'FUTURE', 'ALL'])),
  null
)

export const TypeFilterSchema = v.optional(
  v.nullable(v.array(v.picklist(['RECURRING_INSTANCE', 'NORMAL', 'CHUNK']))),
  null
)

const withOrder = <
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: T
) => v.object({ ordered: v.array(v.string()), filters: schema })

export const Schema = v.object({
  $version: v.literal(9),
  target: v.picklist(['tasks', 'projects']),
  tasks: withOrder(
    v.intersect([
      v.object({
        statusIds: LooseIdFilterSchema,
        stageDefinitionIds: LooseNullableIdFilterSchema,
        assigneeUserIds: LooseNullableIdFilterSchema,
        priorities: LooseIdFilterSchema,
        deadlineStatuses: LooseIdFilterSchema,
        deadlineStatusWithReason: LooseIdFilterSchema,
        labelIds: LooseIdFilterSchema,
        createdByUserIds: LooseIdFilterSchema,
        folderIds: LooseIdFilterSchema,

        dueDate: LooseDateFilterSchema,
        createdTime: LooseDateFilterSchema,
        updatedTime: LooseDateFilterSchema,

        startDate: LooseDateFilterSchema,
        lastInteractedTime: LooseDateFilterSchema,
        completedTime: LooseDateFilterSchema,
        estimatedCompletionTime: LooseDateFilterSchema,
        recurring: RecurringFilterSchema,
        type: TypeFilterSchema,

        scheduledDate: LooseDateFilterSchema,

        autoScheduled: LooseBooleanFilterSchema,
        isBlocked: LooseBooleanFilterSchema,
        isBlocking: LooseBooleanFilterSchema,

        archived: InclusionFilterSchema,
        completed: InclusionFilterSchema,
        canceled: InclusionFilterSchema,
        isUnvisitedStage: LooseInclusionFilterSchema,

        scheduledStatus: LooseIdFilterSchema,
        scheduledEnd: LooseDateFilterSchema,
        scheduledStart: LooseDateFilterSchema,
        endDate: LooseDateFilterSchema,

        completedOrEstimatedTime: LooseDateFilterSchema,

        hasAttachments: LooseBooleanFilterSchema,
      }),
      CustomFieldsSchema,
    ])
  ),

  projects: withOrder(
    v.intersect([
      v.object({
        ids: LooseIdFilterSchema,
        statusIds: LooseIdFilterSchema,
        stageDefinitionIds: LooseNullableIdFilterSchema,
        projectDefinitionIds: LooseNullableIdFilterSchema,
        managerIds: LooseIdFilterSchema,
        priorities: LooseIdFilterSchema,
        deadlineStatuses: LooseIdFilterSchema,
        color: LooseIdFilterSchema,
        labelIds: LooseIdFilterSchema,
        createdByUserIds: LooseIdFilterSchema,
        folderIds: LooseIdFilterSchema,

        dueDate: LooseDateFilterSchema,
        createdTime: LooseDateFilterSchema,
        updatedTime: LooseDateFilterSchema,
        startDate: LooseDateFilterSchema,

        completed: InclusionFilterSchema,

        taskCount: v.nullish(LooseNonNullableNumberFilterSchema, null),
        canceledDuration: v.nullish(LooseNonNullableNumberFilterSchema, null),
        canceledTaskCount: v.nullish(LooseNonNullableNumberFilterSchema, null),
        completedDuration: v.nullish(LooseNonNullableNumberFilterSchema, null),

        completedTime: LooseDateFilterSchema,
        estimatedCompletionTime: LooseDateFilterSchema,
        name: v.nullish(LooseTextFilterSchema, null),

        hasAttachments: LooseBooleanFilterSchema,
      }),
      CustomFieldsSchema,
    ])
  ),
  workspaces: withOrder(
    v.object({
      ids: LooseIdFilterSchema,
    })
  ),
})
