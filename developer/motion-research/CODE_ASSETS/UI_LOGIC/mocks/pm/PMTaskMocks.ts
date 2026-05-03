import {
  type NormalOrRecurringTask,
  PMItemType,
  type PMTaskType,
  TaskType,
} from '@motion/rpc-types/legacy'

import { DateTime } from 'luxon'

import { PMGeneralProjectMock } from './PMProjectMocks'
import { PMUncompletedTaskAssigneeMock1 } from './PMTaskAssigneeMocks'
import {
  PMUncompletedTaskCalendarLabelMock,
  PMUncompletedTaskTaskLabelMock,
} from './PMTaskLabelMocks'
import {
  PMAutoScheduledTaskStatusMock,
  PMBlockedTaskStatusMock,
  PMCompletedTaskStatusMock,
  PMInProgressTaskStatusMock,
} from './PMTaskStatusMocks'
import { RecurringTaskMock1 } from './RecurringTaskMocks'

export const BasePMTaskMock: PMTaskType = {
  id: '1',
  name: 'Task',
  description: '',
  completedDuration: 0,
  duration: 0,
  dueDate: null,
  priorityLevel: 'MEDIUM',
  statusId: '1',
  labels: [],
  labelIds: [],
  sortPosition: '',
  completedTime: '',
  projectId: null,
  assigneeUserId: '1',
  blockingTasks: [],
  blockedTasks: [],
  createdTime: '',
  updatedTime: '',
  archivedTime: '',
  createdByUserId: '1',
  workspaceId: '1',
  minimumDuration: null,
  scheduledStart: '',
  scheduledEnd: '',
  isUnfit: false,
  type: TaskType.NORMAL,
  isAutoScheduled: true,
}

export const PMUncompletedTaskMock = {
  assignee: PMUncompletedTaskAssigneeMock1,
  completedTime: undefined,
  createdTime: new Date().toISOString(),
  days: ['MO', 'TU', 'WE', 'TH', 'FR'],
  description:
    'This is a super super super super long text description for this task so we can notice how expanding and closing works!!! Its cool',
  dueDate: new Date().toISOString(),
  duration: 30,
  frequency: 'daily',
  id: '5e9f8f8f-f8f8-4f8f-8f8f-uncompleted-task',
  idealTime: '11:00 am',
  minimumDuration: null,
  isFixedTimeTask: false,
  isAutoScheduled: true,
  itemType: PMItemType.task,
  labels: [
    PMUncompletedTaskCalendarLabelMock,
    PMUncompletedTaskTaskLabelMock,
    PMUncompletedTaskCalendarLabelMock,
    PMUncompletedTaskTaskLabelMock,
  ],
  name: 'Uncompleted PM Task',
  priorityLevel: 'LOW',
  project: PMGeneralProjectMock,
  projectId: PMGeneralProjectMock.id,
  recurrenceMeta: '',
  schedule: 'custom',
  sortPosition: '1',
  status: PMBlockedTaskStatusMock,
  statusId: PMBlockedTaskStatusMock.id,
  timeEnd: '5:00 pm',
  timeStart: '8:00 am',
  type: TaskType.NORMAL,
  createdByUserId: 'user1',
  workspaceId: 'workspace1',
  assigneeUserId: 'user1',
  ignoreWarnOnPastDue: false,
} satisfies NormalOrRecurringTask

export const PMNoDueDateTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  dueDate: null,
}

