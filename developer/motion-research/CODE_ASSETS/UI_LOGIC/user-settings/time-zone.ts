import { type UserSettingsSchema } from '@motion/rpc-types'

import { DateTime } from 'luxon'

import { areTimezonesOffsetsEqual, formatTimezoneToString } from '../utils'

export function getTimezoneSettings({
  settings,
  useDefaults,
  useFormatter = true,
}: {
  settings?: UserSettingsSchema | null
  useDefaults?: boolean
  // Formatting timezones is not supported in newer versions of iOS (Hermes) - this flag lets us opt out of this function
  useFormatter?: boolean
}) {
  const localTimezone = DateTime.local().zone
  const localTimezoneName = localTimezone.name
  const formattedLocalTimezoneString = useFormatter
    ? formatTimezoneToString(localTimezone)
    : localTimezoneName

  const timezone = settings?.timezones?.defaultTimezone
  const defaultTimezone = useDefaults
    ? (timezone ?? localTimezone.name)
    : timezone

  const rawSecondaryTimezone = settings?.timezones?.secondaryTimezone
  const secondaryTimezone =
    rawSecondaryTimezone === localTimezoneName
      ? undefined
      : rawSecondaryTimezone

  return {
    defaultTimezone,
    secondaryTimezone,
    detectedTimezone: settings?.timezones?.latestClientTimezoneDetected,
    localTimezoneName: localTimezoneName,
    formattedLocalTimezoneString: formattedLocalTimezoneString,
  }
}

export function shouldPromptForTimezoneChange({
  localTimezoneName,
  defaultTimezone,
  detectedTimezone,
}: {
  localTimezoneName: string
  defaultTimezone?: string
  detectedTimezone?: string | null
}) {
  const isInDifferentTimezone = !areTimezonesOffsetsEqual(
    localTimezoneName,
    defaultTimezone
  )

  const isLastCheckedTimezoneDifferent = detectedTimezone !== localTimezoneName

  return (
    defaultTimezone && isInDifferentTimezone && isLastCheckedTimezoneDifferent
  )
}
