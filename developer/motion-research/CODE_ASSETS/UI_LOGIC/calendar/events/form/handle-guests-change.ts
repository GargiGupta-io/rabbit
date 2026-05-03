import { type EventConferenceType } from '@motion/rpc-types'
import {
  type CalendarProviderType,
  type Contact,
  type EmailAccount,
} from '@motion/rpc-types/legacy'

import { type EventFormFields } from './form-fields'

import { getConferenceDataForType } from '../../conference'
import { createOrganizingAttendee } from '../helpers'

type HandleGuestsChangeNewValue = {
  contact: Contact | Contact[]
  hostEmailAccount: EmailAccount
  conferenceTypeInSettings?: EventConferenceType
}

export function handleGuestsChange(
  {
    contact,
    hostEmailAccount,
    conferenceTypeInSettings = 'none',
  }: HandleGuestsChangeNewValue,
  {
    attendees,
    conferenceType,
  }: Pick<EventFormFields, 'attendees' | 'conferenceType'>
) {
  const changes = {
    attendees: [...attendees],
    conferenceType,
  }

  let contactList = Array.isArray(contact) ? contact : [contact]

  // Adding the host + contact when the list of attendees was empty initially
  if (attendees.length === 0) {
    // Remove the host from the contact list
    contactList = contactList.filter(
      (contact) => contact.email !== hostEmailAccount.email
    )
    changes.attendees.push(
      createOrganizingAttendee(hostEmailAccount.email, hostEmailAccount.name)
    )

    if (conferenceType === 'none') {
      changes.conferenceType = getValidConferenceTypeForProvider(
        conferenceTypeInSettings,
        hostEmailAccount.providerType
      )
    }
  }

  contactList.forEach((contact) => {
    const wasAlreadyGuest = changes.attendees.some(
      (attendee) => attendee.email === contact.email
    )

    // Removing the attendee
    if (wasAlreadyGuest) {
      changes.attendees = changes.attendees.filter(
        (attendee) => attendee.email !== contact.email
      )

      return changes
    }

    changes.attendees.push(createContactAttendee(contact))
  })

  // After adding/removing attendees, check if we have guests and need to set conference type
  const hasGuests = changes.attendees.some((attendee) => !attendee.isOrganizer)

  // If we have guests and conference type is 'none', set it to the default
  if (hasGuests && changes.conferenceType === 'none') {
    changes.conferenceType = getValidConferenceTypeForProvider(
      conferenceTypeInSettings,
      hostEmailAccount.providerType
    )
  }

  return changes
}

function createContactAttendee(contact: Contact, isHost = false) {
  return {
    email: contact.email,
    displayName: contact.displayName ?? contact.email,
    isOptional: false,
    isOrganizer: isHost,
    status: 'needsAction' as const,
  }
}

export function getValidConferenceTypeForProvider(
  conferenceType: EventConferenceType,
  providerType: CalendarProviderType
): EventConferenceType {
  const conferenceData = getConferenceDataForType(conferenceType)

  if (conferenceData.category === 'meet' && providerType !== 'GOOGLE') {
    return 'zoom'
  }

  if (conferenceData.category === 'teams' && providerType !== 'MICROSOFT') {
    return 'zoom'
  }

  return conferenceType
}

export function getValidConferenceTypesForProvider(
  conferenceTypes: EventConferenceType[],
  providerType: CalendarProviderType
): EventConferenceType[] {
  const set = new Set<EventConferenceType>(
    conferenceTypes.map((conferenceType) =>
      getValidConferenceTypeForProvider(conferenceType, providerType)
    )
  )
  return Array.from(set)
}
