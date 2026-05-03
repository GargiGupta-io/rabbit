import { PMItemType, type PMTaskType } from '@motion/rpc-types/legacy'

import { getAssigneeChangedFields } from '../assignee'

describe('getAssigneeChangedFields', () => {
  const defaultTask = {
    itemType: PMItemType.task,
    assigneeUserId: 'assignee-1',
    isAutoScheduled: false,
  } as PMTaskType

  it('returns an empty object when the assignee is set and autoschedule false', () => {
    const task = {
      ...defaultTask,
      isAutoScheduled: false,
    }

    expect(getAssigneeChangedFields(task)).toEqual({})
  })

  it('returns an empty object when the assignee is set and autoschedule true', () => {
    const task = {
      ...defaultTask,
      isAutoScheduled: true,
    }

    expect(getAssigneeChangedFields(task)).toEqual({})
  })

  it('returns autoschedule false when the assignee is null', () => {
    const task = {
      ...defaultTask,
      assigneeUserId: null,
      isAutoScheduled: true,
    }

    expect(getAssigneeChangedFields(task)).toEqual({
      isAutoScheduled: false,
    })
  })
})
