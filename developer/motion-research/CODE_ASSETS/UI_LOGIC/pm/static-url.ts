export const getCalendarStaticURL = (origin = window.location.origin) => {
  return new URL('/web/calendar', origin).toString()
}

type GetTaskStaticURLProps = {
  workspaceId: string
  taskId: string
  origin?: string
}

export const getTaskStaticURL = ({
  workspaceId,
  taskId,
  origin = window.location.origin,
}: GetTaskStaticURLProps) => {
  return buildUrl(workspaceId, { task: taskId }, origin)
}

export const getMeetingTaskStaticURL = ({
  workspaceId,
  taskId,
  origin = window.location.origin,
}: GetTaskStaticURLProps) => {
  return buildUrl(workspaceId, { mTask: taskId }, origin)
}

const attachmentBasePath = '/web/attachments' as const

type GetAttachmentStaticURLProps = {
  fileUploadId: string
  origin?: string
}

export const getAttachmentURL = ({
  fileUploadId,
  origin = window.location.origin,
}: GetAttachmentStaticURLProps) => {
  return new URL(`${attachmentBasePath}/${fileUploadId}`, origin).toString()
}

const noteBasePath = '/web/pm/docs' as const

type GetNoteStaticURLProps = {
  noteId: string
  origin?: string
}

export const getNoteStaticURL = ({
  noteId,
  origin = window.location.origin,
}: GetNoteStaticURLProps) => {
  return new URL(`${noteBasePath}/${noteId}`, origin).toString()
}

type GetProjectStaticURLProps = {
  workspaceId: string
  projectId: string
  origin?: string
}
export const getProjectStaticURL = ({
  workspaceId,
  projectId,
  origin = window.location.origin,
}: GetProjectStaticURLProps) => {
  return buildUrl(workspaceId, { project: projectId }, origin)
}

const basePath = '/web/pm/workspaces/' as const

function buildUrl(
  workspaceId: string,
  args: Record<string, string>,
  origin = window.location.origin
) {
  const searchParams = new URLSearchParams(args)

  return new URL(`${basePath}${workspaceId}?${searchParams}`, origin).toString()
}
