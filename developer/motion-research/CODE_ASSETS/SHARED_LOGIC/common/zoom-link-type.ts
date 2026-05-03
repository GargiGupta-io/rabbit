export const ZoomLinkTypes = ['auto', 'manual', 'personal'] as const
export type ZoomLinkType = (typeof ZoomLinkTypes)[number]
