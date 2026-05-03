import { type RecurringTaskFrequencySchema } from '@motion/zod/client'

// Supporting class for select options
export class FrequencySelectOption {
  constructor(
    public key: string,
    public label: string,
    public options?: FrequencySelectOption[]
  ) {
    this.key = key.toLowerCase().replace(/\s/g, '_') // Ensure all lower case; no space
    this.label = `${label.slice(0, 1).toUpperCase()}${label.slice(1)}` // Ensure initial caps.
    this.options = options // Need to explicitly set this for storybook
  }
}

/**
 * Global configuration for frequency as an object.  The class encapsulates
 * the generative functions which are used to create the options dynamically.
 *
 * See the Notion docs for details:
 * https://www.notion.so/motionapp/Recurring-Task-NLP-9687ab12a26c473882138d32dc886860
 */
class FrequencyConfig {
  getLevel2Options(root: string): FrequencySelectOption[] {
    return this.options.get(root)?.options || []
  }

  // Returns a cartesian product of the input arrays; can accept multiple.
  cartesianProduct<T>(...sets: T[][]) {
    // See: https://gist.github.com/ssippe/1f92625532eef28be6974f898efb23ef?permalink_comment_id=3530882#gistcomment-3530882
    return sets.reduce<T[][]>(
      (accSets, set) => {
        return accSets.flatMap((accSet) =>
          set.map((value) => [...accSet, value])
        )
      },
      [[]]
    )
  }

  // TODO: Normalize the formatting since we'll need to understand the values on the backend.
  // Makes the options for the months
  makeMonthOptions(): FrequencySelectOption[] {
    // Positional days of the month
    // options is an array like [['Monday', '1st'], ['Monday','2nd']...]
    const positionDayOfMonth = this.cartesianProduct(dayNames, monthWeeks).map(
      (option) =>
        new FrequencySelectOption(
          // ? pd:1st_monday, pd:2nd_monday, pd:3rd_monday...
          `pd:${option[1]}__${option[0]}`,
          `${option[1]} ${option[0]} of the month`
        )
    )

    // Absolute days of the month like 1st day, 2nd day, 3rd day...
    const absoluteDayOfMonth = [...Array(31).keys()].map((key) => {
      const day = key + 1
      const suffix =
        suffixMap.get(day.toString()) ??
        suffixMap.get(day.toString().slice(-1)) ??
        'th'

      return new FrequencySelectOption(
        // ? ad:1st__day, ad:2nd__day, ad:3rd__day, ...
        `ad:${day}__day`,
        `${day}${suffix} day of the month`
      )
    })

    // Type of day in week of month
    const dayInWeekOfMonth = this.cartesianProduct(dayTypes, monthWeeks).map(
      (option) =>
        new FrequencySelectOption(
          // ? dw:1st__week__any_week_day, dw:1st__week__any_day, dw:2nd__week__any_week_day, ...
          `dw:${option[1]}__week__${option[0]}`,
          `${option[0]} in the ${option[1]} week`
        )
    )

    return [
      ...positionDayOfMonth,
      ...absoluteDayOfMonth,
      ...dayInWeekOfMonth,
      new FrequencySelectOption('ad:last__day', 'Last day of the month'),
      new FrequencySelectOption('any_week_day', 'Any week day in the month'),
      new FrequencySelectOption('any_day', 'Any day in the month'),
    ]
  }

  // TODO: Normalize the formatting since we'll need to understand the values on the backend.
  // Makes the options for the quarterly selection
  makeQuarterOptions(): FrequencySelectOption[] {
    const quarterDayNames = dayNames.concat(['week day', 'day'])

    // 1st Monday, 1st Tuesday, ...Last Monday, Last Tuesday
    const firstLastDays = this.cartesianProduct(
      [monthWeeks[0], ...monthWeeks.slice(-1)], // ['1st', 'last']
      quarterDayNames
    ).map(
      (option) =>
        new FrequencySelectOption(
          // ? 1st__monday, 1st__week_day, 1st__calendar_day, ...
          `fl:${option[0]}__${option[1]}`,
          `${option[0]} ${option[1]}`
        )
    )

    return [
      ...firstLastDays,
      new FrequencySelectOption('1st__week', 'Any day in 1st week'),
      new FrequencySelectOption('2nd__week', 'Any day in 2nd week'),
      new FrequencySelectOption('last__week', 'Any day in last week'),
      new FrequencySelectOption('1st__month', 'Any day in 1st month'),
      new FrequencySelectOption('2nd__month', 'Any day in 2nd month'),
      new FrequencySelectOption('3rd__month', 'Any day in 3rd month'),
    ]
  }

  /* c8 ignore next */
  makeDaysOptions(): FrequencySelectOption[] {
    return [
      new FrequencySelectOption('SU', 'Sun'),
      new FrequencySelectOption('MO', 'Mon'),
      new FrequencySelectOption('TU', 'Tue'),
      new FrequencySelectOption('WE', 'Wed'),
      new FrequencySelectOption('TH', 'Thu'),
      new FrequencySelectOption('FR', 'Fri'),
      new FrequencySelectOption('SA', 'Sat'),
    ]
  }

