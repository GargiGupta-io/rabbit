import { DateTime } from 'luxon'

import { DEFAULT_AVAILABILITY_MESSAGE_TEMPLATE } from './constants'
import { createBookingMessageString } from './utils'

const LA_TIMEZONE = 'America/Los_Angeles'
export const BOOKING_TEST_DATETIME_FORMAT = 'MM-dd-yy h:mma'

/**
 * Convert a human-readable string, parsed in LA time, to an ISO string.
 */
export const bookingDateStringToISO = (
  dtString: string,
  timezone = LA_TIMEZONE
) => {
  return DateTime.fromFormat(dtString, BOOKING_TEST_DATETIME_FORMAT, {
    zone: timezone,
  })
    .toUTC()
    .toISO()
}

describe('createBookingMessageString', () => {
  const ranges = [
    {
      end: bookingDateStringToISO('11-04-22 1:00pm'),
      start: bookingDateStringToISO('11-04-22 9:00am'),
      preferredRange: false,
      meetingAfter: false,
      meetingBefore: false,
    },
    {
      end: bookingDateStringToISO('11-07-22 1:00pm'),
      start: bookingDateStringToISO('11-07-22 9:00am'),
      preferredRange: false,
      meetingAfter: false,
      meetingBefore: false,
    },
    {
      end: bookingDateStringToISO('11-08-22 1:00pm'),
      start: bookingDateStringToISO('11-08-22 9:00am'),
      preferredRange: false,
      meetingAfter: false,
      meetingBefore: false,
    },
  ]
  const messageTemplate = DEFAULT_AVAILABILITY_MESSAGE_TEMPLATE

  it('populate message correctly', () => {
    const { copyablePlainText } = createBookingMessageString(messageTemplate, {
      ranges,
      timezone: 'America/Los_Angeles',
      timezoneAbbr: 'PST',
      bookingLinkUrl: 'https://usemotion.com/link',
      durationString: '30 min',
    })

    expect(copyablePlainText).toEqual(
      "Would any of these time windows work for a 30 min meeting (PST)?\n\u2022 Fri, Nov 4: 9am - 1pm\n\u2022 Mon, Nov 7: 9am - 1pm\n\u2022 Tue, Nov 8: 9am - 1pm\nFeel free to use this booking page if that's easier (also contains more availabilities):\nhttps://usemotion.com/link"
    )
  })

  it('hawaii time', () => {
    const { copyablePlainText } = createBookingMessageString(messageTemplate, {
      ranges,
      timezone: 'Pacific/Honolulu',
      timezoneAbbr: 'HST',
      bookingLinkUrl: 'https://usemotion.com/link',
      durationString: '30 min',
    })

    expect(copyablePlainText).toEqual(
      "Would any of these time windows work for a 30 min meeting (HST)?\n\u2022 Fri, Nov 4: 6am - 10am\n\u2022 Mon, Nov 7: 7am - 11am\n\u2022 Tue, Nov 8: 7am - 11am\nFeel free to use this booking page if that's easier (also contains more availabilities):\nhttps://usemotion.com/link"
    )
  })
})
