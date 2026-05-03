import { type StatusSchema } from '@motion/rpc-types'
import { AutoScheduleSetting } from '@motion/shared/common'

import { type UpdatableTaskSchema } from '../../types'
import { getTaskStatusChangedFields } from '../status'

describe('getTaskStatusChangedFields', () => {
  const defaultTask = {
    type: 'NORMAL',
    statusId: 'status-1',
    isAutoScheduled: true,
  } as UpdatableTaskSchema

  const statuses = [
    {
      id: 'status-1',
      name: '1',
      autoScheduleSetting: AutoScheduleSetting.ENABLED,
    },
    {
      id: 'status-2',
      name: '2',
      autoScheduleSetting: AutoScheduleSetting.DISABLED,
    },
  ] as StatusSchema[]

  it('returns an empty object when auto-scheduled with a status allowing auto-scheduled', () => {
    const task = {
      ...defaultTask,
      statusId: 'status-1',
      isAutoScheduled: true,
    }

    expect(getTaskStatusChangedFields(task, { statuses })).toEqual({})
  })

  it('returns an empty object when not auto-scheduled with a status not allowing auto-scheduled', () => {
    const task = {
      ...defaultTask,
      statusId: 'status-2',
      isAutoScheduled: false,
    }

    expect(getTaskStatusChangedFields(task, { statuses })).toEqual({})
  })

  it('returns an empty object when not auto-scheduled with a status allowing auto-scheduled', () => {
    const task = {
      ...defaultTask,
      statusId: 'status-1',
      isAutoScheduled: false,
    }

    expect(getTaskStatusChangedFields(task, { statuses })).toEqual({})
  })

  it('returns an object resetting auto-schedule if the status does not allow it', () => {
    const task = {
      ...defaultTask,
      statusId: 'status-2',
      isAutoScheduled: true,
    }

    expect(getTaskStatusChangedFields(task, { statuses })).toEqual({
      isAutoScheduled: false,
    })
  })
})
