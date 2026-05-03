import fs from 'node:fs'
import path from 'node:path'

import { deserialize } from '../serialization'
import { toV2, toV3, toV4, toV5, toV6 } from '../versions'

describe('migrate-state', () => {
  it('should migrate v1 -> v2', () => {
    const state = loadJson('v1-with-workspaces')

    const actual = toV2(state)
    if (actual == null) {
      throw new Error('unexpected')
    }

    expect(actual.workspaces.filters.ids).toEqual(['QiPEi78DS-GvQERryWsv-'])
    expect(actual.tasks.filters.workspaces).not.toBeDefined()
  })

  it('should migrate from v2 -> v3', () => {
    const state = loadJson('v2-with-projects')
    const actual = toV3(state)
    if (actual == null) {
      throw new Error('unexpected')
    }

    expect(actual.projects.filters.ids).toEqual(['0Zv8Q5LuAmyHxdP5NQ7DQ'])
    expect(actual.projects.ordered).toEqual(['ids', 'labels'])
  })

  it('should migrate v3 -> v4', () => {
    const state = loadJson('v3-complete')
    const actual = toV4(state)

    expect(actual.projects.filters.ids).toEqual({
      inverse: false,
      operator: 'in',
      value: ['Bydd0qPA6nTRKSM-QOkZe'],
    })
    expect(actual.projects.filters.priorities).toEqual({
      inverse: false,
      operator: 'in',
      value: ['MEDIUM'],
    })
    expect(actual.tasks.filters.createdTime).toEqual({
      inverse: false,
      operator: 'range',
      value: {
        from: '2024-03-31T00:00:00.000-04:00',
        to: '2024-04-07T00:00:00.000-04:00',
      },
    })
    expect(actual.tasks.filters.updatedTime).toEqual({
      inverse: false,
      operator: 'equals',
      value: '2024-04-02',
    })
    expect(actual.tasks.filters.dueDate).toEqual({
      inverse: false,
      operator: 'gte',
      value: '2024-04-02T00:00:00.000-04:00',
    })
  })

  it('should migrate v4 -> v5', () => {
    const state = loadJson('v4')
    const actual = toV5(state)

    expect(actual.tasks.ordered).toEqual([
      'statusIds',
      'labelIds',
      'assigneeUserIds',
    ])
    expect(actual.tasks.filters.statusIds).toEqual({
      operator: 'in',
      value: [
        'dQQug3pfVk4GlNxJ9F9Kk',
        'JEIMPb6OLqAWdPr35LDOY',
        '0N1u81UQkoSk465Uho1rf',
        'beHvq9SlzHCRfkZA4UP3I',
        'IuLS2c9ZcwVfU2xOO55Or',
      ],
    })

    expect(actual.projects.ordered).toEqual(['statusIds', 'managerIds'])
  })

  it('should migrate v5 -> v6', () => {
    const state = loadJson('v5-complete')
    const actual = toV6(state)

    expect(actual.projects.filters.text).toEqual({})
    expect(actual.projects.filters.multiSelect).toEqual({})
    expect(actual.projects.filters.select).toEqual({})
    expect(actual.tasks.filters.text).toEqual({})
    expect(actual.tasks.filters.text).toEqual({})
    expect(actual.tasks.filters.text).toEqual({})
  })

  it('should deserialize to latest', () => {
    const state = load('v1-with-workspaces')
    const actual = deserialize(state)

    expect(actual).not.toBeNull()
  })
})

function load(name: string) {
  const fullPath = path.join(__dirname, 'json', `${name}.json`)
  const text = fs.readFileSync(fullPath, 'utf-8')
  return text
}
function loadJson(name: string) {
  return JSON.parse(load(name))
}
