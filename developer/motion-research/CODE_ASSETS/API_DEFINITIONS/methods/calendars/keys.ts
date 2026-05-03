import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: createKey('calendars'),
  calendar_list: createKey('uncached_calendar_list'),
}
