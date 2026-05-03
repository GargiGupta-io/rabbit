import {
  type NormalTaskSchema,
  type RecurringTaskSchema,
} from '@motion/rpc-types'

import tk from 'timekeeper'
import { type Mock } from 'vitest'

import {
  isUserNotOnboarded,
  type WorkspaceMemberWithUser,
} from '../../../../members'
import { getTaskTypeChangedFields } from '../task-type'

vi.mock('../../../../members', () => ({
  isUserNotOnboarded: vi.fn(),
}))

describe('getTaskTypeChangedFields', () => {
  beforeEach(() => {
    const frozenTime = new Date('2023-12-02T16:14:30.335Z')
    tk.freeze(frozenTime)
  })

  afterEach(() => {
    tk.reset()
    vi.resetAllMocks()
  })

  const defaultTask = {
    type: 'NORMAL',
    isAutoScheduled: true,
    startDate: '2024-02-01',
    assigneeUserId: 'user-id',
    priorityLevel: 'HIGH',
    duration: 30,
  } as NormalTaskSchema

  const defaultRecurringTask = {
    type: 'RECURRING_TASK',
    isAutoScheduled: true,
    startingOn: '2024-02-01',
    assigneeUserId: 'user-id',
    priorityLevel: 'HIGH',
    duration: 30,
  } as RecurringTaskSchema
  const currentUserId = 'currentUserId'

  const defaultMembers = [
    { userId: 'user-id', user: { id: 'user-id', name: 'User' } },
    {
      userId: 'currentUserId',
      user: { id: 'currentUserId', name: 'Current User' },
    },
  ] as WorkspaceMemberWithUser[]

  it('returns an object container only the project id reset', () => {
    const task = defaultRecurringTask

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      projectId: null,
    })
  })

  it('returns an object containing startingOn date when not set', () => {
    const task = {
      ...defaultRecurringTask,
      startingOn: '',
    } as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      startingOn: '2023-12-02',
      projectId: null,
    })
  })

  it('returns an object containing an assignee when not set', () => {
    const task = {
      ...defaultRecurringTask,
      assigneeUserId: null,
    } as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      assigneeUserId: currentUserId,
      projectId: null,
    })
  })

  it('returns an object setting a default duration when not set', () => {
    const task = {
      ...defaultRecurringTask,
      duration: null,
    } as unknown as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      duration: 30,
      projectId: null,
    })
  })

  it('returns an object setting a medium priority when set to an invalid one', () => {
    const task = {
      ...defaultRecurringTask,
      priorityLevel: 'ASAP',
    } as unknown as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      priorityLevel: 'MEDIUM',
      projectId: null,
    })
  })

  it('returns an object setting ignoreWarnOnPastDue to true when frequency is weekly', () => {
    const task = {
      ...defaultRecurringTask,
      frequency: 'WEEKLY',
    } as unknown as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      ignoreWarnOnPastDue: true,
      projectId: null,
    })
  })

  it('returns an object setting ignoreWarnOnPastDue to false when frequency is daily', () => {
    const task = {
      ...defaultRecurringTask,
      frequency: 'DAILY',
    } as unknown as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      ignoreWarnOnPastDue: true,
      projectId: null,
    })
  })

  it('returns an object without ignoreWarnOnPastDue when frequency is monthly', () => {
    const task = {
      ...defaultRecurringTask,
      frequency: 'MONTHLY',
    } as unknown as RecurringTaskSchema

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      projectId: null,
    })
  })

  it('returns an object with a schedule "work" if it was previously "custom" for non recurring tasks', () => {
    const task = {
      ...defaultTask,
      scheduleId: 'custom',
    }

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      scheduleId: 'work',
    })
  })

  it('returns an object containing current user as assignee when assigned user is not onboarded', () => {
    const task = {
      ...defaultRecurringTask,
      assigneeUserId: 'user-id',
    } as RecurringTaskSchema

    // Mock isUserNotOnboarded to return true for this test
    ;(isUserNotOnboarded as Mock).mockReturnValue(true)

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      assigneeUserId: currentUserId,
      projectId: null,
    })
  })

  it('does not change assignee when assigned user is onboarded', () => {
    const task = {
      ...defaultRecurringTask,
      assigneeUserId: 'user-id',
    } as RecurringTaskSchema

    // Mock isUserNotOnboarded to return false for this test
    ;(isUserNotOnboarded as Mock).mockReturnValue(false)

    expect(
      getTaskTypeChangedFields(task, { currentUserId, members: defaultMembers })
    ).toEqual({
      projectId: null,
    })
  })
})
