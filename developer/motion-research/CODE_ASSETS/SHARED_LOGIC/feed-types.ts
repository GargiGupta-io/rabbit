import z from 'zod/v4'

import { CustomFieldValuesSchema, FieldTypeSchema } from '../custom-fields'

const BaseContext = z.object({
  id: z.string(),
  name: z.string().optional(),
})

export type BaseContext = z.infer<typeof BaseContext>

const LabelContext = BaseContext.merge(
  z.object({
    name: z.string(),
    color: z.string(),
    sortPosition: z.string().optional(),
  })
)

export type LabelContext = z.infer<typeof LabelContext>

const StatusContext = BaseContext.merge(
  z.object({
    name: z.string(),
    color: z.string(),
  })
)

export type StatusContext = z.infer<typeof StatusContext>

const StageContext = BaseContext.merge(
  z.object({
    name: z.string(),
    color: z.string(),
    // This is set if this stage was created as part of initial project creation.
    initial: z.boolean().optional(),
  })
)

export type StageContext = z.infer<typeof StageContext>

const ProjectDefinitionContext = BaseContext.merge(
  z.object({
    name: z.string(),
    color: z.string(),
  })
)

export type ProjectDefinitionContext = z.infer<typeof ProjectDefinitionContext>

const ActivityWorkspacePropertyUpdatedJson = z.object({
  field: z.literal('workspaceId'),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: BaseContext.optional(),
  newContext: BaseContext.optional(),
})

export type ActivityWorkspacePropertyUpdatedJson = z.infer<
  typeof ActivityWorkspacePropertyUpdatedJson
>

const ActivityProjectPropertyUpdatedJson = z.object({
  field: z.literal('projectId'),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: BaseContext.optional(),
  newContext: BaseContext.optional(),
})

export type ActivityProjectPropertyUpdatedJson = z.infer<
  typeof ActivityProjectPropertyUpdatedJson
>

const ActivityStatusPropertyUpdatedJson = z.object({
  field: z.literal('statusId'),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: StatusContext.optional(),
  newContext: StatusContext.optional(),
})

export type ActivityStatusPropertyUpdatedJson = z.infer<
  typeof ActivityStatusPropertyUpdatedJson
>

const ActivityStagePropertyUpdatedJson = z.object({
  field: z.enum(['stageDefinitionId', 'activeStageDefinitionId']),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: StageContext.optional(),
  newContext: StageContext.optional(),
})

export type ActivityStagePropertyUpdatedJson = z.infer<
  typeof ActivityStagePropertyUpdatedJson
>

const ActivityStringPropertyUpdatedJson = z.object({
  field: z.enum(['priorityLevel', 'name', 'description', 'managerId', 'color']),
  oldValue: z.union([z.string(), z.null(), z.undefined()]),
  newValue: z.union([z.string(), z.null(), z.undefined()]),
})

const ActivityNumberPropertyUpdatedJson = z.object({
  field: z.enum(['duration', 'completedDuration']),
  oldValue: z.union([z.number(), z.null()]),
  newValue: z.union([z.number(), z.null()]),
})

const DateTimeSchema = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.date()])
  .transform((value) => {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return value
  })

const ActivityTaskDatePropertyUpdatedJson = z.object({
  field: z.enum(['archivedTime', 'scheduledStart', 'scheduledEnd']),
  oldValue: DateTimeSchema.nullable(),
  newValue: DateTimeSchema.nullable(),
})

const ActivityDatePropertyUpdatedJson = z.object({
  field: z.enum(['startDate', 'dueDate']),
  oldValue: DateTimeSchema.nullable(),
  newValue: DateTimeSchema.nullable(),
})

const ActivityAssigneesPropertyUpdatedJson = z.object({
  field: z.literal('assignees'),
  oldValue: z.string().array(),
  newValue: z.string().array(),
})

const ActivityBooleanPropertyUpdatedJson = z.object({
  field: z.enum(['isAutoScheduled', 'isSyncingWithDefinition']),
  oldValue: z.boolean(),
  newValue: z.boolean(),
})

