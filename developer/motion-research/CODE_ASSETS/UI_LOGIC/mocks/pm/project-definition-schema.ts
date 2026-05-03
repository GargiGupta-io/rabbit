import { type ProjectDefinitionSchema } from '@motion/rpc-types'

import {
  mockStageDefinitionVariables,
  stageDefinitionSchemaMock,
} from './stage-definition-schema'

export const projectDefinitionSchemaMock = {
  id: 'project-definition-id-1',
  name: 'Project Definition Mock',
  priorityLevel: 'MEDIUM',
  description: 'Project Definition Mock',
  labelIds: [],
  color: 'gray',
  variables: mockStageDefinitionVariables,
  stageDefinitionReferences: [],
  stages: [stageDefinitionSchemaMock],
  createdByUserId: 'user-id-1',
  managerId: 'manager-id-1',
  workspaceId: 'workspace-id-1',
} as const satisfies ProjectDefinitionSchema

export const mockUnusedTextVariables = [
  {
    variableId: 'RHBPAet7f34V8mMWP409Z',
    value: '',
    stageId: '05a45868-e37f-439d-b9ad-e72d53790eff',
  },
  {
    variableId: 'aC5_-j7QLnHjelxy5uIAz',
    value: '',
    stageId: '39c53511-3ae2-4b33-9053-5bd25b0a05f6',
  },
] as const
export const mockUnusedRoleVariables = [
  {
    variableId: 'NEcmviP_IAfx50DIUuVkD',
    value: null,
    stageId: '05a45868-e37f-439d-b9ad-e72d53790eff',
  },
  {
    variableId: 'vu0rP51yqQ9EhozBLBQCM',
    value: null,
    stageId: '39c53511-3ae2-4b33-9053-5bd25b0a05f6',
  },
] as const

