import { BRACKET_WRAP_RE, escapeRegExp } from '../regex'

describe('BRACKET_WRAP_RE', () => {
  it('should match bracket-wrapped strings', () => {
    const input = 'Hello {{name}}! How are you {{time}}?'
    const matches = input.match(BRACKET_WRAP_RE)

    expect(matches).toEqual(['{{name}}', '{{time}}'])
  })

  it('should match bracket-wrapped strings with underscores', () => {
    const input = 'Hello {{ your_name }}! How are you {{ this_time }}?'
    const matches = input.match(BRACKET_WRAP_RE)

    expect(matches).toEqual(['{{ your_name }}', '{{ this_time }}'])
  })

  it('should match bracket-wrapped  strings with spaces', () => {
    const input = 'Hello {{ your name }}! How are you {{ this time }}?'
    const matches = input.match(BRACKET_WRAP_RE)

    expect(matches).toEqual(['{{ your name }}', '{{ this time }}'])
  })

  it('should not match non-bracket-wrapped strings', () => {
    const input = 'Hello, world!'
    const matches = input.match(BRACKET_WRAP_RE)

    expect(matches).toBeNull()
  })

  it('should not match single-wrapped strings', () => {
    const input = 'Hello {there}!'
    const matches = input.match(BRACKET_WRAP_RE)

    expect(matches).toBeNull()
  })
})

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    const specialChars = '.*+?^${}()|[]\\'
    const escaped = escapeRegExp(specialChars)

    expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\')
  })

  it('should not modify non-special characters', () => {
    const normalString =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const result = escapeRegExp(normalString)

    expect(result).toBe(normalString)
  })

  it('should make strings safe to use in RegExp constructor', () => {
    const userInput = 'user.input+with*special(chars)'
    const escaped = escapeRegExp(userInput)

    // This would throw if not properly escaped
    const regex = new RegExp(escaped)

    // The regex should now match the exact string, not interpret special chars
    expect(regex.test(userInput)).toBe(true)
    expect('user-input-with-special-chars').not.toMatch(regex)
  })

  it('should handle empty strings', () => {
    expect(escapeRegExp('')).toBe('')
  })

  it('should handle strings with mixed content', () => {
    const mixed =
      'Hello (world) with [brackets] and {curly} braces + other *stuff*'
    const escaped = escapeRegExp(mixed)

    expect(escaped).toBe(
      'Hello \\(world\\) with \\[brackets\\] and \\{curly\\} braces \\+ other \\*stuff\\*'
    )

    // Verify the escaped string works in a regex
    const regex = new RegExp(escaped)

    expect(regex.test(mixed)).toBe(true)
  })
})