const ActivityBlockedByPropertyUpdatedJson = z.object({
  field: z.literal('blockedBy'),
  newBlockedBy: z.string().array(),
  noLongerBlockedBy: z.string().array(),
})

export type ActivityBlockedByPropertyUpdatedJson = z.infer<
  typeof ActivityBlockedByPropertyUpdatedJson
>

const ActivityBlockingPropertyUpdatedJson = z.object({
  field: z.literal('blocking'),
  newBlocking: z.string().array(),
  noLongerBlocking: z.string().array(),
})

export type ActivityBlockingPropertyUpdatedJson = z.infer<
  typeof ActivityBlockingPropertyUpdatedJson
>

export type ActivityAssigneesPropertyUpdatedJson = z.infer<
  typeof ActivityAssigneesPropertyUpdatedJson
>

const ActivityLabelsPropertyUpdatedJson = z.object({
  field: z.literal('labels'),
  oldValue: z.string().array(),
  newValue: z.string().array(),
  oldContext: LabelContext.array().optional(),
  newContext: LabelContext.array().optional(),
})

export type ActivityLabelsPropertyUpdatedJson = z.infer<
  typeof ActivityLabelsPropertyUpdatedJson
>

const ActivityCustomFieldPropertyUpdatedJson = z.object({
  field: z.literal('customFieldValue'),

  // This is a helper lifted from the actual values. It's redudant, but should help
  // with the rendering logic in the client.
  type: FieldTypeSchema,

  name: z.string(),
  instanceId: z.string(),

  oldValue: CustomFieldValuesSchema.nullable(),
  newValue: CustomFieldValuesSchema.nullable(),
})

export type ActivityCustomFieldPropertyUpdatedJson = z.infer<
  typeof ActivityCustomFieldPropertyUpdatedJson
>

const BaseActivityAttachmentMetadataJson = z.object({
  uploadedFileId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
})

export const ActivityAttachmentCreatedMetadataJson =
  BaseActivityAttachmentMetadataJson

export type ActivityAttachmentCreatedMetadataJson = z.infer<
  typeof ActivityAttachmentCreatedMetadataJson
>

export const ActivityAttachmentDeletedMetadataJson =
  BaseActivityAttachmentMetadataJson

export type ActivityAttachmentDeletedMetadataJson = z.infer<
  typeof ActivityAttachmentDeletedMetadataJson
>

const ActivityAttachmentFilenameUpdatedJson =
  BaseActivityAttachmentMetadataJson.extend({
    field: z.literal('fileName'),
    oldValue: z.string(),
    newValue: z.string(),
  })

export type ActivityAttachmentFilenameUpdatedJson = z.infer<
  typeof ActivityAttachmentFilenameUpdatedJson
>

const ActivityStageDueDateUpdatedMetadataJson = z.object({
  field: z.literal('stageDueDate'),
  oldValue: DateTimeSchema.nullable(),
  newValue: DateTimeSchema.nullable(),
  context: StageContext,
})

export type ActivityStageDueDateUpdatedMetadataJson = z.infer<
  typeof ActivityStageDueDateUpdatedMetadataJson
>

const ActivityStageAddedMetadataJson = z.object({
  field: z.literal('stageAdded'),
  stage: StageContext,
})

export type ActivityStageAddedMetadataJson = z.infer<
  typeof ActivityStageAddedMetadataJson
>

const ActivityStageRemovedMetadataJson = z.object({
  field: z.literal('stageRemoved'),
  stage: StageContext,
})

export type ActivityStageRemovedMetadataJson = z.infer<
  typeof ActivityStageRemovedMetadataJson
>

const ActivityProjectDefinitionUpdatedMetadataJson = z.object({
  field: z.literal('projectDefinitionId'),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: ProjectDefinitionContext.optional(),
  newContext: ProjectDefinitionContext.optional(),
})

