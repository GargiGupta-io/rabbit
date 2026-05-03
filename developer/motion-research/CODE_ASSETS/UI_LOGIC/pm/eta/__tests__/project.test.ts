import { type ProjectSchema, type StatusSchema } from '@motion/rpc-types'
import { StatusType } from '@motion/shared/common'

import { DateTime } from 'luxon'

import {
  getExtendedProjectDeadlineStatus,
  getProjectEtaTooltip,
  getProjectNoEtaReason,
  normalizeProjectDeadlineStatus,
} from '../project'

const DEFAULT_AUTO_SCHEDULE_RANGE = 92

describe('normalizeProjectDeadlineStatus - project', () => {
  it('should return at-risk if project has missed deadline', () => {
    const project = {
      deadlineStatus: 'missed-deadline',
    } as ProjectSchema

    const result = normalizeProjectDeadlineStatus(project)

    expect(result).toEqual('missed-deadline')
  })

  it('should return at-risk if project is scheduled past deadline', () => {
    const project = {
      deadlineStatus: 'scheduled-past-deadline',
    } as ProjectSchema

    const result = normalizeProjectDeadlineStatus(project)

    expect(result).toEqual('scheduled-past-deadline')
  })

  it('should return the same status if project is not at risk', () => {
    const project = {
      deadlineStatus: 'on-track',
    } as ProjectSchema

    const result = normalizeProjectDeadlineStatus(project)

    expect(result).toEqual('on-track')
  })

  it('should return none if null', () => {
    const project = {
      deadlineStatus: null,
    } as ProjectSchema

    const result = normalizeProjectDeadlineStatus(project)

    expect(result).toEqual('none')
  })

  it('should return none if none provided', () => {
    const project = {} as ProjectSchema

    const result = normalizeProjectDeadlineStatus(project)

    expect(result).toEqual('none')
  })
})

describe('getDeadlineStatusWithReason - project', () => {
  it('should return none if project is null', () => {
    const project = null

    const result = getExtendedProjectDeadlineStatus(project, [])

    expect(result).toEqual('none')
  })

  it('should return the previous deadline status if not none', () => {
    const project = {
      deadlineStatus: 'on-track',
    } as ProjectSchema

    const result = getExtendedProjectDeadlineStatus(project, [])

    expect(result).toEqual('on-track')
  })

  it('should return none if no statuses provided', () => {
    const project = {
      deadlineStatus: 'none',
    } as ProjectSchema

    const result = getExtendedProjectDeadlineStatus(project, [])

    expect(result).toEqual('none')
  })

  it('should return completed if project status is completed', () => {
    const CompletedStatus = {
      id: 'completed',
      type: StatusType.COMPLETED,
    } as StatusSchema

    const project = {
      deadlineStatus: CompletedStatus.id,
    } as ProjectSchema

    const result = getExtendedProjectDeadlineStatus(project, [CompletedStatus])

    expect(result).toEqual('completed')
  })

  it('should return canceled if project status is canceled', () => {
    const CanceledStatus = {
      id: 'canceled',
      type: StatusType.CANCELED,
    } as StatusSchema

    const project = {
      statusId: CanceledStatus.id,
    } as ProjectSchema

    const result = getExtendedProjectDeadlineStatus(project, [CanceledStatus])

    expect(result).toEqual('canceled')
  })
})

describe('getNoEtaReason - project', () => {
  it('returns nothing if eta is not none', () => {
    const project = {
      deadlineStatus: 'on-track',
      statusId: '',
    } as ProjectSchema

    const result = getProjectNoEtaReason(project, [])

    expect(result).toBeNull()
  })

  it('returns completed text if project is completed', () => {
    const CompletedStatus = {
      id: 'completed',
      type: StatusType.COMPLETED,
    } as StatusSchema

    const project = {
      deadlineStatus: 'none',
      statusId: CompletedStatus.id,
    } as ProjectSchema

    const result = getProjectNoEtaReason(project, [CompletedStatus])

    expect(result).toEqual('Project complete')
  })

  it('returns canceled text if project is canceled', () => {
    const CanceledStatus = {
      id: 'canceled',
      type: StatusType.CANCELED,
    } as StatusSchema

    const project = {
      deadlineStatus: 'none',
      statusId: CanceledStatus.id,
    } as ProjectSchema

    const result = getProjectNoEtaReason(project, [CanceledStatus])

    expect(result).toEqual('Project canceled')
  })

  it('returns no auto scheduled tasks ', () => {
    const project = {
      deadlineStatus: 'none',
      statusId: 'not-found',
      scheduledStatus: null,
    } as ProjectSchema

    const result = getProjectNoEtaReason(project, [])

    expect(result).toEqual(
      'No ETA because there are no auto-scheduled tasks in this project'
    )
  })

  it('returns generic no eta text if status not found and scheduledStatus is something like UNFIT', () => {
    const project = {
      deadlineStatus: 'none',
      statusId: 'not-found',
      scheduledStatus: 'UNFIT_PAST_DUE',
    } as ProjectSchema

    const result = getProjectNoEtaReason(project, [])

    expect(result).toEqual('No ETA')
  })
})

const mockPluralize = (num: number, singular: string, plural: string) =>
  `${num} ${num === 1 ? singular : plural}`

describe('getProjectEtaTooltip', () => {
  const mockProject = {
    id: '1',
    type: 'NORMAL',
    estimatedCompletionTime: DateTime.fromISO('2024-01-01T12:00:00.000Z'),
    dueDate: DateTime.fromISO('2024-01-02T12:00:00.000Z'),
  }

  it('should return no ETA reason when deadlineStatus is none and not auto scheduled', () => {
    const project = {
      ...mockProject,
      deadlineStatus: 'none',
    } as unknown as ProjectSchema

    const result = getProjectEtaTooltip(
      project,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result).toEqual({
      title: 'No ETA because there are no auto-scheduled tasks in this project',
      action: undefined,
      etaText: undefined,
    })
  })

  it('should return missed deadline tooltip when deadlineStatus is missed-deadline', () => {
    const project = {
      ...mockProject,
      deadlineStatus: 'missed-deadline',
    } as unknown as ProjectSchema
    const result = getProjectEtaTooltip(
      project,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('Missed deadline')
  })

  it('should return scheduled past deadline tooltip when deadlineStatus is scheduled-past-deadline', () => {
    const project = {
      ...mockProject,
      deadlineStatus: 'scheduled-past-deadline',
    } as unknown as ProjectSchema
    const result = getProjectEtaTooltip(
      project,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('Scheduled past deadline')
  })

  it('should return on track tooltip when deadlineStatus is on-track', () => {
    const project = {
      ...mockProject,
      deadlineStatus: 'on-track',
    } as unknown as ProjectSchema
    const result = getProjectEtaTooltip(
      project,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('On track')
  })

  it('should handle ahead of scheduled', () => {
    const project = {
      ...mockProject,
      deadlineStatus: 'ahead-of-schedule',
    } as unknown as ProjectSchema
    const result = getProjectEtaTooltip(
      project,
      [],
      mockPluralize,
      DEFAULT_AUTO_SCHEDULE_RANGE
    )

    expect(result?.title).toContain('Ahead of schedule')
  })
})
