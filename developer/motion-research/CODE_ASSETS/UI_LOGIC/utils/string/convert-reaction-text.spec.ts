import { REACTION_EMOJI_MAP } from '@motion/shared/common'

import { convertEmojiText } from './convert-reaction-text'

describe('convertEmojiText', () => {
  it('should replace :thumbsup: with 👍', () => {
    const input = 'Sounds great :thumbsup:'
    const expected = 'Sounds great 👍'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :thumbsdown: with 👎', () => {
    const input = 'I disagree :thumbsdown:'
    const expected = 'I disagree 👎'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :smile: with 😄', () => {
    const input = 'That makes me happy :smile:'
    const expected = 'That makes me happy 😄'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :frown: with 😕', () => {
    const input = 'This is disappointing :frown:'
    const expected = 'This is disappointing 😕'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :heart: with ❤️', () => {
    const input = 'I love this :heart:'
    const expected = 'I love this ❤️'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :rocket: with 🚀', () => {
    const input = "Let's ship this :rocket:"
    const expected = "Let's ship this 🚀"

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :plus: with ➕', () => {
    const input = 'Add this feature :plus:'
    const expected = 'Add this feature ➕'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :folded-hands: with 🙏', () => {
    const input = 'Please help :folded-hands:'
    const expected = 'Please help 🙏'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should replace :eyes: with 👀', () => {
    const input = 'Interesting :eyes:'
    const expected = 'Interesting 👀'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle multiple reactions in the same text', () => {
    const input = 'This is amazing :heart: :rocket: :smile:'
    const expected = 'This is amazing ❤️ 🚀 😄'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle reactions at the beginning of text', () => {
    const input = ':thumbsup: Great work!'
    const expected = '👍 Great work!'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle reactions at the end of text', () => {
    const input = 'Great work! :thumbsup:'
    const expected = 'Great work! 👍'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle text with only reactions', () => {
    const input = ':heart::rocket::smile:'
    const expected = '❤️🚀😄'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle text with no reactions', () => {
    const input = 'This is just regular text without any reactions'
    const expected = 'This is just regular text without any reactions'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle empty string', () => {
    const input = ''
    const expected = ''

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle text with partial reaction patterns', () => {
    const input = 'This has :thumbs but not :thumbsup:'
    const expected = 'This has :thumbs but not 👍'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle text with reaction patterns that are not in the map', () => {
    const input = 'This has :custom: and :thumbsup: reactions'
    const expected = 'This has :custom: and 👍 reactions'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle case-sensitive reactions correctly', () => {
    const input = 'This has :THUMBSUP: and :thumbsup:'
    const expected = 'This has :THUMBSUP: and 👍'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle all reactions from REACTION_EMOJI_MAP', () => {
    const allReactions = Array.from(REACTION_EMOJI_MAP.keys()).join(' ')
    const allEmojis = Array.from(REACTION_EMOJI_MAP.values()).join(' ')

    expect(convertEmojiText(allReactions)).toBe(allEmojis)
  })

  it('should handle repeated reactions', () => {
    const input = ':thumbsup: :thumbsup: :thumbsup:'
    const expected = '👍 👍 👍'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle reactions with surrounding punctuation', () => {
    const input = 'Great! :thumbsup: and :heart:!'
    const expected = 'Great! 👍 and ❤️!'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle reactions within parentheses', () => {
    const input = 'This is good (:thumbsup:) and bad (:thumbsdown:)'
    const expected = 'This is good (👍) and bad (👎)'

    expect(convertEmojiText(input)).toBe(expected)
  })

  it('should handle reactions within quotes', () => {
    const input = 'He said ":heart: this is amazing"'
    const expected = 'He said "❤️ this is amazing"'

    expect(convertEmojiText(input)).toBe(expected)
  })
})
