export const EventConferenceTypes = [
  'none',
  'zoom',
  'hangoutsMeet',
  'meet',
  'teamsForBusiness',
  'phone',
  'customLocation',
  // Other gcal conference types
  'eventHangout',
  'eventNamedHangout',
  // Other MS Graph conference types
  'unknown',
  'skypeForBusiness',
  'skypeForConsumer',
] as const satisfies EventConferenceType[]

export const EventConferenceType = {
  none: 'none',
  zoom: 'zoom',
  hangoutsMeet: 'hangoutsMeet',
  meet: 'meet',
  teamsForBusiness: 'teamsForBusiness',
  phone: 'phone',
  customLocation: 'customLocation',
  // Other gcal conference types
  eventHangout: 'eventHangout',
  eventNamedHangout: 'eventNamedHangout',
  // Other MS Graph conference types
  unknown: 'unknown',
  skypeForBusiness: 'skypeForBusiness',
  skypeForConsumer: 'skypeForConsumer',
} as const

export type EventConferenceType =
  (typeof EventConferenceType)[keyof typeof EventConferenceType]