export const PMCompletedTaskMock: Partial<PMTaskType> = {
  assignee: undefined,
  completedTime: new Date().toISOString(),
  description: 'Completed PM Task',
  dueDate: new Date().toISOString(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8fdsaz',
  isFixedTimeTask: false,
  labels: [],
  name: 'Completed PM Task',
  project: PMGeneralProjectMock,
  projectId: PMGeneralProjectMock.id,
  sortPosition: '1',
  status: PMCompletedTaskStatusMock,
  statusId: PMCompletedTaskStatusMock.id,
  type: TaskType.NORMAL,
}

export const PMScheduledTaskMock = {
  ...PMUncompletedTaskMock,
  dueDate: DateTime.now().plus({ days: 1 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8asmdz',
  name: 'Low Priority Due Today Task',
  scheduledStart: DateTime.now().toISO(),
  priorityLevel: 'MEDIUM',
} satisfies PMTaskType

export const PMStaleScheduledTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  dueDate: DateTime.now().minus({ days: 14 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8asmdz',
  name: 'Low Priority Due Today Task',
  scheduledStart: DateTime.now().minus({ days: 15 }).toISO(),
}

export const PMASAPScheduledTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  dueDate: DateTime.now().plus({ days: 1 }).toISO(),
  duration: 60,
  id: '5e9f8f8f-f8f8-4f8f-8f8f-67f8f8f8fdsaz',
  name: 'ASAP Priority Due Today Task',
  priorityLevel: 'ASAP',
  scheduledStart: DateTime.now().toISO(),
  // duration: 40,
  status: PMAutoScheduledTaskStatusMock,
  statusId: PMAutoScheduledTaskStatusMock.id,
}

export const PMASAPChunkedTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  chunks: [
    {
      id: '5e9f8f8f-f8f8-4f8f-8f8f-67f8f8f8fdsma2',
      name: 'ASAP Priority Chunk',
      scheduledStart: DateTime.now().toISO(),
      type: TaskType.CHUNK,
    } as PMTaskType,
  ],
  id: '5e9f8f8f-f8f8-4f8f-8f8f-67f8f8f8fdsma',
  minimumDuration: 30,
  name: 'ASAP Priority Chunked',
  priorityLevel: 'ASAP',
  scheduledStart: undefined,
}

export const PMHighScheduledTomorrowTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  dueDate: DateTime.now().plus({ days: 2 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8fshadhz',
  name: 'High Priority Due Tomorrow Task',
  priorityLevel: 'HIGH',
  scheduledStart: DateTime.now().plus({ days: 1 }).toISO(),
  scheduledStatus: 'ON_TRACK',
  estimatedCompletionTime: DateTime.now()
    .plus({ days: 1, minutes: 30 })
    .toISO(),
}

export const PMHighScheduledNextWeekTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  dueDate: DateTime.now().plus({ weeks: 2 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-dsasda',
  name: 'High Priority Due Next Week Task',
  priorityLevel: 'HIGH',
  scheduledStart: DateTime.now().plus({ weeks: 1 }).toISO(),
}

export const PMRecurringInstance = {
  id: 'recurringTaskInstance',
  isAutoScheduled: true,
  isFixedTimeTask: false,
  itemType: PMItemType.task,
  name: 'Recurring',
  parentRecurringTaskId: RecurringTaskMock1.id,
  type: TaskType.RECURRING_INSTANCE,
  workspaceId: 'workspace1',
  dueDate: new Date().toISOString(),
  priorityLevel: 'MEDIUM',
  statusId: PMInProgressTaskStatusMock.id,
  createdTime: new Date().toISOString(),
  createdByUserId: 'user1',
  minimumDuration: null,
} satisfies PMTaskType

export const PMScheduledAfterDueTaskMock: Partial<PMTaskType> = {
  ...PMHighScheduledNextWeekTaskMock,
  dueDate: DateTime.now().minus({ days: 1 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-scheduled-after-due',
  itemType: PMItemType.task,
  name: 'Scheduled after due date task',
  scheduledStart: DateTime.now().plus({ weeks: 1 }).toISO(),
  scheduledStatus: 'PAST_DUE',
  estimatedCompletionTime: DateTime.now()
    .plus({ weeks: 1, minutes: 30 })
    .toISO(),
}

export const FixedTimeTaskMock: Partial<PMTaskType> = {
  assignee: undefined,
  completedTime: undefined,
  description: 'Task that is fixed to a particular date and time',
  dueDate: new Date().toISOString(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8fdsaz',
  isFixedTimeTask: true,
  itemType: PMItemType.task,
  labels: [],
  name: 'Fixed Time Task',
  scheduledEnd: DateTime.now().plus({ hour: 1 }).toISO(),
  scheduledStart: DateTime.now().toISO(),
  sortPosition: '1',
}

export const NoDeadlineTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  deadlineType: 'SOFT',
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8nodeadline',
  name: 'No Deadline Task',
  scheduledStart: DateTime.now().toISO(),
}

export const UnfitTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  dueDate: undefined,
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8unfit',
  isUnfit: true,
  name: 'Unfit Task',
  scheduledEnd: undefined,
  scheduledStart: undefined,
}

export const UnfitPastDueTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  duration: 30,
  dueDate: DateTime.now().plus({ days: 1 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8unfit',
  isUnfit: true,
  name: 'Unfit Past Due Task',
  scheduledStatus: 'UNFIT_PAST_DUE',
  estimatedCompletionTime: null,
}

export const UnfitSchedulableTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  duration: 30,
  startDate: DateTime.now().minus({ days: 1 }).toISO(),
  dueDate: DateTime.now().plus({ days: 32 }).toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8unfit',
  isUnfit: true,
  name: 'Unfit Schedulable Task',
  scheduledStatus: 'UNFIT_SCHEDULABLE',
  estimatedCompletionTime: null,
}

export const ReminderPresentTaskMock: Partial<PMTaskType> = {
  ...PMUncompletedTaskMock,
  duration: 0,
  name: 'Reminder Task',
  dueDate: DateTime.now().toISO(),
  id: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8reminder',
  scheduledStatus: 'ON_TRACK',
}

export const ReminderFutureTaskMock: Partial<PMTaskType> = {
  ...ReminderPresentTaskMock,
  dueDate: DateTime.now().plus({ days: 1 }).toISO(),
  scheduledStatus: 'ON_TRACK',
}

export const ReminderPastDueTaskMock: Partial<PMTaskType> = {
  ...ReminderPresentTaskMock,
  dueDate: DateTime.now().minus({ days: 1 }).toISO(),
  scheduledStatus: 'PAST_DUE',
}
