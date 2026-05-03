export const BookingConferenceType = {
  NONE: 'NONE',
  ZOOM: 'ZOOM',
  GOOGLE_MEET: 'GOOGLE_MEET',
  MICROSOFT_TEAMS: 'MICROSOFT_TEAMS',
  PHONE: 'PHONE',
  CUSTOM_LOCATION: 'CUSTOM_LOCATION',
} as const

export type BookingConferenceType =
  (typeof BookingConferenceType)[keyof typeof BookingConferenceType]
