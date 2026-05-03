export const ConferenceDescriptionText = {
  CUSTOM_LOCATION_PREFIX: "Here's the location for our meeting:",
  PHONE_PREFIX: 'Please use this number for our meeting:',
  SUFFIX: '-----',
  ZOOM_DYNAMIC_PREFIX: 'You have been invited to a scheduled Zoom meeting.',
  ZOOM_STATIC_PREFIX: 'Please join at my personal meeting link:',
  TEAMS_WRAPPER: '\\.{100,}',
}

// With conference, newline between conference and signature
export const conferenceDescriptionSignature =
  '<p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>'

export const signatureRegex = new RegExp(
  '<p>Scheduled with <a(.*?)Motion</a>(.*?)(<br>)?</p>',
  'g'
)

// No conference, leave space at top for user description input
export const noConferenceDescriptionSignature =
  '<p></p><p></p>' + conferenceDescriptionSignature

export type ZoomCreateMeetingResponse = {
  id: string
  joinUrl: string
  password: string
}

export const generateZoomMeetingMessage = ({
  id,
  joinUrl,
  password,
}: ZoomCreateMeetingResponse): string => {
  const formattedMeetingId = (id.match(/.{1,4}/g) ?? []).join(' ')
  const passwordText = password ? `<p>Password: ${password}</p>` : undefined
  return [
    `<p>${ConferenceDescriptionText.ZOOM_DYNAMIC_PREFIX}</p>`,
    `<p>Join Zoom Meeting</p>`,
    `<p><a target="_blank" rel="noopener noreferrer nofollow" href="${joinUrl}">${joinUrl}</a></p>`,
    `<p>Meeting ID: ${formattedMeetingId}</p>`,
    passwordText,
    `<p>${ConferenceDescriptionText.SUFFIX}</p>`,
  ]
    .filter(Boolean)
    .join('<p></p>')
}

export const generateZoomPersonalMeetingMessage = (link: string) => {
  return `<p>${ConferenceDescriptionText.ZOOM_STATIC_PREFIX}</p><p>${link}</p><p></p><p>${ConferenceDescriptionText.SUFFIX}</p>`
}

export const generateCustomLocationMeetingMessage = (
  customLocationCopy: string
) => {
  return `<p>${ConferenceDescriptionText.CUSTOM_LOCATION_PREFIX}</p><p></p><p>${customLocationCopy}</p><p></p><p>${ConferenceDescriptionText.SUFFIX}</p>`
}

export const generatePhoneMeetingMessage = (phoneNumber: string) => {
  return `<p>${ConferenceDescriptionText.PHONE_PREFIX}</p><p></p><p>${phoneNumber}</p><p></p><p>${ConferenceDescriptionText.SUFFIX}</p>`
}

export const stripDescriptionConference = (prevDescription: string) => {
  let newDescription = prevDescription
  newDescription = newDescription.replace(
    new RegExp(
      `<p>${ConferenceDescriptionText.CUSTOM_LOCATION_PREFIX}(.*?)${ConferenceDescriptionText.SUFFIX}</p>`,
      'gs'
    ),
    ''
  )
  newDescription = newDescription.replace(
    new RegExp(
      `<p>${ConferenceDescriptionText.PHONE_PREFIX}(.*?)${ConferenceDescriptionText.SUFFIX}</p>`,
      'gs'
    ),
    ''
  )
  newDescription = newDescription.replace(
    new RegExp(
      `<p>${ConferenceDescriptionText.ZOOM_DYNAMIC_PREFIX}(.*?)${ConferenceDescriptionText.SUFFIX}</p>`,
      'gs'
    ),
    ''
  )
  newDescription = newDescription.replace(
    new RegExp(
      `<p>${ConferenceDescriptionText.ZOOM_STATIC_PREFIX}(.*?)${ConferenceDescriptionText.SUFFIX}</p>`,
      'gs'
    ),
    ''
  )

  newDescription = newDescription.replace(
    new RegExp(
      `${ConferenceDescriptionText.TEAMS_WRAPPER}(.*?)${ConferenceDescriptionText.TEAMS_WRAPPER}`,
      'gs'
    ),
    ''
  )
  return newDescription
}

// if no signature, one will be added
export const addConferenceBeforeSignature = (
  description: string,
  inviteMessage: string
) => {
  return (
    description.replace(signatureRegex, '') +
    inviteMessage +
    conferenceDescriptionSignature
  )
}

export const descriptionAddConference = (
  prevDescription: string,
  conferenceDescription: string
) => {
  const newDescription = stripDescriptionConference(prevDescription)
  return addConferenceBeforeSignature(newDescription, conferenceDescription)
}
