import type { ProjectSchema } from '@motion/zod/client'

import { getFlowTaskStartDate } from '../get-flow-task-start-date'

describe('getFlowTaskStartDate', () => {
  const mockProject = {
    startDate: '2023-06-01',
    stages: [{ dueDate: '2023-06-15' }, { dueDate: '2023-06-30' }],
  } as ProjectSchema

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-06-10'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns project start date for first stage if date is in future', () => {
    const project = { ...mockProject, startDate: '2023-06-15' }
    const result = getFlowTaskStartDate(0, project)

    expect(result).toBe('2023-06-15')
  })

  it('returns today for first stage if project start date is in past', () => {
    const result = getFlowTaskStartDate(0, mockProject)

    expect(result).toBe('2023-06-10')
  })

  it('returns today for first stage if project start date is null', () => {
    const project = { ...mockProject, startDate: null }
    const result = getFlowTaskStartDate(0, project)

    expect(result).toBe('2023-06-10')
  })

  it('returns previous stage due date if date is in future', () => {
    const result = getFlowTaskStartDate(1, mockProject)

    expect(result).toBe('2023-06-15')
  })

  it('returns today for non-first stage if previous stage due date is in past', () => {
    const project = {
      ...mockProject,
      stages: [{ dueDate: '2023-06-05' }, { dueDate: '2023-06-30' }],
    } as ProjectSchema
    const result = getFlowTaskStartDate(1, project)

    expect(result).toBe('2023-06-10')
  })

  it('returns today for non-first stage if previous stage due date is null', () => {
    const project = {
      ...mockProject,
      stages: [{ dueDate: null }, { dueDate: '2023-06-30' }],
    } as ProjectSchema
    const result = getFlowTaskStartDate(1, project)

    expect(result).toBe('2023-06-10')
  })
})
