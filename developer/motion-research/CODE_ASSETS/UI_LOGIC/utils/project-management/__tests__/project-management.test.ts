import {
  IndividualOrTeam,
  PMItemType,
  type PMNormalizedWorkspace,
  type PMProjectType,
  type PMProjectTypeWithItemType,
  type PMTaskType,
  type SomedayChoice,
  SomedayChoiceText,
  SortByDirection,
} from '@motion/rpc-types/legacy'
import { AutoScheduleSetting, StatusType } from '@motion/shared/common'

import { DateTime } from 'luxon'

import {
  dateToSomeday,
  getCompareDateFn,
  isChunkDisplayable,
  isTaskDisplayable,
  somedayChoices,
  somedayChoicesMap,
  somedayToNewStartAndDueDate,
  sortByDeadlineType,
} from '../project-management'

const displayableTask = {
  itemType: PMItemType.task,
  status: {
    name: 'Auto-Scheduled',
  },
  assigneeUserId: '123',
  scheduledStart: '2021-01-01',
  scheduledEnd: '2021-01-01',
  isUnfit: false,
  isAutoScheduled: true,
} as PMTaskType

const taskA = {
  itemType: PMItemType.task,
  status: {
    name: 'Auto-Scheduled',
    sortPosition: '99',
  },
  statusId: '123',
  dueDate: '2021-01-01',
  assigneeUserId: '123',
  assignee: {
    id: '123',
    name: 'Abe',
  },
  name: 'TaskA',
  scheduledStart: '2021-01-01',
  scheduledEnd: '2021-01-01',
  createdTime: '2021-01-01',
  isUnfit: false,
} as PMTaskType

const taskB = {
  itemType: PMItemType.task,
  status: {
    name: 'Auto-Scheduled',
    sortPosition: '991',
  },
  statusId: '1234',
  assigneeUserId: '123',
  assignee: {
    id: '123',
    name: 'Bob',
  },
  dueDate: '2021-01-02',
  name: 'TaskB',
  scheduledStart: '2021-01-01',
  scheduledEnd: '2021-01-02',
  createdTime: '2021-01-02',
  isUnfit: false,
} as PMTaskType

const taskC = {
  itemType: PMItemType.task,
  statusId: '1234',
  status: {
    name: 'Auto-Scheduled',
    sortPosition: '992',
  },
  assigneeUserId: '123',
  assignee: {
    id: '123',
    name: 'Charlie',
  },
  name: 'TaskC',
  scheduledStart: '2021-01-01',
  scheduledEnd: '2021-01-11',
  createdTime: '2021-01-11',
  isUnfit: false,
} as PMTaskType

const projectA = {
  id: 'project-a',
  itemType: PMItemType.project,
  dueDate: '2021-01-11',
  statusId: '1234',
  status: {} as any,
  manager: {
    name: 'Abe',
  } as any,
  name: 'ProjectA',
  priorityLevel: 'HIGH',
  scheduledEnd: '2021-01-11',
  createdTime: new Date('2021-01-11').toISOString(),
  isUnfit: false,
} as PMProjectType

const projectB = {
  id: 'project-b',
  itemType: PMItemType.project,
  dueDate: '2021-01-11',
  statusId: '1234',
  status: {} as any,
  manager: {
    name: 'Bob',
  } as any,
  name: 'projectB',
  priorityLevel: 'HIGH',
  scheduledStart: '2021-01-01',
  scheduledEnd: '2021-01-11',
  createdTime: new Date('2021-01-11').toISOString(),
  isUnfit: false,
} as PMProjectType

const backlogStatus = {
  color: '#47C96B',
  id: 'backlogStatus',
  name: 'Backlog',
  isSystemStatus: false,
  sortPosition: '00005',
  workspaceId: 'abc',
  isResolvedStatus: false,
  isDefaultStatus: true,
  autoScheduleEnabled: false,
  type: StatusType.DEFAULT,
  autoScheduleSetting: AutoScheduleSetting.DISABLED,
  createdTime: new Date().toISOString(),
  updatedTime: null,
  deletedTime: null,
}