export const projectDefinitionSchemaMockWithUnusedVariables: ProjectDefinitionSchema =
  {
    id: '9bdS6C4l4azhzvzNjBRkq',
    workspaceId: 'moljlU4e0ZqXsGP_KInD1',
    name: 'Meetings in Projects Template',
    color: 'sky',
    description: '<p></p>',
    definitionDescription: '',
    managerId: 'pfafpFuNizN7AMOhOwkxCxSu7zE3',
    createdByUserId: 'pfafpFuNizN7AMOhOwkxCxSu7zE3',
    priorityLevel: 'MEDIUM',
    labelIds: [],
    stageDefinitionReferences: [
      {
        id: '15b7dfd0-cd4d-4284-8577-4d3cb3298f98',
        rank: '0|i00007:',
        stageDefinitionId: '05a45868-e37f-439d-b9ad-e72d53790eff',
        projectDefinitionId: '9bdS6C4l4azhzvzNjBRkq',
      },
      {
        id: 'a51ea33d-365f-47a1-8c73-3a16614afbe4',
        rank: '0|i0000f:',
        stageDefinitionId: '39c53511-3ae2-4b33-9053-5bd25b0a05f6',
        projectDefinitionId: '9bdS6C4l4azhzvzNjBRkq',
      },
    ],
    stages: [
      {
        id: '05a45868-e37f-439d-b9ad-e72d53790eff',
        name: 'Design',
        color: 'yellow',
        duration: {
          unit: 'WEEKS',
          value: 1,
        },
        tasks: [
          {
            id: 'C972gs96I9B4djnzha0iU',
            name: 'Second task',
            statusId: 'Hrss66fbOXPWdOAgo9LFZ',
            assigneeUserId: 'pfafpFuNizN7AMOhOwkxCxSu7zE3',
            assigneeVariableKey: null,
            duration: 15,
            minimumDuration: null,
            priorityLevel: 'MEDIUM',
            isAutoScheduled: true,
            blockedByTaskIds: [],
            description: '<p></p>',
            labelIds: [],
            customFieldValues: {},
            scheduleMeetingWithinDays: 3,
            uploadedFileIds: [],
            deadlineType: 'SOFT',
            startRelativeInterval: {
              referenceType: 'STAGE_START',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
            dueRelativeInterval: {
              referenceType: 'STAGE_DUE',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
          },
          {
            id: 'tc_L0XyIGontyV4HwbA1X',
            name: 'First task',
            statusId: 'Hrss66fbOXPWdOAgo9LFZ',
            assigneeUserId: 'pfafpFuNizN7AMOhOwkxCxSu7zE3',
            assigneeVariableKey: null,
            duration: 15,
            minimumDuration: null,
            priorityLevel: 'MEDIUM',
            isAutoScheduled: true,
            blockedByTaskIds: [],
            description: '<p></p>',
            labelIds: [],
            customFieldValues: {},
            scheduleMeetingWithinDays: 3,
            uploadedFileIds: [],
            deadlineType: 'SOFT',
            startRelativeInterval: {
              referenceType: 'STAGE_START',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
            dueRelativeInterval: {
              referenceType: 'STAGE_DUE',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
          },
          {
            id: 'GcipY664-sQYn71fGzW65',
            name: 'Normal task test!',
            statusId: 'Hrss66fbOXPWdOAgo9LFZ',
            assigneeUserId: 'iT1bIbdvhPTBYoJInPVOiORsjuG3',
            assigneeVariableKey: null,
            duration: 30,
            minimumDuration: null,
            priorityLevel: 'MEDIUM',
            isAutoScheduled: true,
            blockedByTaskIds: [],
            description: '<p></p>',
            labelIds: [],
            customFieldValues: {},
            scheduleMeetingWithinDays: null,
            uploadedFileIds: ['Y4pRfPW1vL7KOLP9spmy8'],
            deadlineType: 'SOFT',
            startRelativeInterval: {
              referenceType: 'STAGE_START',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
            dueRelativeInterval: {
              referenceType: 'STAGE_DUE',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
          },
          {
            id: '4yAK1T3zfQPIoksWeaV4A',
            name: 'Third task',
            statusId: 'Hrss66fbOXPWdOAgo9LFZ',
            assigneeUserId: 'pfafpFuNizN7AMOhOwkxCxSu7zE3',
            assigneeVariableKey: null,
            duration: 15,
            minimumDuration: null,
            priorityLevel: 'MEDIUM',
            isAutoScheduled: true,
            blockedByTaskIds: [],
            description: '<p></p>',
            labelIds: [],
            customFieldValues: {},
            scheduleMeetingWithinDays: 3,
            uploadedFileIds: [],
            deadlineType: 'SOFT',
            startRelativeInterval: {
              referenceType: 'STAGE_START',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
            dueRelativeInterval: {
              referenceType: 'STAGE_DUE',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
          },
        ],
        workspaceId: 'moljlU4e0ZqXsGP_KInD1',
        variables: [
          {
            id: 'RHBPAet7f34V8mMWP409Z',
            name: 'Variable 2',
            key: 'flow_key_77813263edc6',
            type: 'text',
            color: 'blue',
          },
          {
            id: 'NEcmviP_IAfx50DIUuVkD',
            name: 'Role 1',
            key: 'flow_key_f93e647ab3b9',
            type: 'person',
            color: 'green',
          },
        ],
      },
      {
        id: '39c53511-3ae2-4b33-9053-5bd25b0a05f6',
        name: 'New stage',
        color: 'yellow',
        duration: {
          unit: 'WEEKS',
          value: 1,
        },
        tasks: [
          {
            id: 'kxMhJgxsOT-NZyG1Eo2Kk',
            name: 'Fifth task',
            statusId: 'Hrss66fbOXPWdOAgo9LFZ',
            assigneeUserId: 'pfafpFuNizN7AMOhOwkxCxSu7zE3',
            assigneeVariableKey: null,
            duration: 15,
            minimumDuration: null,
            priorityLevel: 'MEDIUM',
            isAutoScheduled: true,
            blockedByTaskIds: [],
            description: '<p></p>',
            labelIds: [],
            customFieldValues: {},
            scheduleMeetingWithinDays: 3,
            uploadedFileIds: [],
            deadlineType: 'SOFT',
            startRelativeInterval: {
              referenceType: 'STAGE_START',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
            dueRelativeInterval: {
              referenceType: 'STAGE_DUE',
              referenceId: null,
              duration: {
                unit: 'DAYS',
                value: 0,
              },
            },
          },
        ],
        workspaceId: 'moljlU4e0ZqXsGP_KInD1',
        variables: [
          {
            id: 'aC5_-j7QLnHjelxy5uIAz',
            name: 'Variable 2',
            key: 'flow_key_77813263edc6',
            type: 'text',
            color: 'blue',
          },
          {
            id: 'vu0rP51yqQ9EhozBLBQCM',
            name: 'Role 1',
            key: 'flow_key_f93e647ab3b9',
            type: 'person',
            color: 'green',
          },
        ],
      },
    ],
    variables: [],
    customFieldValues: {},
    uploadedFileIds: ['lECz68tMgJ66ibiXAFD5Q', 'qQCHgxGpOaDVuH9yRdEG0'],
    folderId: null,
  } as const
