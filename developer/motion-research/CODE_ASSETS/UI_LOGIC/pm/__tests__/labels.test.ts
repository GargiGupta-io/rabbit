import { COLORS } from '@motion/shared/common'

import {
  getLabelColorClass,
  getNewColorName,
  isNewLabelColor,
  legacyColorToNewColor,
  variantColors,
} from '../labels'

describe('labels', () => {
  test('getLabelColorClass returns a color class when given a color', () => {
    const result = getLabelColorClass({ color: 'green' })

    expect(result).toEqual(variantColors['green'])
  })

  test('getLabelColorClass will return color class for hex values', () => {
    const hexColor = Object.keys(legacyColorToNewColor)[0]
    const color = legacyColorToNewColor[hexColor]

    expect(hexColor.includes('#')).toEqual(true)

    const result = getLabelColorClass({ color: hexColor })

    expect(result).toEqual(variantColors[color])
  })

  test('isNewLabelColor returns true when given a color is in labelColors', () => {
    const result = isNewLabelColor('purple')

    expect(result).toEqual(true)
  })

  test('isNewLabelColor returns false when given a color is not in labelColors', () => {
    const result = isNewLabelColor('not-a-color')

    expect(result).toEqual(false)
  })

  test('getNewColorName returns the same color if it is already a new color', () => {
    COLORS.forEach((color) => {
      const result = getNewColorName(color)

      expect(result).toEqual(color)
    })
  })

  test('getNewColorName returns the mapped new color for legacy colors', () => {
    Object.keys(legacyColorToNewColor).forEach((legacyColor) => {
      let newColor: string = legacyColorToNewColor[legacyColor]

      newColor = newColor === 'grey' ? 'gray' : newColor

      const result = getNewColorName(legacyColor)

      expect(result).toEqual(newColor)
    })
  })

  test('getNewColorName returns "gray" for unmapped legacy colors', () => {
    const result = getNewColorName('#000000')

    expect(result).toEqual('gray')
  })

  test('getNewColorName returns "gray" for legacy "grey" color', () => {
    const result = getNewColorName('grey')

    expect(result).toEqual('gray')
  })
})
