export const PLACE_HOLDER_ID_POSTFIX = '|<placeholder>'

export function isPlaceholderId(id?: string) {
  return id == null || id.endsWith(PLACE_HOLDER_ID_POSTFIX)
}

export function createPlaceholderId(key: string | number) {
  return key + PLACE_HOLDER_ID_POSTFIX
}