const personalBacklogStatus = {
  color: '#47C96B',
  id: 'personalBacklogStatus',
  name: 'Backlog',
  isSystemStatus: false,
  sortPosition: '00005',
  autoScheduleEnabled: false,
  workspaceId: 'personalabc',
  isResolvedStatus: false,
  isDefaultStatus: true,
  type: StatusType.DEFAULT,
  autoScheduleSetting: AutoScheduleSetting.DISABLED,
  createdTime: new Date().toISOString(),
  updatedTime: null,
  deletedTime: null,
}

const completedStatus = {
  ...backlogStatus,
  id: 'completedStatus',
  name: 'Completed',
  isResolvedStatus: true,
}

const personalCompletedStatus = {
  ...personalBacklogStatus,
  id: 'personalCompletedStatus',
  name: 'Completed',
}

export const PMWorkspaceMock1: PMNormalizedWorkspace = {
  createdTime: '',
  id: 'abc',
  labels: [],
  members: [],
  name: 'PM Workspace 1',

  projects: [
    projectA as PMProjectTypeWithItemType,
    projectB as PMProjectTypeWithItemType,
  ],

  recurringTasks: [],

  taskStatuses: [backlogStatus, completedStatus],
  // Taken from team mocks
  teamId: '5e9f8f8f-f8f8-4f8f-8f8f-8f8f8f8f8f8f',
  type: IndividualOrTeam.TEAM,
  updatedTime: '',
}

export const PMPersonalWorkspaceMock: PMNormalizedWorkspace = {
  ...PMWorkspaceMock1,
  taskStatuses: [personalBacklogStatus, personalCompletedStatus],
  id: 'personalabc',
  isPersonalWorkspace: true,
  name: 'Personal Tasks',
  teamId: '',
  type: IndividualOrTeam.INDIVIDUAL,
}

const sortableProjects = [projectA, projectB]
const sortableTasks = [taskA, taskB, taskC]

describe('isTaskDisplayable()', () => {
  it('should return true if task is displayable', () => {
    const userId = '123'
    const result = isTaskDisplayable(displayableTask, userId)

    expect(result).toBe(true)
  })

  it('should return false if task is not assigned to the user', () => {
    const notAssignedToUser = {
      ...displayableTask,
      assigneeUserId: 'not_123',
      assignee: {
        id: 'not_123',
      },
    } as PMTaskType

    const userId = '123'
    const result = isTaskDisplayable(notAssignedToUser, userId)

    expect(result).toBe(false)
  })

  it('should return false if task is not auto-scheduled', () => {
    const notAutoscheduledTask = {
      ...displayableTask,
      isAutoScheduled: false,
      status: {
        name: 'Completed',
      },
    } as PMTaskType

    const userId = '123'
    const result = isTaskDisplayable(notAutoscheduledTask, userId)

    expect(result).toBe(false)
  })

  it('should return false if task is unfit', () => {
    const unfitTask = {
      ...displayableTask,
      isUnfit: true,
    } as PMTaskType

    const userId = '123'
    const result = isTaskDisplayable(unfitTask, userId)

    expect(result).toBe(false)
  })

  it('should return false if task is not PMItemType.task', () => {
    const notTaskType = {
      ...displayableTask,
      itemType: PMItemType.project,
    } as PMTaskType

    const userId = '123'
    const result = isTaskDisplayable(notTaskType, userId)

    expect(result).toBe(false)
  })
})