  options: Map<string, FrequencySelectOption> = new Map([
    [
      'daily',
      new FrequencySelectOption('daily', 'Daily', [
        fqSpecificDays,
        fqEveryWeekDay,
        fqEveryDay,
      ]),
    ],
    [
      'weekly',
      new FrequencySelectOption('weekly', 'Once a week', [
        fqSpecificDays,
        fqAnyWeekDay,
        fqAnyDay,
      ]),
    ],
    [
      'biweekly',
      new FrequencySelectOption(
        'biweekly',
        'Once every 2 weeks',
        twoWeekOptions
      ),
    ],
    [
      'monthly',
      new FrequencySelectOption(
        'monthly',
        'Once a month',
        this.makeMonthOptions()
      ),
    ],
    [
      'quarterly',
      new FrequencySelectOption(
        'quarterly',
        'Once every 3 months',
        this.makeQuarterOptions()
      ),
    ],
  ])

  /**
   * ENG-1727: For a given frequency and recurrence meta, resolve the label for display.
   * @param frequency The frequency string.
   * @param recurrenceMeta The recurrenceMeta string.
   * @param days The days for specific day scenarios.
   */
  resolveLabel(frequency: string, recurrenceMeta: string, days?: string[]) {
    if (!this.options.has(frequency)) {
      return ['Undefined', 'undefined'] // Handling edge cases and errors; use strings.
    }

    const frequencyOption = this.options.get(frequency)
    const frequencyLabel = frequencyOption?.label?.replace(/\./g, '')

    // Special handling for daily, weekly
    if (
      !recurrenceMeta || // This is possible for old ones since we didn't migrate.
      recurrenceMeta === fqSpecificDays.key ||
      recurrenceMeta === fqSpecificDays1stWeek.key
    ) {
      return [frequencyLabel, dayListToStr((days as DayListItem[]) ?? [])]
    }

    const recurrenceLabel = frequencyOption?.options?.find(
      (option) => option.key === recurrenceMeta
    )

    return [frequencyLabel, recurrenceLabel?.label]
  }
}

// Fixed instances
export const fqAnyWeekDay = new FrequencySelectOption(
  'any_week_day',
  'Any week day'
)
export const fqAnyDay = new FrequencySelectOption('any_day', 'Any day')
export const fqEveryWeekDay = new FrequencySelectOption(
  'every_week_day',
  'Every week day'
)
export const fqEveryDay = new FrequencySelectOption('every_day', 'Every day')
export const fqSpecificDays = new FrequencySelectOption(
  'specific_day',
  'Specific day(s)'
)
// Options for 2 weeks.
export const fqSpecificDays1stWeek = new FrequencySelectOption(
  '1st__week__specific_days',
  'Any of these days in the first week'
)
export const fqAnyDay1stWeek = new FrequencySelectOption(
  '1st__week__any_day',
  'Any day in the first week'
)
export const fqWeekDay1stWeek = new FrequencySelectOption(
  '1st__week__any_week_day',
  'Any week day in the first week'
)
export const fqAnyDay2ndWeek = new FrequencySelectOption(
  '2nd__week__any_day',
  'Any day in the second week'
)
export const fqWeekDay2ndWeek = new FrequencySelectOption(
  '2nd__week__any_week_day',
  'Any week day in the second week'
)

export const twoWeekOptions = [
  fqSpecificDays1stWeek,
  fqWeekDay1stWeek,
  fqAnyDay1stWeek,
  fqWeekDay2ndWeek,
  fqAnyDay2ndWeek,
]

export const dayTypes = ['Any week day', 'Any day']
export const monthWeeks = ['1st', '2nd', '3rd', '4th', 'last']
export const dayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
export const suffixMap = new Map([
  ['0', 'th'],
  ['1', 'st'],
  ['2', 'nd'],
  ['3', 'rd'],
  ['11', 'th'],
  ['12', 'th'],
  ['13', 'th'],
])

// Global instance of the object.
export const frequencyConfig = new FrequencyConfig()

export const dayOrder = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
export const dayMap = {
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
  SU: 'Sun',
}

type DayListItem = keyof typeof dayMap

/* c8 ignore next */
const dayListToStr = (dayList: DayListItem[]) => {
  if (dayList.length === 7) {
    return 'Every day'
  } else if (
    dayList.length === 5 &&
    [...dayList].sort().join(',') ===
      ['MO', 'TU', 'WE', 'TH', 'FR'].sort().join(',')
  ) {
    return 'Weekdays'
  }
  const sortedDays = [...dayList].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  )
  return sortedDays.map((x) => dayMap[x]).join(', ')
}

export const defaultDays = dayOrder.slice(1, 6)

export function getLegacyFrequencyKey(frequency: RecurringTaskFrequencySchema) {
  return frequency.toLowerCase()
}

export function getCurrentFrequency(frequency: RecurringTaskFrequencySchema) {
  const legacyKey = getLegacyFrequencyKey(frequency)
  return frequencyConfig.options.get(legacyKey)
}

export function getFrequencyLabel(frequency: RecurringTaskFrequencySchema) {
  const currentFrequency = getCurrentFrequency(frequency)
  return currentFrequency?.label ?? 'Unknown'
}
