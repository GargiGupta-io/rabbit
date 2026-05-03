export const REACTION_EMOJI = [
  ':thumbsup:',
  ':thumbsdown:',
  ':smile:',
  ':frown:',
  ':heart:',
  ':rocket:',
  ':plus:',
  ':folded-hands:',
  ':eyes:',
] as const

export type Reaction = (typeof REACTION_EMOJI)[number]

// Whether or not the user has permission to change configuration values
export const keyIsReaction = (key: string): key is Reaction =>
  REACTION_EMOJI.includes(key as Reaction)

export const REACTION_EMOJI_MAP: Map<Reaction, string> = new Map(
  REACTION_EMOJI.map((emoji) => {
    switch (emoji) {
      case ':thumbsup:':
        return [emoji, '👍']
      case ':thumbsdown:':
        return [emoji, '👎']
      case ':smile:':
        return [emoji, '😄']
      case ':frown:':
        return [emoji, '😕']
      case ':heart:':
        return [emoji, '❤️']
      case ':rocket:':
        return [emoji, '🚀']
      case ':plus:':
        return [emoji, '➕']
      case ':folded-hands:':
        return [emoji, '🙏']
      case ':eyes:':
        return [emoji, '👀']
    }
  })
)
