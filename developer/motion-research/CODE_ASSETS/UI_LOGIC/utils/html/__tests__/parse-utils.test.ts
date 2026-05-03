import { sanitizeTargetBlankLinks } from '../parse-utils'

describe('sanitizeTargetBlankLinks', () => {
  it('should add target blank to links in html', () => {
    const html =
      "<div>My content with <a href='http://www.google.com'>link</a></div>"
    const expected =
      "<div>My content with <a target='_blank' href='http://www.google.com'>link</a></div>"
    const sanitized = sanitizeTargetBlankLinks(html)

    expect(sanitized).toEqual(expected)
  })

  it('when given null returns null', () => {
    expect(sanitizeTargetBlankLinks(null)).toEqual(null)
  })
})