export type ActivityProjectDefinitionUpdatedMetadataJson = z.infer<
  typeof ActivityProjectDefinitionUpdatedMetadataJson
>

const ActivityProjectDefinitionDeletedMetadataJson = z.object({
  field: z.literal('projectDefinitionDeleted'),
  oldValue: z.string(),
  newValue: z.null(),
  oldContext: ProjectDefinitionContext,
})

export type ActivityProjectDefinitionDeletedMetadataJson = z.infer<
  typeof ActivityProjectDefinitionDeletedMetadataJson
>

const FolderContext = z.object({
  id: z.string(),
  name: z.string().nullable(),
  color: z.string(),
})

const ActivityFolderPropertyUpdatedJson = z.object({
  field: z.literal('folderId'),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: FolderContext.optional(),
  newContext: FolderContext.optional(),
})

export type ActivityFolderPropertyUpdatedJson = z.infer<
  typeof ActivityFolderPropertyUpdatedJson
>

export const FolderItemContext = z.object({
  itemId: z.string(),
  itemType: z.enum(['NOTE', 'PROJECT', 'SHEET']),
  name: z.string().nullable(),
  color: z.string().nullable(),
})

const ActivityParentFolderItemPropertyUpdatedJson = z.object({
  field: z.literal('parentFolderItemId'),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  oldContext: FolderItemContext.optional(),
  newContext: FolderItemContext.optional(),
})

export type ActivityParentFolderItemPropertyUpdatedJson = z.infer<
  typeof ActivityParentFolderItemPropertyUpdatedJson
>

export const ActivityTaskUpdatedMetadataJson = z.discriminatedUnion('field', [
  ActivityWorkspacePropertyUpdatedJson,
  ActivityProjectPropertyUpdatedJson,
  ActivityStatusPropertyUpdatedJson,
  ActivityStringPropertyUpdatedJson,
  ActivityNumberPropertyUpdatedJson,
  ActivityDatePropertyUpdatedJson,
  ActivityTaskDatePropertyUpdatedJson,
  ActivityAssigneesPropertyUpdatedJson,
  ActivityLabelsPropertyUpdatedJson,
  ActivityBooleanPropertyUpdatedJson,
  ActivityStagePropertyUpdatedJson,
  ActivityBlockedByPropertyUpdatedJson,
  ActivityBlockingPropertyUpdatedJson,
  ActivityCustomFieldPropertyUpdatedJson,
])

export const ActivityProjectUpdatedMetadataJson = z.discriminatedUnion(
  'field',
  [
    ActivityWorkspacePropertyUpdatedJson,
    ActivityStringPropertyUpdatedJson,
    ActivityStatusPropertyUpdatedJson,
    ActivityDatePropertyUpdatedJson,
    ActivityAssigneesPropertyUpdatedJson,
    ActivityLabelsPropertyUpdatedJson,
    ActivityStagePropertyUpdatedJson,
    ActivityCustomFieldPropertyUpdatedJson,
    ActivityStageDueDateUpdatedMetadataJson,
    ActivityFolderPropertyUpdatedJson,
    ActivityProjectDefinitionUpdatedMetadataJson,
    ActivityProjectDefinitionDeletedMetadataJson,
    ActivityStageAddedMetadataJson,
    ActivityStageRemovedMetadataJson,
  ]
)

export const ActivityCommentCreatedMetadataJson = z.object({
  commentId: z.string().min(1),
})

export const ActivityAttachmentPropertyUpdatedMetadataJson =
  z.discriminatedUnion('field', [ActivityAttachmentFilenameUpdatedJson])

export const ActivityNoteUpdatedMetadataJson = z.discriminatedUnion('field', [
  ActivityFolderPropertyUpdatedJson,
  ActivityStringPropertyUpdatedJson,
  ActivityParentFolderItemPropertyUpdatedJson,
])

export const ActivityClientShareUpdatedMetadataJson = z.object({
  shared: z.boolean(),
})
