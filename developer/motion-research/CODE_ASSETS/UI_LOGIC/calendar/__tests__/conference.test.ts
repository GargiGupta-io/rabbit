import { type EventConferenceType } from '@motion/rpc-types'

import {
  getConferenceDataForType,
  getConferenceTypeFromConferenceLink,
  getConferenceTypesForProviderType,
} from '../conference'

describe('getConferenceTypesForProviderType', () => {
  it('should return the conference types relevant to a google provider', () => {
    const actual = getConferenceTypesForProviderType('GOOGLE')

    expect(actual).toEqual([
      'none',
      'zoom',
      'hangoutsMeet',
      'phone',
      'customLocation',
    ])
  })

  it('should return the conference types relevant to a microsoft provider', () => {
    const actual = getConferenceTypesForProviderType('MICROSOFT')

    expect(actual).toEqual([
      'none',
      'zoom',
      'teamsForBusiness',
      'phone',
      'customLocation',
    ])
  })

  it('should return the conference types relevant to an apple provider', () => {
    const actual = getConferenceTypesForProviderType('APPLE')

    expect(actual).toEqual(['none', 'zoom', 'phone', 'customLocation'])
  })
})

describe('getConferenceDataForType', () => {
  it('should return correct data for zoom', () => {
    const result = getConferenceDataForType('zoom' as EventConferenceType)

    expect(result).toEqual({
      title: 'Zoom',
      category: 'zoom',
      link: expect.any(String),
    })
  })

  it('should return correct data for Microsoft Teams', () => {
    const result = getConferenceDataForType(
      'teamsForBusiness' as EventConferenceType
    )

    expect(result).toEqual({
      title: 'Microsoft Teams',
      category: 'teams',
      link: expect.any(String),
    })
  })

  it('should return correct data for Google Hangouts', () => {
    const result = getConferenceDataForType(
      'hangoutsMeet' as EventConferenceType
    )

    expect(result).toEqual({
      title: 'Google Meet',
      category: 'meet',
      link: expect.any(String),
    })
  })

  it('should return correct data for phone', () => {
    const result = getConferenceDataForType('phone' as EventConferenceType)

    expect(result).toEqual({
      title: 'Default phone number',
      link: expect.any(String),
    })
  })

  it('should return correct data for custom location', () => {
    const result = getConferenceDataForType(
      'customLocation' as EventConferenceType
    )

    expect(result).toEqual({
      title: 'Default location',
      link: expect.any(String),
    })
  })

  it('should return correct data for no conferencing', () => {
    const result = getConferenceDataForType('none' as EventConferenceType)

    expect(result).toEqual({
      title: 'No conferencing',
    })
  })

  it('should return unknown for unsupported conference types', () => {
    const result = getConferenceDataForType(
      'unsupportedType' as EventConferenceType
    )

    expect(result).toEqual({
      title: 'Unknown',
    })
  })
})

describe('getConferenceTypeFromConferenceLink', () => {
  it('should return "zoom" for a Zoom link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://zoom.us/join',
      readable: false,
    })

    expect(result).toBe('zoom')
  })

  it('should return "hangoutsMeet" for a Google Meet link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://meet.google.com/abc-defg-hij',
      readable: false,
    })

    expect(result).toBe('hangoutsMeet')
  })

  it('should return "teamsForBusiness" for a Microsoft Teams link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://teams.microsoft.com/l/meetup-join/abc-defg-hij',
      readable: false,
    })

    expect(result).toBe('teamsForBusiness')
  })

  it('should return "skypeForConsumer" for a Skype link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://join.skype.com/abc-defg-hij',
      readable: false,
    })

    expect(result).toBe('skypeForConsumer')
  })

  it('should return "none" for a null link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: null,
      readable: false,
    })

    expect(result).toBe('none')
  })

  it('should return "none" for an undefined link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: undefined,
      readable: false,
    })

    expect(result).toBe('none')
  })

  it('should return readable title for a Zoom link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://zoom.us/join',
      readable: true,
    })

    expect(result).toBe('Zoom')
  })

  it('should return readable title for a Google Meet link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://meet.google.com/abc-defg-hij',
      readable: true,
    })

    expect(result).toBe('Google Meet')
  })

  it('should return readable title for a Microsoft Teams link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://teams.microsoft.com/l/meetup-join/abc-defg-hij',
      readable: true,
    })

    expect(result).toBe('Microsoft Teams')
  })

  it('should return readable title for a Skype link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: 'https://join.skype.com/abc-defg-hij',
      readable: true,
    })

    expect(result).toBe('Microsoft Teams') // Because Skype links are mapped to Teams
  })

  it('should return readable title "No conferencing" for a null link', () => {
    const result = getConferenceTypeFromConferenceLink({
      conferenceLink: null,
      readable: true,
    })

    expect(result).toBe('No conferencing')
  })
})