describe('isChunkDisplayable()', () => {
  const displayableChunk = {
    scheduledStart: '2021-01-01',
    scheduledEnd: '2021-01-01',
    isUnfit: false,
    assigneeUserId: undefined,
    isAutoScheduled: true,
  } as PMTaskType

  test('should return true if chunk is displayable', () => {
    const parentTask = {
      ...displayableTask,
      chunks: [displayableChunk],
    } as PMTaskType

    const userId = '123'
    const result = isChunkDisplayable(displayableChunk, parentTask, userId)

    expect(result).toBe(true)
  })

  test('should return false if chunk is not displayable', () => {
    const unfitChunk = {
      isUnfit: true,
    } as PMTaskType

    const unscheduledChunk = {
      scheduledStart: undefined,
      scheduledEnd: undefined,
      isUnfit: false,
    } as PMTaskType

    const parentTask = {
      ...displayableTask,
      chunks: [unfitChunk, unscheduledChunk],
    } as PMTaskType

    const userId = '123'
    const unfitChunkResult = isChunkDisplayable(unfitChunk, parentTask, userId)

    expect(unfitChunkResult).toBe(false)

    const unscheduledChunkResult = isChunkDisplayable(
      unscheduledChunk,
      parentTask,
      userId
    )

    expect(unscheduledChunkResult).toBe(false)
  })

  it('should return false if the parent task is not assigned to the user', () => {
    const notAssignedParentTask = {
      ...displayableTask,
      assigneeUserId: 'not_123',
      assignee: { id: 'not_123' },
      chunks: [displayableChunk],
    } as PMTaskType

    const userId = '123'
    const unfitChunkResult = isChunkDisplayable(
      displayableChunk,
      notAssignedParentTask,
      userId
    )

    expect(unfitChunkResult).toBe(false)
  })

  it('should return false if the chunk is not auto-scheduled', () => {
    const notAutoscheduledChunk = {
      ...displayableChunk,
      status: {
        name: 'Completed',
      },
      isAutoScheduled: false,
    } as PMTaskType

    const notAutoscheduledParentTask = {
      ...displayableTask,
      chunks: [notAutoscheduledChunk],
      isAutoScheduled: false,
    } as PMTaskType

    const userId = '123'
    const result = isChunkDisplayable(
      notAutoscheduledChunk,
      notAutoscheduledParentTask,
      userId
    )

    expect(result).toBe(false)
  })

  it('should return false if the parent task is not PMItemType.task', () => {
    const notTaskParentTask = {
      ...displayableTask,
      itemType: PMItemType.project,
      chunks: [displayableChunk],
    } as PMTaskType

    const userId = '123'
    const result = isChunkDisplayable(
      displayableChunk,
      notTaskParentTask,
      userId
    )

    expect(result).toBe(false)
  })
})

const jan1 = DateTime.fromFormat('01/01/2022', 'MM/dd/yyyy')

describe('dateToSomeday', () => {
  it('returns the correct interval', () => {
    const intervals = [
      [
        jan1.minus({ months: 19 }),
        somedayChoicesMap[SomedayChoiceText.ONE_WEEK],
      ],
      [jan1.plus({ days: 3 }), somedayChoicesMap[SomedayChoiceText.ONE_WEEK]],
      [
        jan1.plus({ days: 8 }),
        somedayChoicesMap[SomedayChoiceText.TWO_TO_THREE_WEEKS],
      ],
      [
        jan1.plus({ days: 16 }),
        somedayChoicesMap[SomedayChoiceText.TWO_TO_THREE_WEEKS],
      ],
      [
        jan1.plus({ days: 30 }),
        somedayChoicesMap[SomedayChoiceText.ONE_TO_TWO_MONTHS],
      ],
      [
        jan1.plus({ days: 80 }),
        somedayChoicesMap[SomedayChoiceText.THREE_TO_SIX_MONTHS],
      ],
      [
        jan1.plus({ months: 130 }),
        somedayChoicesMap[SomedayChoiceText.THREE_TO_SIX_MONTHS],
      ],
    ]

    intervals.forEach((interval) => {
      const [date, expectedText] = interval

      expect(dateToSomeday(date as DateTime, jan1)).toEqual(expectedText)
    })
  })
})

describe('somedayToNewStartAndDueDate', () => {
  it('returns a new start date and due date', () => {
    const twoToThreeWeeks = somedayChoices.find(
      (c) => c.text === SomedayChoiceText.TWO_TO_THREE_WEEKS
    ) as SomedayChoice

    const taskPartial = somedayToNewStartAndDueDate(twoToThreeWeeks, jan1)

    expect(taskPartial.startDate).toEqual('2022-01-08')
    expect(taskPartial.dueDate).toEqual('2022-01-22')
  })
})

