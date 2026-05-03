import * as v from 'valibot'

import { parse } from '../parse'

const identity = <T>(item: object | undefined): T => item as T

describe('parse', () => {
  beforeEach(() => vi.spyOn(console, 'debug').mockImplementation(() => {}))

  it('should parse', () => {
    const Schema = v.object({ field: v.string() })
    const actual = parse(Schema, JSON.stringify({ field: 'foo' }), identity)

    expect(actual).toEqual({ field: 'foo' })
  })

  it('should return undefined if value doesnt match schema', () => {
    const Schema = v.object({ field: v.string() })
    const actual = parse(Schema, JSON.stringify({ field: 3 }), identity)

    expect(actual).toBeUndefined()
  })
})
