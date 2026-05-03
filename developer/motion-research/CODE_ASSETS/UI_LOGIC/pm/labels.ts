import { type COLOR, COLORS } from '@motion/shared/common'
import { type LabelSchema } from '@motion/zod/client'

export const legacyColorToNewColor: Record<
  string,
  (typeof labelColors)[number]
> = {
  '#47C96B': 'green',
  '#7C23B3': 'purple',
  '#D01DA9': 'pink',
  // No mapping for blue and teal?
  '#1DC4CF': 'cyan',
  '#F2762F': 'orange',
  '#FABD61': 'yellow',
  '#F44E58': 'red',
  '#A1A1A1': 'grey',
}

export const labelColorOptions = Object.keys(legacyColorToNewColor)

export const labelIconColors = {
  green: 'text-label-green-bg',
  purple: 'text-label-purple-bg',
  pink: 'text-label-pink-bg',
  blue: 'text-label-blue-bg',
  teal: 'text-label-teal-bg',
  cyan: 'text-label-cyan-bg',
  orange: 'text-label-orange-bg',
  yellow: 'text-label-yellow-bg',
  red: 'text-label-red-bg',
  grey: 'text-label-grey-bg',
}

export function isNewLabelColor(
  color: string
): color is (typeof labelColors)[number] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return labelColors.includes(color as any)
}

export const variantColors = {
  green: 'bg-label-green-bg text-label-green-text',
  purple: 'bg-label-purple-bg text-label-purple-text',
  pink: 'bg-label-pink-bg text-label-pink-text',
  blue: 'bg-label-blue-bg text-label-blue-text',
  teal: 'bg-label-teal-bg text-label-teal-text',
  cyan: 'bg-label-cyan-bg text-label-cyan-text',
  orange: 'bg-label-orange-bg text-label-orange-text',
  yellow: 'bg-label-yellow-bg text-label-yellow-text',
  red: 'bg-label-red-bg text-label-red-text',
  grey: 'bg-label-grey-bg text-label-grey-text',
  transparent: 'bg-transparent text-label-grey-text',
}

export const labelColors = Object.keys(variantColors).filter(
  (color) => color !== 'transparent'
) as unknown as (keyof Omit<typeof variantColors, 'transparent'>)[]

export function getLabelColorClass({
  color: legacyColor,
}: Pick<LabelSchema, 'color'>) {
  const color: string =
    legacyColorToNewColor[legacyColor] ??
    (isNewLabelColor(legacyColor) ? legacyColor : 'grey')

  const className = variantColors[color as keyof typeof variantColors]
  return className
}

export function getNewColorName(oldColor: string): COLOR {
  // If the color is already a new color, return it
  if (COLORS.includes(oldColor)) {
    return oldColor as COLOR
  }

  const legacyNewColor = legacyColorToNewColor[oldColor]

  // If the color exists in the legacy mapping, return it
  // Unless it's grey, in which case we return the new grey
  if (legacyNewColor != null && legacyNewColor !== 'grey') {
    return legacyNewColor as COLOR
  }

  // Default to gray
  return 'gray'
}
