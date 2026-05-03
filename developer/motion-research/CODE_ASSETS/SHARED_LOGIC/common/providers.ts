export const ProviderTypes = ['google', 'microsoft'] as const

export type ProviderType = (typeof ProviderTypes)[number]
