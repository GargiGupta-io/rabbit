import type {
  AllEvents,
  AllPushEvents,
  AllSyncEvents,
  EventDirection,
} from '../events/types'

export function isSyncEvent(event: AllEvents): event is AllSyncEvents {
  return !event.type.startsWith('push.')
}

export function isPushEvent(event: AllEvents): event is AllPushEvents {
  return event.type.startsWith('push.')
}

export function getEventDirection(event: AllEvents): EventDirection {
  return isPushEvent(event) ? 'push' : 'sync'
}
