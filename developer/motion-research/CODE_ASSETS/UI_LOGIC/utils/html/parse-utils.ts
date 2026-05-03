export const sanitizeTargetBlankLinks = (
  htmlString: string | null
): string | null => {
  return htmlString?.replace(/href/g, "target='_blank' href") ?? null
}
