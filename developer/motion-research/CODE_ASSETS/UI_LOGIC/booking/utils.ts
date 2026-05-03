import { byValue, Compare } from '@motion/utils/array'

import { DateTime } from 'luxon'

import { type Range } from './types'

const MDY_FORMAT = 'MM/dd/yy'
const MESSAGE_DAY_FORMAT = 'ccc, MMM d'

const populateMessageTemplate = (
  messageTemplate: string,
  data: {
    meetingTimes: string
    bookingLinkUrl: string
    timezoneAbbr: string
    durationString: string
  }
) => {
  const {
    meetingTimes,
    timezoneAbbr,
    bookingLinkUrl = 'usemotion.com/your-booking-link',
    durationString = '30 min',
  } = data

  let populatedMessage = messageTemplate
  populatedMessage = populatedMessage
    .split('$Meeting times$')
    .join(meetingTimes)
  populatedMessage = populatedMessage
    .split('$Booking link$')
    .join(bookingLinkUrl)
  populatedMessage = populatedMessage.split('$Timezone$').join(timezoneAbbr)
  populatedMessage = populatedMessage.split('$Duration$').join(durationString)
  return populatedMessage
}

const enrichBookingTimesWithLinks = (timeStr: string, url: string) => {
  return timeStr
    .split(', ')
    .map((x) => `<a style="color:blue;" href="${url}" target="_blank">${x}</a>`)
    .join(', ')
}

const enrichBookingTimesWithLinkStyling = (timeStr: string) => {
  return timeStr
    .split(', ')
    .map((x) => `<span class="calendar-availability-message-link">${x}</span>`)
    .join(', ')
}

export const createBookingMessageString = (
  messageTemplate: string,
  data: {
    ranges: Range[]
    timezone: string
    timezoneAbbr: string
    bookingLinkUrl: string
    durationString: string
  }
) => {
  const { ranges, timezone, timezoneAbbr, bookingLinkUrl, durationString } =
    data

  // Group ranges by day
  const rangesByDay: Record<string, Range[]> = {}
  ranges.forEach((range) => {
    const day = DateTime.fromISO(range.start)
      .setZone(timezone)
      .toFormat(MDY_FORMAT)
    if (rangesByDay[day]) {
      rangesByDay[day].push(range)
    } else {
      rangesByDay[day] = [range]
    }
  })
  Object.keys(rangesByDay).forEach((day) => {
    rangesByDay[day].sort(
      byValue((range) => DateTime.fromISO(range.start), Compare.dateTime)
    )
  })
  const rangeDays = Object.keys(rangesByDay)
  rangeDays.sort(
    byValue((day) => DateTime.fromFormat(day, MDY_FORMAT), Compare.dateTime)
  )

  const rows: string[] = []
  rangeDays.forEach((day) => {
    let row = ''
    row += `\u2022 ${DateTime.fromFormat(day, MDY_FORMAT).toFormat(
      MESSAGE_DAY_FORMAT
    )}:`
    rangesByDay[day].forEach((range, i) => {
      const start = DateTime.fromISO(range.start).setZone(timezone)
      const end = DateTime.fromISO(range.end).setZone(timezone)
      row += `${i ? ',' : ''} ${start
        .toFormat(start.minute ? 'h:mma' : 'ha')
        .toLocaleLowerCase()} - ${end
        .toFormat(end.minute ? 'h:mma' : 'ha')
        .toLocaleLowerCase()}`
    })
    rows.push(row)
  })

  const copyablePlainText = populateMessageTemplate(messageTemplate, {
    meetingTimes: rows.join('\n'),
    bookingLinkUrl,
    timezoneAbbr,
    durationString,
  })
  let copyableHtmlText = ''
  let displayablePlainText = ''
  let displayableTextWithLinks = ''

  const rowLinks = rangeDays.map(
    (dateStr) => `${bookingLinkUrl}?date=${dateStr.replace(/\//g, '-')}`
  )
  const htmlMeetingTimes = rows
    .map(
      (row, idx) =>
        `${row.split(': ')[0]}: ${enrichBookingTimesWithLinks(
          row.split(': ')[1],
          rowLinks[idx]
        )}${idx === rows.length - 1 ? '' : '<br>'}`
    )
    .join('')
  copyableHtmlText = populateMessageTemplate(messageTemplate, {
    meetingTimes: htmlMeetingTimes,
    bookingLinkUrl: `<a style="color:blue;" href="${bookingLinkUrl}" target="_blank">${bookingLinkUrl}</a>`,
    timezoneAbbr,
    durationString,
  })
    .split('\n')
    .join('<br>')
  const displayMeetingTimes = rows
    .map(
      (row, idx) =>
        `${row.split(': ')[0]}: ${enrichBookingTimesWithLinkStyling(
          row.split(': ')[1]
        )}${idx === rows.length - 1 ? '' : '<br>'}`
    )
    .join('')
  const displayableBookingLinkUrl = `<span class="calendar-availability-message-link">${bookingLinkUrl}</span>`
  displayableTextWithLinks = populateMessageTemplate(messageTemplate, {
    meetingTimes: displayMeetingTimes,
    bookingLinkUrl: displayableBookingLinkUrl,
    timezoneAbbr,
    durationString,
  })
    .split('\n')
    .join('<br>')
  displayablePlainText = copyablePlainText
    .split(bookingLinkUrl)
    .join(displayableBookingLinkUrl)
    .split('\n')
    .join('<br>')

  return {
    copyablePlainText,
    copyableHtmlText,
    displayablePlainText,
    displayableTextWithLinks,
  }
}
