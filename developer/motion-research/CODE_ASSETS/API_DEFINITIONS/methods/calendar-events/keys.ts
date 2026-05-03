import { createKey } from '@motion/rpc'

import { type GetScheduleAssistantEvents } from './queries'

export const queryKeys = {
  root: createKey('calendar-events'),
  search: (searchQuery: string) => createKey(queryKeys.root, searchQuery),
  teammates: (teammateIds: string[]) =>
    createKey(queryKeys.root, 'teammates', teammateIds.sort()),
  calendars: (providerIds: string[]) =>
    createKey(queryKeys.root, 'calendars', providerIds.sort()),
  scheduleAssistant: (args: GetScheduleAssistantEvents['request']) => [
    ...createKey(queryKeys.root, 'scheduleAssistant'),
    args,
  ],
}
