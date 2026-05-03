import {
  type Contact,
  type EmailAccount,
  type EventAttendee,
} from '@motion/rpc-types/legacy'

import { handleGuestsChange } from '../handle-guests-change'

describe('handleGuestsChange', () => {
  const mockContact: Contact = {
    email: 'guest@example.com',
    displayName: 'Guest Name',
  } as Contact

  const mockHostEmailAccount: EmailAccount = {
    email: 'host@example.com',
    name: 'Host Name',
    providerType: 'GOOGLE',
  } as EmailAccount

  describe('when the list of attendees is initially empty', () => {
    it('adds host as organizer when it is the contact', () => {
      const result = handleGuestsChange(
        {
          contact: {
            email: mockHostEmailAccount.email,
            displayName: mockHostEmailAccount.name,
          } as Contact,
          hostEmailAccount: mockHostEmailAccount,
        },
        { attendees: [], conferenceType: 'none' }
      )

      expect(result.attendees).toEqual([
        {
          email: 'host@example.com',
          displayName: 'Host Name',
          isOptional: false,
          isOrganizer: true,
          status: 'accepted',
        },
      ])
      expect(result.conferenceType).toBe('none')
    })

    it('adds the host as organizer + the contact', () => {
      const result = handleGuestsChange(
        {
          contact: mockContact,
          hostEmailAccount: mockHostEmailAccount,
        },
        { attendees: [], conferenceType: 'none' }
      )

      expect(result.attendees).toEqual([
        {
          email: 'host@example.com',
          displayName: 'Host Name',
          isOptional: false,
          isOrganizer: true,
          status: 'accepted',
        },
        {
          email: 'guest@example.com',
          displayName: 'Guest Name',
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ])
      expect(result.conferenceType).toBe('none')
    })
  })

  describe('when the list of attendees is not empty', () => {
    it('removes the contact from the attendees if they were present', () => {
      const otherContact: Contact = {
        email: 'other-guest@example.com',
        displayName: 'Other guest',
      } as Contact

      const initialAttendees = [
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
        {
          email: otherContact.email,
          displayName: otherContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ] as EventAttendee[]

      const result = handleGuestsChange(
        { contact: mockContact, hostEmailAccount: mockHostEmailAccount },
        {
          attendees: initialAttendees,
          conferenceType: 'none',
        }
      )

      expect(result.attendees).toEqual([
        {
          email: otherContact.email,
          displayName: otherContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ])
    })

    it('adds the contact to the attendees and sets conference type to default when adding a guest', () => {
      const otherContact: Contact = {
        email: 'other-guest@example.com',
        displayName: 'Other guest',
      } as Contact

      const initialAttendees = [
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ] as EventAttendee[]

      const result = handleGuestsChange(
        {
          contact: otherContact,
          hostEmailAccount: mockHostEmailAccount,
          conferenceTypeInSettings: 'meet',
        },
        {
          attendees: initialAttendees,
          conferenceType: 'none',
        }
      )

      expect(result.attendees).toEqual([
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
        {
          email: otherContact.email,
          displayName: otherContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ])
      // Conference type should be set to default when adding a guest
      expect(result.conferenceType).toBe('meet')
    })

    it('does not change conference type when adding a guest if it is already set', () => {
      const otherContact: Contact = {
        email: 'other-guest@example.com',
        displayName: 'Other guest',
      } as Contact

      const initialAttendees = [
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ] as EventAttendee[]

      const result = handleGuestsChange(
        {
          contact: otherContact,
          hostEmailAccount: mockHostEmailAccount,
          conferenceTypeInSettings: 'meet',
        },
        {
          attendees: initialAttendees,
          conferenceType: 'zoom',
        }
      )

      expect(result.attendees).toEqual([
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
        {
          email: otherContact.email,
          displayName: otherContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ])
      // Conference type should remain unchanged if already set
      expect(result.conferenceType).toBe('zoom')
    })

    it('sets conference type to default when adding first guest to event with only organizer', () => {
      const initialAttendees = [
        {
          email: mockHostEmailAccount.email,
          displayName: mockHostEmailAccount.name,
          isOptional: false,
          isOrganizer: true,
          status: 'accepted',
        },
      ] as EventAttendee[]

      const result = handleGuestsChange(
        {
          contact: mockContact,
          hostEmailAccount: mockHostEmailAccount,
          conferenceTypeInSettings: 'meet',
        },
        {
          attendees: initialAttendees,
          conferenceType: 'none',
        }
      )

      expect(result.attendees).toEqual([
        {
          email: mockHostEmailAccount.email,
          displayName: mockHostEmailAccount.name,
          isOptional: false,
          isOrganizer: true,
          status: 'accepted',
        },
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ])
      // Conference type should be set to default when adding first guest
      expect(result.conferenceType).toBe('meet')
    })

    it('remove all contact including the host', () => {
      const otherContact: Contact = {
        email: 'other-guest@example.com',
        displayName: 'Other guest',
      } as Contact

      const initialAttendees = [
        {
          email: mockContact.email,
          displayName: mockContact.displayName,
          isOptional: false,
          isOrganizer: true,
          status: 'needsAction',
        },
        {
          email: otherContact.email,
          displayName: otherContact.displayName,
          isOptional: false,
          isOrganizer: false,
          status: 'needsAction',
        },
      ] as EventAttendee[]

      const result = handleGuestsChange(
        {
          contact: [otherContact, mockContact],
          hostEmailAccount: mockHostEmailAccount,
        },
        {
          attendees: initialAttendees,
          conferenceType: 'none',
        }
      )

      expect(result.attendees).toEqual([])
    })
  })

  it('should keep existing conferenceType if it is not "none"', () => {
    const result = handleGuestsChange(
      { contact: mockContact, hostEmailAccount: mockHostEmailAccount },
      { attendees: [], conferenceType: 'none' }
    )

    expect(result.conferenceType).toBe('none')
  })

  it('should handle missing displayName for contact', () => {
    const contactWithoutDisplayName: Contact = {
      email: 'guest@example.com',
    } as Contact

    const result = handleGuestsChange(
      {
        contact: contactWithoutDisplayName,
        hostEmailAccount: mockHostEmailAccount,
      },
      { attendees: [], conferenceType: 'none' }
    )

    expect(result.attendees).toContainEqual({
      email: 'guest@example.com',
      displayName: 'guest@example.com',
      isOptional: false,
      isOrganizer: false,
      status: 'needsAction',
    })
  })

  describe('conference type', () => {
    it('returns conferenceType based on settings if it is "none"', () => {
      const result = handleGuestsChange(
        {
          contact: mockContact,
          hostEmailAccount: mockHostEmailAccount,
          conferenceTypeInSettings: 'eventHangout',
        },
        { attendees: [], conferenceType: 'none' }
      )

      expect(result.conferenceType).toBe('eventHangout')
    })

    it('returns conferenceType set to zoom when settings is set to Google Meet but the account is not Google', () => {
      const result = handleGuestsChange(
        {
          contact: mockContact,
          hostEmailAccount: {
            ...mockHostEmailAccount,
            providerType: 'MICROSOFT',
          },
          conferenceTypeInSettings: 'eventHangout',
        },
        { attendees: [], conferenceType: 'none' }
      )

      expect(result.conferenceType).toBe('zoom')
    })

    it('returns conferenceType set to zoom when settings is set to Teams but the account is not Microsoft', () => {
      const result = handleGuestsChange(
        {
          contact: mockContact,
          hostEmailAccount: {
            ...mockHostEmailAccount,
            providerType: 'APPLE',
          },
          conferenceTypeInSettings: 'teamsForBusiness',
        },
        { attendees: [], conferenceType: 'none' }
      )

      expect(result.conferenceType).toBe('zoom')
    })
  })

  it('able to handle an array of contacts', () => {
    const contact2: Contact = {
      email: 'guest2@example.com',
      displayName: 'Guest Name 2',
    } as Contact

    const result = handleGuestsChange(
      {
        contact: [mockContact, contact2],
        hostEmailAccount: mockHostEmailAccount,
      },
      { attendees: [], conferenceType: 'none' }
    )

    expect(result.attendees.length).toBe(3)
    expect(result.attendees).toContainEqual({
      email: 'guest@example.com',
      displayName: 'Guest Name',
      isOptional: false,
      isOrganizer: false,
      status: 'needsAction',
    })
    expect(result.attendees).toContainEqual({
      email: 'guest2@example.com',
      displayName: 'Guest Name 2',
      isOptional: false,
      isOrganizer: false,
      status: 'needsAction',
    })
  })
})
