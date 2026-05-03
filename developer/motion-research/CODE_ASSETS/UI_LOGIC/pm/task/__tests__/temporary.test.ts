import tk from 'timekeeper'

import { getTaskInitialStartDate } from '../form'
import { createTemporaryTask } from '../temporary'

describe('createTemporaryTask', () => {
  beforeEach(() => {
    const frozenTime = new Date('2024-06-10T18:41:48.844113-04:00')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
  })

  it('should create a temporary task', () => {
    const task = createTemporaryTask({
      isAutoScheduled: true,
      assigneeUserId: 'user1',
      createdByUserId: 'user2',
      workspaceId: 'workspace1',
      projectId: 'project1',
      statusId: 'status1',
      priorityLevel: 'MEDIUM',
      labelIds: ['label1'],
      customFieldValues: {
        123: { value: 'customField1Value', type: 'text' },
      },
      name: 'name',
    })

    expect(task).toMatchObject({
      id: 'workspace1|<none>',
      type: 'NORMAL',
      assigneeUserId: 'user1',
      workspaceId: 'workspace1',
      projectId: 'project1',
      statusId: 'status1',
      name: 'name',
      description: '',
      startDate: getTaskInitialStartDate(),
      dueDate: '2024-06-11T23:59:59.999+00:00',
      deadlineType: 'SOFT',
      minimumDuration: null,
      isAutoScheduled: true,
      priorityLevel: 'MEDIUM',
      scheduleId: 'work',
      scheduledStart: null,
      scheduledEnd: null,
      labelIds: ['label1'],
      createdByUserId: 'user2',
      completedDuration: 0,
      completedTime: null,
      updatedTime: null,
      archivedTime: null,
      rank: null,
      isBusy: false,
      isFixedTimeTask: false,
      isUnfit: false,
      needsReschedule: false,
      scheduleOverridden: false,
      snoozeUntil: null,
      manuallyStarted: false,
      isFutureSchedulable: false,
      ignoreWarnOnPastDue: false,
      chunkIds: [],
      blockingTaskIds: [],
      blockedByTaskIds: [],
      customFieldValues: {
        123: { value: 'customField1Value', type: 'text' },
      },
      scheduledStatus: null,
      estimatedCompletionTime: null,
    })
  })

  it('should create a temporary recurring task', () => {
    const task = createTemporaryTask({
      isAutoScheduled: true,
      assigneeUserId: 'user1',
      createdByUserId: 'user2',
      workspaceId: 'workspace1',
      statusId: 'status1',
      labelIds: ['label1'],
      name: 'name',
      type: 'RECURRING_TASK',
      projectId: null,
    })

    expect(task).toMatchObject({
      id: 'workspace1|<none>',
      type: 'RECURRING_TASK',
      assigneeUserId: 'user1',
      workspaceId: 'workspace1',
      statusId: 'status1',
      name: 'name',
      description: '',
      deadlineType: 'SOFT',
      minimumDuration: null,
      isAutoScheduled: true,
      priorityLevel: 'MEDIUM',
      scheduleId: 'work',
      labelIds: ['label1'],
      createdByUserId: 'user2',
      ignoreWarnOnPastDue: false,
      days: [],
      excludedDates: null,
      frequency: 'WEEKLY',
      idealTime: null,
      recurrenceMeta: null,
      needsUpdate: false,
      startingOn: '',
      timeEnd: '',
      timeStart: '',
    })
  })
})
