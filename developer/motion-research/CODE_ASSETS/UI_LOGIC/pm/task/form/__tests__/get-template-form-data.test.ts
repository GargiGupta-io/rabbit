import { type TemplateTaskType } from '@motion/rpc-types/legacy'
import { NO_DURATION } from '@motion/shared/pm'

import { type TaskFormFields } from '../form-fields'
import { getTemplateFormData } from '../get-template-form-data'

const baseTemplate: TemplateTaskType = {
  task: {
    assigneeUserId: 'user123',
    statusId: 'status456',
    labels: [{ labelId: 'label789' }],
    priorityLevel: 'MEDIUM',
    duration: 3600,
    minimumDuration: 1800,
    name: 'Sample Task',
    description: 'Sample Description',
    deadlineType: 'HARD',
    schedule: 'schedule123',
    workspaceId: 'workspace123',
    projectId: '123',
    isChunkedTask: false,
    isReminderTask: false,
    isAutoScheduled: false,
    assignees: [],
  },
  id: '1',
  name: 'Test template',
  workspaceId: 'workspace123',
}

const baseExpectedFormData: Partial<TaskFormFields> = {
  assigneeUserId: 'user123',
  statusId: 'status456',
  labelIds: ['label789'],
  priorityLevel: 'MEDIUM',
  duration: 3600,
  minimumDuration: 1800,
  name: 'Sample Task',
  description: 'Sample Description',
  deadlineType: 'HARD',
  scheduleId: 'schedule123',
}

describe('getTemplateFormData', () => {
  it('should return correct formData with all fields', () => {
    const template: TemplateTaskType = {
      ...baseTemplate,
    }

    const expectedFormData: Partial<TaskFormFields> = {
      ...baseExpectedFormData,
    }

    expect(getTemplateFormData(template)).toEqual(expectedFormData)
  })

  it('should handle null assigneeUserId', () => {
    const template: TemplateTaskType = {
      ...baseTemplate,
      task: {
        ...baseTemplate.task,
        assigneeUserId: null,
      },
    }

    const expectedFormData: Partial<TaskFormFields> = {
      ...baseExpectedFormData,
      assigneeUserId: undefined, // This field should be undefined if assigneeUserId is null in the template
    }
    delete expectedFormData.assigneeUserId

    expect(getTemplateFormData(template)).toEqual(expectedFormData)
  })

  it('should handle undefined duration', () => {
    const template: TemplateTaskType = {
      ...baseTemplate,
      task: {
        ...baseTemplate.task,
        duration: undefined,
      },
    }

    const expectedFormData: Partial<TaskFormFields> = {
      ...baseExpectedFormData,
      duration: NO_DURATION,
    }

    expect(getTemplateFormData(template)).toEqual(expectedFormData)
  })

  describe('recurring', () => {
    it('returns data with priority High when template has priority ASAP and option recurring:true', () => {
      const template: TemplateTaskType = {
        ...baseTemplate,
        task: {
          ...baseTemplate.task,
          priorityLevel: 'ASAP',
        },
      }

      const expectedFormData: Partial<TaskFormFields> = {
        ...baseExpectedFormData,
        priorityLevel: 'HIGH',
      }

      expect(getTemplateFormData(template, { recurring: true })).toEqual(
        expectedFormData
      )
    })

    it('returns data with priority Medium when template has priority Low and option recurring:true', () => {
      const template: TemplateTaskType = {
        ...baseTemplate,
        task: {
          ...baseTemplate.task,
          priorityLevel: 'LOW',
        },
      }

      const expectedFormData: Partial<TaskFormFields> = {
        ...baseExpectedFormData,
        priorityLevel: 'MEDIUM',
      }

      expect(getTemplateFormData(template, { recurring: true })).toEqual(
        expectedFormData
      )
    })
  })
})
