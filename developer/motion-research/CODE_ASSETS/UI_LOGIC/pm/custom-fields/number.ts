import { type FormatOptions } from './types'

export const numberFormatOptions: FormatOptions = [
  {
    id: 'plain',
    label: 'Unformatted',
    exampleText: '1337   40523.2',
  },
  {
    id: 'formatted',
    label: 'Formatted',
    exampleText: '1,337   40,523.2',
  },
  {
    id: 'percent',
    label: 'Percent',
    exampleText: '12%   150%   45.2%',
  },
]
