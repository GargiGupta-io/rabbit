import { extractUrlComponents } from '../url-validation'

describe('url-validation', () => {
  it('should extract components', () => {
    const urlComponents = extractUrlComponents(
      'https://www.google.com/search?q=useMotion'
    )

    expect(urlComponents?.scheme).toEqual('https')
    expect(urlComponents?.authority).toEqual('www.google.com')
    expect(urlComponents?.path).toEqual('/search')
    expect(urlComponents?.query).toEqual('q=useMotion')
  })
})
