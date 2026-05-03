import { hash } from '@motion/utils/string'

import { z } from 'zod/v4'

// this is defined this way so that we can utilize the typed array in zod schemas
export const COLORS = [
  'red',
  'yellow',
  'mint',
  'emerald',
  'sky',
  'lavender',
  'grape',
  'rose',
  'orange',
  'highlighter-yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
  'gray',
  'tangerine',
  'lime',
  'sage',
  'cyan',
  'cobalt',
  'violet',
  'raspberry',
] as const

export type COLOR = (typeof COLORS)[number]

export const ColorSchema = z.enum(COLORS)

export const COLOR_HUES: Record<COLOR, number> = {
  red: 0,
  orange: 15,
  tangerine: 30,
  yellow: 45,
  'highlighter-yellow': 60,
  lime: 75,
  mint: 90,
  green: 105,
  sage: 135,
  emerald: 150,
  cyan: 165,
  teal: 180,
  sky: 195,
  blue: 210,
  cobalt: 225,
  lavender: 240,
  purple: 255,
  violet: 270,
  grape: 285,
  pink: 315,
  raspberry: 330,
  rose: 345,
  // Any hue not in the range 0-360 is considered gray
  // Intentionally large to avoid confusion
  gray: 0,
}

type LegacyColorIdColors =
  | 'green'
  | 'mint'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'emerald'
  | 'cyan'
  | 'blue'
  | 'lavender'
  | 'violet'
  | 'pink'
  | 'rose'
  | 'gray'

export const legacyColorIdToColor: Record<string, LegacyColorIdColors> = {
  '0': 'green',
  '1': 'lavender',
  '2': 'mint',
  '3': 'violet',
  '4': 'rose',
  '5': 'yellow',
  '6': 'orange',
  '7': 'cyan',
  '8': 'gray',
  '9': 'blue',
  '10': 'emerald',
  '11': 'red',
  '12': 'pink',
}

export function isColor(color: string): color is COLOR {
  return COLORS.includes(color as COLOR)
}

export function castColor(color: string): COLOR {
  if (!isColor(color)) {
    return 'gray'
  }
  return color
}

export function idToColor(identifier: string): COLOR {
  const h = hash(identifier)
  return COLORS[h % COLORS.length]
}
