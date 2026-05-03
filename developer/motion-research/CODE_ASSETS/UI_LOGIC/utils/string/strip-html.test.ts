import { stripHtml } from './strip-html'

describe('stripHtml', () => {
  it('should return an empty string for non-string inputs', () => {
    expect(stripHtml(null)).toBe('')
    expect(stripHtml(undefined)).toBe('')
    expect(stripHtml(123)).toBe('')
    expect(stripHtml([])).toBe('')
    expect(stripHtml({})).toBe('')
  })

  it('should return the same string if no HTML tags are present', () => {
    expect(stripHtml('Hello, world!')).toBe('Hello, world!')
  })

  it('should remove simple HTML tags', () => {
    expect(stripHtml('<p>Hello, world!</p>')).toBe('Hello, world!')
  })

  it('should remove nested HTML tags', () => {
    expect(stripHtml('<div><p>Hello, <strong>world</strong>!</p></div>')).toBe(
      'Hello, world !'
    )
  })

  it('should handle self-closing tags', () => {
    expect(stripHtml('Line 1<br />Line 2')).toBe('Line 1 Line 2')
  })

  it('should preserve HTML entities', () => {
    expect(stripHtml('Copyright &copy; 2024')).toBe('Copyright &copy; 2024')
  })

  it('should preserve whitespace but shrink multiple spaces to a single space', () => {
    expect(stripHtml('<p>  Hello,   </p>  <p>world!  </p>')).toBe(
      'Hello, world!'
    )
  })

  it('should handle an empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('should handle spans within a p tag', () => {
    expect(
      stripHtml(
        ' <p>word <span data-flow-variable-id="flow_key_project_name" taskid="EHI1BizmRe4C8eeVoROSc">{{flow_key_project_name}}</span> end</p>'
      )
    ).toBe('word {{flow_key_project_name}} end')
  })
})
