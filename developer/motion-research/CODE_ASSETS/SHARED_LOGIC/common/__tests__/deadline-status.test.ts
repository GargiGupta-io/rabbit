import {
  resolveProjectDeadlineStatus,
  resolveStageDeadlineStatus,
} from '../deadline-status'
import { ScheduledStatus } from '../scheduled-status'

describe('resolveProjectDeadlineStatus', () => {
  const mockProject = {
    id: '1',
    name: 'Test Project',
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    dueDate: new Date('2024-01-30T00:00:00.000Z'),
    completedTime: null,
    estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
    activeStageDefinitionId: 'stage2',
    scheduledStatus: 'on-track',
    stages: [
      {
        id: 'ps1',
        stageDefinitionId: 'stage1',
        name: 'Stage 1',
        estimatedCompletionTime: new Date('2024-01-14T00:00:00.000Z'),
        dueDate: new Date('2024-01-15T00:00:00.000Z'),
        completedTime: new Date('2024-01-14T00:00:00.000Z'),
        canceledTime: null,
      },
      {
        id: 'ps2',
        stageDefinitionId: 'stage2',
        name: 'Stage 2',
        estimatedCompletionTime: new Date('2024-01-28T00:00:00.000Z'),
        dueDate: new Date('2024-01-20T00:00:00.000Z'),
        completedTime: null,
        canceledTime: null,
      },
      {
        id: 'ps3',
        stageDefinitionId: 'stage3',
        name: 'Stage 3',
        estimatedCompletionTime: new Date('2024-01-25T00:00:00.000Z'),
        dueDate: new Date('2024-01-25T00:00:00.000Z'),
        completedTime: null,
        canceledTime: new Date('2024-01-20T00:00:00.000Z'),
      },
      {
        id: 'ps4',
        stageDefinitionId: 'stage4',
        name: 'Stage 4',
        estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
        dueDate: new Date('2024-01-30T00:00:00.000Z'),
        completedTime: null,
        canceledTime: null,
      },
    ],
  }

  it('should return "none" when the entity has a completedTime', () => {
    const entity = {
      ...mockProject,
      completedTime: new Date('2024-01-14T00:00:00.000Z'),
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return "none" when the entity has a canceledTime', () => {
    const entity = {
      ...mockProject,
      canceledTime: new Date('2024-01-20T00:00:00.000Z'),
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return "missed-deadline" when the due date is in the past', () => {
    const entity = {
      ...mockProject,
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('missed-deadline')
  })

  it('should return "none" if no scheduled status ', () => {
    const entity = {
      ...mockProject,
      scheduledStatus: null,
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return "none" if no dueDate', () => {
    const entity = {
      ...mockProject,
      dueDate: null,
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return scheduled-past-due if the scheduledStatus is UNFIT', () => {
    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
      dueDate: new Date('2024-01-25T00:00:00.000Z'),
      scheduledStatus: ScheduledStatus.UNFIT_PAST_DUE,
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('scheduled-past-deadline')
  })

  it('should return scheduled-past-due if the scheduledStatus is PAST_DUE', () => {
    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
      dueDate: new Date('2024-01-25T00:00:00.000Z'),
      scheduledStatus: ScheduledStatus.PAST_DUE,
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('scheduled-past-deadline')
  })

  it('should return "ahead-of-schedule" when the estimated completion time is less than 80% of the due time', () => {
    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-20T00:00:00.000Z'),
      dueDate: new Date('2024-01-30T00:00:00.000Z'),
      stages: [],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('ahead-of-schedule')
  })

  it('should return "on-track" when the estimated completion time is not less than 80% of the due time', () => {
    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-28T00:00:00.000Z'),
      dueDate: new Date('2024-01-30T00:00:00.000Z'),
      stages: [],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('on-track')
  })

  it('should return on-track when estimated completion time is later on the same day as the due date', () => {
    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-17T13:00:00.000Z'),
      dueDate: new Date('2024-01-17T00:00:00.000Z'),
      stages: [],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('on-track')
  })

  it('should return "at-risk" if a stage is missed-deadline', () => {
    const stage1 = {
      ...mockProject.stages[0],
      completedTime: null,
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
      estimatedCompletionTime: new Date('2024-01-03T00:00:00.000Z'),
    }

    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-28T00:00:00.000Z'),
      stages: [
        stage1,
        mockProject.stages[1],
        mockProject.stages[2],
        mockProject.stages[3],
      ],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('at-risk')
  })

  it('should return "at-risk" if a stage scheduledStatus is past due', () => {
    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-28T00:00:00.000Z'),
      stages: [
        {
          ...mockProject.stages[0],
          dueDate: new Date('2024-01-01T00:00:00.000Z'),
          estimatedCompletionTime: new Date('2024-01-03T00:00:00.000Z'),
          completedTime: null,
          scheduledStatus: ScheduledStatus.PAST_DUE,
        },
        mockProject.stages[1],
        mockProject.stages[2],
        mockProject.stages[3],
      ],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('at-risk')
  })

  it('should return "missed-deadline" even if a stage is scheduled-past-deadline', () => {
    const stage2 = {
      ...mockProject.stages[1],
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
      estimatedCompletionTime: new Date('2024-01-03T00:00:00.000Z'),
    }

    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-28T00:00:00.000Z'),
      dueDate: new Date('2024-01-25T00:00:00.000Z'),
      stages: [
        mockProject.stages[0],
        stage2,
        mockProject.stages[2],
        mockProject.stages[3],
      ],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-28T00:00:00.000Z'))
    ).toBe('missed-deadline')
  })

  it('should return "scheduled-past-deadline" even if a stage is missed-deadline', () => {
    const stage1 = {
      ...mockProject.stages[0],
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
      estimatedCompletionTime: new Date('2024-01-03T00:00:00.000Z'),
    }

    const entity = {
      ...mockProject,
      estimatedCompletionTime: new Date('2024-01-28T00:00:00.000Z'),
      dueDate: new Date('2024-01-25T00:00:00.000Z'),
      scheduledStatus: ScheduledStatus.UNFIT_PAST_DUE,
      stages: [
        stage1,
        mockProject.stages[1],
        mockProject.stages[2],
        mockProject.stages[3],
      ],
    }

    expect(
      resolveProjectDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('scheduled-past-deadline')
  })
})

describe('resolveStageDeadlineStatus', () => {
  const mockStage = {
    id: '1',
    name: 'Test Stage',
    estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
    dueDate: new Date('2024-01-30T00:00:00.000Z'),
    completedTime: null,
    canceledTime: null,
  }

  it('should return "none" when the entity has a completedTime', () => {
    const entity = {
      ...mockStage,
      completedTime: new Date('2024-01-14T00:00:00.000Z'),
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return "none" when the entity has a canceledTime', () => {
    const entity = {
      ...mockStage,
      canceledTime: new Date('2024-01-20T00:00:00.000Z'),
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return "missed-deadline" when the due date is in the past', () => {
    const entity = {
      ...mockStage,
      dueDate: new Date('2024-01-01T00:00:00.000Z'),
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('missed-deadline')
  })

  it('should return "none" if no estimatedCompletionTime & no scheduledStatus', () => {
    const entity = {
      ...mockStage,
      estimatedCompletionTime: null,
      scheduledStatus: null,
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return on-track if the due date is same day as the scheduled date or now (should be end of day)', () => {
    const entity = {
      ...mockStage,
      estimatedCompletionTime: new Date('2024-01-17T13:00:00.000Z'),
      dueDate: new Date('2024-01-17T00:00:00.000Z'),
      stages: [],
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('on-track')
  })

  it('should return "none" if no dueDate', () => {
    const entity = {
      ...mockStage,
      dueDate: null,
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('none')
  })

  it('should return "scheduled-past-deadline" if scheduledStatus is UNFIT_PAST_DUE', () => {
    const entity = {
      ...mockStage,
      estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
      dueDate: new Date('2024-01-25T00:00:00.000Z'),
      scheduledStatus: ScheduledStatus.UNFIT_PAST_DUE,
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('scheduled-past-deadline')
  })

  it('should return "scheduled-past-deadline" if scheduledStatus is PAST_DUE', () => {
    const entity = {
      ...mockStage,
      estimatedCompletionTime: new Date('2024-01-30T00:00:00.000Z'),
      dueDate: new Date('2024-01-25T00:00:00.000Z'),
      scheduledStatus: ScheduledStatus.PAST_DUE,
    }

    expect(
      resolveStageDeadlineStatus(entity, new Date('2024-01-17T00:00:00.000Z'))
    ).toBe('scheduled-past-deadline')
  })
})
