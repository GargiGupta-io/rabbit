import { COLORS } from './colors'

export function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}
