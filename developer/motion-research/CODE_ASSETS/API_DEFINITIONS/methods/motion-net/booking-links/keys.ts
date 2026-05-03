import { createKey } from '@motion/rpc'

export const queryKeys = {
  root: () => createKey('booking-links'),
  bookingLinks: () => createKey(queryKeys.root()),
  bookingLink: (id: string) => createKey(queryKeys.root(), 'booking-link', id),
}
