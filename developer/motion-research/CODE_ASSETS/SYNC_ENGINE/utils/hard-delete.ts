export const HARD_DELETE_SYNC_SUFFIX = 'hard-deleted'

export function isHardDeleteSyncEvent(eventType: string) {
  return eventType.endsWith(`.${HARD_DELETE_SYNC_SUFFIX}`)
}
