import { type EventConferenceTypeHumanReadable } from '@motion/rpc-types/legacy'
import { type EventConferenceType } from '@motion/shared/common'
import { type CalendarProviderTypeSchema } from '@motion/zod/client'

const zoomImageLink =
  'https://assets.usemotion.com/calendar/conference-types/zoom.svg'
const meetImageLink =
  'https://assets.usemotion.com/calendar/conference-types/google-meet.png'
const teamsImageLink =
  'https://assets.usemotion.com/calendar/conference-types/microsoft-teams.png'
const phoneImageLink =
  'https://assets.usemotion.com/calendar/conference-types/phone.png'
const customLocationImageLink =
  'https://assets.usemotion.com/calendar/conference-types/custom-link.png'

/**
 * List of event conference types that users can use when creating or updating events
 */
export const limitedEventConferenceTypes = [
  'none',
  'zoom',
  'hangoutsMeet',
  'teamsForBusiness',
  'phone',
  'customLocation',
] as const satisfies EventConferenceType[]
export type LimitedEventConferenceType =
  (typeof limitedEventConferenceTypes)[number]

/**
 * List of event conference types used on Mobile
 */
export const MobileEventConferenceTypes = [
  'none',
  'zoom',
  'hangoutsMeet',
  'teamsForBusiness',
  'phone',
  'customLocation',
] as const satisfies EventConferenceType[]

export type MobileEventConferenceType =
  (typeof MobileEventConferenceTypes)[number]

/**
 * Returns a list of Event conference types based on the specific provider type
 */
export function getConferenceTypesForProviderType(
  providerType: CalendarProviderTypeSchema
) {
  return limitedEventConferenceTypes.filter((type) => {
    if (type === 'hangoutsMeet') {
      return providerType === 'GOOGLE'
    }
    if (type === 'teamsForBusiness') {
      return providerType === 'MICROSOFT'
    }

    return true
  })
}

type ConferenceUIData = {
  title: string
  category?: 'meet' | 'zoom' | 'teams'
  link?: string
}

export function getConferenceDataForType<T extends EventConferenceType>(
  type: T
): ConferenceUIData {
  switch (type) {
    case 'zoom':
      return { title: 'Zoom', category: 'zoom', link: zoomImageLink }

    case 'skypeForConsumer':
    case 'skypeForBusiness':
    case 'teamsForBusiness':
      return {
        title: 'Microsoft Teams',
        category: 'teams',
        link: teamsImageLink,
      }

    case 'eventNamedHangout':
    case 'eventHangout':
      return { title: 'Google Hangouts', category: 'meet', link: meetImageLink }

    case 'hangoutsMeet':
    case 'meet':
      return { title: 'Google Meet', category: 'meet', link: meetImageLink }

    case 'phone':
      return { title: 'Default phone number', link: phoneImageLink }
    case 'customLocation':
      return { title: 'Default location', link: customLocationImageLink }
    case 'none':
      return { title: 'No conferencing' }
    default:
      return { title: 'Unknown' }
  }
}

type GetConferenceTypeFromLinkArgs = {
  conferenceLink: string | null | undefined
  readable?: boolean
}

/**
 * @deprecated use the `event.conferenceType` from the event, and `getConferenceDataForType`
 */
export function getConferenceTypeFromConferenceLink({
  conferenceLink,
  readable,
}: GetConferenceTypeFromLinkArgs & {
  readable: true
}): EventConferenceTypeHumanReadable
export function getConferenceTypeFromConferenceLink({
  conferenceLink,
  readable,
}: GetConferenceTypeFromLinkArgs & {
  readable?: false
}): EventConferenceType
export function getConferenceTypeFromConferenceLink({
  conferenceLink,
  readable,
}: GetConferenceTypeFromLinkArgs): unknown {
  if (!conferenceLink)
    return readable ? getConferenceDataForType('none').title : 'none'

  if (conferenceLink.includes('zoom.us')) {
    return readable ? getConferenceDataForType('zoom').title : 'zoom'
  } else if (conferenceLink.includes('meet.google.com')) {
    return readable
      ? getConferenceDataForType('hangoutsMeet').title
      : 'hangoutsMeet'
  } else if (conferenceLink.includes('teams.microsoft.com')) {
    return readable
      ? getConferenceDataForType('teamsForBusiness').title
      : 'teamsForBusiness'
  } else if (conferenceLink.includes('join.skype.com')) {
    return readable
      ? getConferenceDataForType('skypeForConsumer').title
      : 'skypeForConsumer'
  }

  return readable ? getConferenceDataForType('none').title : 'none'
}
