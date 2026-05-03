/**
 * @jest-environment-options {"url": "http://example/"}
 */

import {
  getAttachmentURL,
  getMeetingTaskStaticURL,
  getNoteStaticURL,
  getProjectStaticURL,
  getTaskStaticURL,
} from '../static-url'

describe('static-url', () => {
  it('should return the task url', () => {
    const url = getTaskStaticURL({
      workspaceId: 'workspaceId',
      taskId: 'taskId',
    })

    expect(url).toEqual(
      'http://example/web/pm/workspaces/workspaceId?task=taskId'
    )
  })

  it('should return the meeting task url', () => {
    const url = getMeetingTaskStaticURL({
      workspaceId: 'workspaceId',
      taskId: 'meetingId',
    })

    expect(url).toEqual(
      'http://example/web/pm/workspaces/workspaceId?mTask=meetingId'
    )
  })

  it('should return the project url', () => {
    const url = getProjectStaticURL({
      workspaceId: 'workspaceId',
      projectId: 'projectId',
    })

    expect(url).toEqual(
      'http://example/web/pm/workspaces/workspaceId?project=projectId'
    )
  })

  it('should return the note url', () => {
    const url = getNoteStaticURL({
      noteId: 'noteId',
    })

    expect(url).toEqual('http://example/web/pm/docs/noteId')
  })

  it('should return the attachment url', () => {
    const url = getAttachmentURL({
      fileUploadId: '1234',
    })

    expect(url).toEqual('http://example/web/attachments/1234')
  })
})
