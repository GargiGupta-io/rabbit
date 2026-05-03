const NONE_ID_SUFFIX = '|<none>'

export function createNoneId(id: string = 'none') {
  return `${id}${NONE_ID_SUFFIX}`
}

export function isNoneId(id: string) {
  return id.endsWith(NONE_ID_SUFFIX)
}

export function getIdFromNoneId(id: string) {
  return id.replace(NONE_ID_SUFFIX, '')
}

export function isObjectNoneId(obj: { id: string }) {
  return isNoneId(obj.id)
}
