// internal URI spitter method - direct from RFC 3986
function splitUriComponents(uri: string) {
  return uri.match(
    /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/
  )
}

export function extractUrlComponents(url: string) {
  const splitted = splitUriComponents(url)

  if (splitted == null) return null

  return {
    scheme: splitted[1],
    authority: splitted[2],
    path: splitted[3],
    query: splitted[4],
    fragment: splitted[5],
  }
}
