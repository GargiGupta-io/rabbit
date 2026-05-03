import {
  type ColorFilterSchema,
  type DateFilterSchema,
  type DeadlineStatusFilterSchema,
  type DeadlineStatusWithReasonFilterSchema,
  type IdFilterSchema,
  type Inclusion,
  type LogicalNumberFilterSchema,
  type NumberFilterSchema,
  type PriorityFilterSchema,
  type RecurringFilterSchema,
  type ScheduledStatusFilterSchema,
  type StringFilterSchema,
  type TaskTypeFilterSchema,
} from '@motion/zod/client'

export type TaskFilter = {
  statusIds: IdFilterSchema | null
  stageDefinitionIds: IdFilterSchema | null
  assigneeUserIds: IdFilterSchema | null
  priorities: PriorityFilterSchema | null
  deadlineStatuses: DeadlineStatusFilterSchema | null
  deadlineStatusWithReason: DeadlineStatusWithReasonFilterSchema | null
  labelIds: IdFilterSchema | null
  createdByUserIds: IdFilterSchema | null
  folderIds: IdFilterSchema | null

  dueDate: DateFilterSchema | null
  createdTime: DateFilterSchema | null
  updatedTime: DateFilterSchema | null
  lastInteractedTime: DateFilterSchema | null
  estimatedCompletionTime: DateFilterSchema | null

  startDate: DateFilterSchema | null
  endDate: DateFilterSchema | null
  completedTime: DateFilterSchema | null

  scheduledStatus: ScheduledStatusFilterSchema | null
  scheduledDate: DateFilterSchema | null
  scheduledStart: DateFilterSchema | null
  scheduledEnd: DateFilterSchema | null

  recurring: RecurringFilterSchema | null
  autoScheduled: Inclusion | null
  isBlocked: Inclusion | null
  isBlocking: Inclusion | null

  completed: Inclusion | null
  canceled: Inclusion | null
  archived: Inclusion | null

  isUnvisitedStage: Inclusion | null
  completedOrEstimatedTime: DateFilterSchema | null
  hasAttachments: Inclusion | null

  type: TaskTypeFilterSchema[] | null
} & CustomFieldFilters

export type SupportedCustomFieldFilterStringOperators =
  | 'contains'
  | 'beginsWith'
  | 'endsWith'
  | 'empty'

export type SupportedStringFilterSchema = Extract<
  StringFilterSchema,
  { operator: SupportedCustomFieldFilterStringOperators }
>

export type SupportedCustomFieldFilterNumberOperators =
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'equals'
  | 'range'
  | 'empty'

export type SupportedNumberFilterSchema = Extract<
  NumberFilterSchema,
  { operator: SupportedCustomFieldFilterNumberOperators }
>

export type CustomFieldFilters = {
  // Records here look like:
  // { [type]: { [`${type}/${name}`]: { [customFieldId]: filter } } }
  text: Record<string, Record<string, SupportedStringFilterSchema>>
  multiSelect: Record<string, Record<string, IdFilterSchema>>
  select: Record<string, Record<string, IdFilterSchema>>
  number: Record<string, Record<string, SupportedNumberFilterSchema>>
  date: Record<string, Record<string, DateFilterSchema>>
  url: Record<string, Record<string, SupportedStringFilterSchema>>
  person: Record<string, Record<string, IdFilterSchema>>
  multiPerson: Record<string, Record<string, IdFilterSchema>>
}

export type RemoveCustomFieldFilters<T> = Omit<T, keyof CustomFieldFilters>

export type TaskFilterKey = keyof RemoveCustomFieldFilters<TaskFilter>

export type ProjectFilter = {
  ids: IdFilterSchema | null
  stageDefinitionIds: IdFilterSchema | null
  projectDefinitionIds: IdFilterSchema | null
  statusIds: IdFilterSchema | null
  managerIds: IdFilterSchema | null
  priorities: PriorityFilterSchema | null
  deadlineStatuses: DeadlineStatusFilterSchema | null
  color: ColorFilterSchema | null
  labelIds: IdFilterSchema | null
  createdByUserIds: IdFilterSchema | null

  dueDate: DateFilterSchema | null
  createdTime: DateFilterSchema | null
  updatedTime: DateFilterSchema | null
  startDate: DateFilterSchema | null

  completed: Inclusion | null
  folderIds: IdFilterSchema | null

  taskCount: LogicalNumberFilterSchema | null
  canceledDuration: LogicalNumberFilterSchema | null
  canceledTaskCount: LogicalNumberFilterSchema | null
  completedDuration: LogicalNumberFilterSchema | null

  completedTime: DateFilterSchema | null
  estimatedCompletionTime: DateFilterSchema | null
  name: StringFilterSchema | null
  hasAttachments: Inclusion | null
} & CustomFieldFilters

export type ProjectFilterKey = keyof RemoveCustomFieldFilters<ProjectFilter>

export interface WorkspaceFilter {
  ids: IdFilterSchema | null
}
export type WorkspaceFilterKey = keyof WorkspaceFilter

export type EntityFilter = ProjectFilter | TaskFilter | WorkspaceFilter

/**
 * @deprecated
 */
export type TaskFilterValue<K extends keyof EntityFilter> = NonNullable<
  TaskFilter[K]
>

export type OrderedFilters<T extends EntityFilter> = {
  ordered: string[]
  filters: T
}
export type AllFilters = {
  tasks: OrderedFilters<TaskFilter>
  projects: OrderedFilters<ProjectFilter>
  workspaces: OrderedFilters<WorkspaceFilter>
}

export type EntityType = keyof AllFilters

export type FilterTarget = Exclude<EntityType, 'workspaces'>
export type EntityFilterState = AllFilters & {
  $version: 9
  target: FilterTarget
}

export type FilterKeys<T extends FilterTarget> = keyof AllFilters[T]['filters']
