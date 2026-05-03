import { getDateFromEmailReceivedHeader } from '../date'

describe('getDateFromEmailReceivedHeader', () => {
  it('returns null for undefined', () => {
    expect(getDateFromEmailReceivedHeader(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getDateFromEmailReceivedHeader('')).toBeNull()
  })

  it('parses date with numeric offset after semicolon', () => {
    const header =
      'from mail.example.com by mx.example.net with ESMTPS id abc123; Tue, 11 Jun 2024 15:42:12 -0700'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2024-06-11T22:42:12.000Z')
  })

  it('parses date with numeric offset and comment', () => {
    const header =
      'from mail.example.com by mx.example.net; Tue, 11 Jun 2024 15:42:12 -0700 (PDT)'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2024-06-11T22:42:12.000Z')
  })

  it('parses date with GMT token', () => {
    const header =
      'from mail.example.com by mx.example.net; Tue, 11 Jun 2024 22:42:12 GMT'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2024-06-11T22:42:12.000Z')
  })

  it('parses date with Z token', () => {
    const header =
      'from mail.example.com by mx.example.net; Tue, 11 Jun 2024 22:42:12 Z'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2024-06-11T22:42:12.000Z')
  })

  it('parses whole string if there is no semicolon', () => {
    const header = 'Tue, 11 Jun 2024 15:42:12 -0700'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2024-06-11T22:42:12.000Z')
  })

  it('handles folded whitespace and extra spaces', () => {
    const header =
      'from x\n  by y \n  with esmtps;\n   Tue,   11   Jun  2024   15:42:12    -0700   (PDT)'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2024-06-11T22:42:12.000Z')
  })

  it('returns null for invalid date portion', () => {
    const header = 'from x by y; not a date'

    expect(getDateFromEmailReceivedHeader(header)).toBeNull()
  })

  it('handles real gmail received header', () => {
    const header =
      'from mail-sor-f41.google.com (mail-sor-f41.google.com. [209.85.220.41])        by mx.google.com with SMTPS id a640c23a62f3a-afca76aa411sor10048866b.5.2025.08.12.15.55.17        for <motion.phil.dev.1@gmail.com>        (Google Transport Security);        Tue, 12 Aug 2025 15:55:17 -0700 (PDT)'
    const d = getDateFromEmailReceivedHeader(header)

    expect(d?.toISOString()).toBe('2025-08-12T22:55:17.000Z')
  })
})
