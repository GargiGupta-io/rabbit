import { createNoneId } from '@motion/shared/identifiers'
import { type ProjectSchema } from '@motion/zod/client'

import { DateTime } from 'luxon'
import tk from 'timekeeper'

import {
  createTemporaryProject,
  getProjectDateText,
  getProjectInitialDueDate,
} from '../project-utils'

describe('createTemporaryProject', () => {
  beforeEach(() => {
    tk.freeze(new Date('2024-07-12T14:08:07.712+00:00'))
  })

  afterEach(() => {
    tk.reset()
  })

  it('should create a temporary project with default values', () => {
    const managerId = 'manager123'
    const createdByUserId = 'user123'
    const workspaceId = 'workspace123'
    const statusId = 'status123'
    const priorityLevel = 'HIGH'
    const labelId = 'label123'

    const expectedProject = {
      id: createNoneId(workspaceId),
      type: 'NORMAL',
      managerId,
      workspaceId,
      statusId,
      name: expect.any(String),
      description: expect.any(String),
      dueDate: expect.any(String),
      priorityLevel,
      labelIds: [labelId],
      createdByUserId,
      createdTime: expect.any(String),
      updatedTime: null,
      customFieldValues: {},
      flowTemplateId: null,
      startDate: expect.any(String),
      activeStageDefinitionId: null,
      projectDefinitionId: null,
      stages: [],
      variableInstances: [],
      color: expect.any(String),
      completedDuration: expect.any(Number),
      completedTaskCount: expect.any(Number),
      canceledDuration: expect.any(Number),
      canceledTaskCount: expect.any(Number),
      duration: expect.any(Number),
      taskCount: expect.any(Number),
      completion: expect.any(Number),
      uploadedFileIds: [],
      folderId: null,
      scheduledStatus: null,
      estimatedCompletionTime: null,
      deadlineStatus: null,
    }

    const createdProject = createTemporaryProject({
      managerId,
      createdByUserId,
      workspaceId,
      statusId,
      priorityLevel,
      labelId,
    })

    expect(createdProject).toEqual(expectedProject)
  })

  it('should create a temporary project with custom field values', () => {
    const managerId = 'manager123'
    const createdByUserId = 'user123'
    const workspaceId = 'workspace123'
    const statusId = 'status123'
    const priorityLevel = 'MEDIUM'
    const labelId = 'label123'
    const customFieldValues: ProjectSchema['customFieldValues'] = {
      field1: {
        type: 'text',
        value: 'value1',
      },
    }

    const expectedProject = {
      id: createNoneId(workspaceId),
      type: 'NORMAL',
      managerId,
      workspaceId,
      statusId,
      name: expect.any(String),
      description: expect.any(String),
      dueDate: expect.any(String),
      priorityLevel,
      labelIds: [labelId],
      createdByUserId,
      createdTime: expect.any(String),
      updatedTime: null,
      customFieldValues,
      flowTemplateId: null,
      startDate: expect.any(String),
      activeStageDefinitionId: null,
      projectDefinitionId: null,
      stages: [],
      variableInstances: [],
      color: expect.any(String),
      completedDuration: expect.any(Number),
      completedTaskCount: expect.any(Number),
      canceledDuration: expect.any(Number),
      canceledTaskCount: expect.any(Number),
      duration: expect.any(Number),
      taskCount: expect.any(Number),
      completion: expect.any(Number),
      uploadedFileIds: [],
      folderId: null,
      scheduledStatus: null,
      estimatedCompletionTime: null,
      deadlineStatus: null,
    }

    const createdProject = createTemporaryProject({
      managerId,
      createdByUserId,
      workspaceId,
      statusId,
      priorityLevel,
      labelId,
      customFieldValues,
    })

    expect(createdProject).toEqual(expectedProject)
  })
})

describe('getProjectInitialDueDate', () => {
  afterEach(() => {
    tk.reset()
  })

  it('should return the Friday in Week+1 when today is Sunday to Tuesday', () => {
    // Sunday
    tk.freeze(new Date('2024-06-09'))

    expect(getProjectInitialDueDate()).toBe('2024-06-21T23:59:59.999+00:00')

    // Monday
    tk.freeze(new Date('2024-06-10'))

    expect(getProjectInitialDueDate()).toBe('2024-06-21T23:59:59.999+00:00')

    // Tuesday
    tk.freeze(new Date('2024-06-11'))

    expect(getProjectInitialDueDate()).toBe('2024-06-21T23:59:59.999+00:00')
  })

  it('should return the Friday in Week+2 when today is Wednesday to Saturday', () => {
    // Wed
    tk.freeze(new Date('2024-06-12'))

    expect(getProjectInitialDueDate()).toBe('2024-06-28T23:59:59.999+00:00')

    // Tursday
    tk.freeze(new Date('2024-06-13'))

    expect(getProjectInitialDueDate()).toBe('2024-06-28T23:59:59.999+00:00')

    // Friday
    tk.freeze(new Date('2024-06-14'))

    expect(getProjectInitialDueDate()).toBe('2024-06-28T23:59:59.999+00:00')

    // Saturday
    tk.freeze(new Date('2024-06-15'))

    expect(getProjectInitialDueDate()).toBe('2024-06-28T23:59:59.999+00:00')
  })
})

describe(getProjectDateText, () => {
  beforeEach(() => {
    vi.useFakeTimers({
      now: DateTime.fromISO('2024-08-15T16:33:25.562Z').toMillis(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return None for null date value', () => {
    expect(getProjectDateText(null)).toBe('None')
  })

  it('should return format for date times to weekday + date format', () => {
    expect(getProjectDateText('2024-05-28T23:59:59.999+00:00')).toBe(
      'Tue May 28'
    )
  })
})
