import { getCalendarStaticURL, getNoteStaticURL } from '../pm'

export function getMentionUrl(entityId: string, entityType: string) {
  const calendarUrl = new URL(getCalendarStaticURL())

  switch (entityType) {
    case 'task':
      calendarUrl.searchParams.set('task', entityId)
      return calendarUrl.toString()
    case 'project':
      calendarUrl.searchParams.set('project', entityId)
      return calendarUrl.toString()
    case 'note':
      return getNoteStaticURL({ noteId: entityId })
    default:
      return null
  }
}