describe('sortByDeadlineType', () => {
  it('should correctly sort items by deadline type in ascending order', () => {
    const itemA = { deadlineType: 'SOFT' } as const
    const itemB = { deadlineType: 'HARD' } as const

    const sortedAsc = [itemA, itemB].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.ASC)
    )

    expect(sortedAsc).toEqual([itemA, itemB])
  })

  it('should correctly sort items by deadline type in descending order', () => {
    const itemA = { deadlineType: 'HARD' } as const
    const itemB = { deadlineType: 'SOFT' } as const

    const sortedDesc = [itemB, itemA].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.DESC)
    )

    expect(sortedDesc).toEqual([itemA, itemB])
  })

  it('should treat items with HARD deadline type as greater than SOFT', () => {
    const itemA = { deadlineType: 'HARD' } as const
    const itemB = { deadlineType: 'SOFT' } as const

    const sortedAsc = [itemA, itemB].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.ASC)
    )

    expect(sortedAsc).toEqual([itemB, itemA])

    const sortedDesc = [itemA, itemB].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.DESC)
    )

    expect(sortedDesc).toEqual([itemA, itemB])
  })

  it('should treat items with HARD deadline type as greater than SOFT even when mixed with other types', () => {
    const itemA = { deadlineType: 'HARD' } as const
    const itemB = { deadlineType: 'SOFT' } as const
    const itemD = { deadlineType: 'HARD' } as const

    const sortedAsc = [itemA, itemB, itemD].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.ASC)
    )

    expect(sortedAsc).toEqual([itemB, itemA, itemD])

    const sortedDesc = [itemA, itemB, itemD].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.DESC)
    )

    expect(sortedDesc).toEqual([itemA, itemD, itemB])
  })

  it('should handle items with undefined deadline type', () => {
    const itemA = {}
    const itemB = { deadlineType: 'SOFT' } as const
    const itemC = {}

    const sortedAsc = [itemA, itemB, itemC].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.ASC)
    )

    expect(sortedAsc).toEqual([itemA, itemC, itemB])

    const sortedDesc = [itemA, itemB, itemC].sort((a, b) =>
      sortByDeadlineType(a, b, SortByDirection.DESC)
    )

    expect(sortedDesc).toEqual([itemB, itemC, itemA])
  })
})

describe('getCompareDateFn', () => {
  it('should sort by a given time field descending', () => {
    const result = sortableTasks.sort((a, b) =>
      getCompareDateFn('createdTime', SortByDirection.DESC, true)(a, b)
    )

    expect(result).toEqual([taskC, taskB, taskA])
  })

  it('should sort by a given time field ascending', () => {
    const result = sortableTasks.sort((a, b) =>
      getCompareDateFn('createdTime')(a, b, SortByDirection.ASC)
    )

    expect(result).toEqual([taskA, taskB, taskC])
  })

  it('should handle two equal dates', () => {
    const taskA = {
      dueDate: '2025-06-19T23:59:59.999-07:00',
    }

    const taskB = {
      dueDate: '2025-06-19T23:59:59.999-07:00',
    }

    expect(getCompareDateFn('dueDate')(taskA, taskB)).toEqual(0)
  })

  it('should handle undefined', () => {
    const ascResult = [undefined, undefined, '99', '991', '992']
    const result = [...sortableTasks, {}, {}]
      .sort((a, b) =>
        getCompareDateFn('createdTime')(a, b, SortByDirection.ASC)
      )
      .map((i) => (i as any).status?.sortPosition)

    expect(result).toEqual(ascResult)

    const projectResult = [{}, {}, ...sortableProjects].sort((a, b) =>
      getCompareDateFn('scheduledStart', SortByDirection.ASC, true)(a, b)
    )

    expect(projectResult).toEqual([projectB, projectA, {}, {}])
  })
})
