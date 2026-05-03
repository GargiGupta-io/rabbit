import { getMentionUrl } from './mentions'

const BASE_MOTION_URL = 'https://app.usemotion.com'

describe('getMentionUrl', () => {
  it('should return the correct URL for a task', () => {
    const result = getMentionUrl('123', 'task')

    const parsedUrl = new URL(result || '')

    expect(parsedUrl.searchParams.get('task')).toBe('123')
  })

  it('should return the correct URL for a project', () => {
    const result = getMentionUrl('456', 'project')

    const parsedUrl = new URL(result || '')

    expect(parsedUrl.searchParams.get('project')).toBe('456')
  })

  it('should return the correct URL for a note', () => {
    const result = getMentionUrl('789', 'note')

    expect(result).not.toBeNull()
    expect(result).toContain('789')
  })

  it('should return null for an unknown entity type', () => {
    const result = getMentionUrl('000', 'unknown')

    expect(result).toBeNull()
  })
})
