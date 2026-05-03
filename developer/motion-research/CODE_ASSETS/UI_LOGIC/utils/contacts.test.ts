import { type CalendarEvent } from '@motion/rpc-types/legacy'

import {
  mergeContactsWithEventGuests,
  parseAndCountCalendarEventAttendees,
} from './contacts'

describe('contacts', () => {
  describe('mergeContactsWithEventGuests', () => {
    it('should prefer rank of event guest contact and account of search result contact', () => {
      const merged = mergeContactsWithEventGuests(
        {
          'foo@example.com': {
            displayName: 'Full Name',
            email: 'foo@example.com',
            account: 'account@example.com',
            teamDomain: true,
            rank: 3,
          },
          'foo3@example.com': {
            displayName: 'Full Name',
            email: 'foo3@example.com',
            account: 'account@example.com',
            teamDomain: true,
          },
        },
        {
          'foo@example.com': {
            displayName: 'foo@example.com',
            email: 'foo@example.com',
            account: 'account2@example.com',
            teamDomain: true,
            rank: 2,
          },
          'foo2@example.com': {
            displayName: 'foo2@example.com',
            email: 'foo2@example.com',
            account: 'account2@example.com',
            teamDomain: true,
            rank: 3,
          },
        }
      )

      expect(merged).toEqual({
        'foo@example.com': {
          displayName: 'Full Name',
          email: 'foo@example.com',
          account: 'account@example.com',
          teamDomain: true,
          rank: 2,
        },
        'foo2@example.com': {
          displayName: 'foo2@example.com',
          email: 'foo2@example.com',
          account: 'account2@example.com',
          teamDomain: true,
          rank: 3,
        },
        'foo3@example.com': {
          displayName: 'Full Name',
          email: 'foo3@example.com',
          account: 'account@example.com',
          teamDomain: true,
        },
      })
    })
  })

  describe('parseAndCountCalenderEventAttendees', () => {
    it('should parse and count attendees', () => {
      const events = [
        {
          attendees: [{ email: 'test1@test.com' }],
        },
        {
          attendees: [{ email: 'test1@test.com' }, { email: 'test2@test.com' }],
        },
      ]

      const result = parseAndCountCalendarEventAttendees(
        events as CalendarEvent[]
      )

      expect(result['test1@test.com'].rank).toEqual(2)
      expect(result['test2@test.com'].rank).toEqual(1)
    })
  })
})
