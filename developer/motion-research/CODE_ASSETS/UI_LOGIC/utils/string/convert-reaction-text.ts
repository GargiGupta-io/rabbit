import { REACTION_EMOJI_MAP } from '@motion/shared/common'

export const convertEmojiText = (text: string) => {
  return Array.from(REACTION_EMOJI_MAP.entries()).reduce(
    (acc, [pattern, emoji]) => acc.replaceAll(pattern, emoji),
    text
  )
}
