/* c8 ignore start */
import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
  type TaskType,
  type UploadedFileSchema,
} from '@motion/rpc-types'

import { type CustomFieldFieldArrayValue } from '../../custom-fields'

type NormalTaskFields = Pick<
  NormalTaskSchema,
  | 'assigneeUserId'
  | 'blockedByTaskIds'
  | 'blockingTaskIds'
  | 'completedDuration'
  | 'deadlineType'
  | 'description'
  | 'dueDate'
  | 'duration'
  | 'ignoreWarnOnPastDue'
  | 'isAutoScheduled'
  | 'labelIds'
  | 'minimumDuration'
  | 'name'
  | 'priorityLevel'
  | 'projectId'
  | 'scheduleId'
  | 'startDate'
  | 'statusId'
  | 'workspaceId'
  | 'stageDefinitionId'
  | 'isUnvisitedStage'
  | 'scheduleMeetingWithinDays'
  | 'meetingTaskId'
>

type FixedTimeTaskFields = Pick<
  NormalTaskSchema,
  'isAutoScheduled' | 'isFixedTimeTask' | 'scheduledStart' | 'scheduledEnd'
>

// These only contain the required subset to add on top of the fields from a normal type
type RecurringTaskFields = Pick<
  RecurringTaskSchema,
  | 'days'
  | 'frequency'
  | 'idealTime'
  | 'recurrenceMeta'
  | 'timeEnd'
  | 'timeStart'
>

type TaskFields = NormalTaskFields & RecurringTaskFields & FixedTimeTaskFields

export type TaskFormFields = TaskFields & {
  id: NormalTaskSchema['id'] | undefined
  type: Extract<TaskType, 'NORMAL' | 'RECURRING_TASK' | 'RECURRING_INSTANCE'>
  customFieldValuesFieldArray: CustomFieldFieldArrayValue[]
  uploadedFiles: Pick<UploadedFileSchema, 'id'>[]

  // These fields are in the form as an easy way to access or read some info
  // TODO tleunen - find out if we can get rid of these within the form fields

  /**
   * @deprecated - This field is tied to `getInitialFormData`.
   */
  completedTime: NormalTaskSchema['completedTime']

  // TODO  Can this be removed?
  /**
   * @deprecated - To be removed once we start storing these fields in a context instead
   */
  scheduleMeetingWithinDays:
    | NormalTaskSchema['scheduleMeetingWithinDays']
    | undefined
}
