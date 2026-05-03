import { bytesToGb, isFileTooLarge } from '../file-size'

describe('file-size', () => {
  test('file size okay', () => {
    expect(isFileTooLarge(8388608)).toBe(false)
  })

  test('file size too big', () => {
    expect(isFileTooLarge(53477376)).toBe(true)
  })

  test('bytes to gb', () => {
    expect(bytesToGb(3 * 1024 ** 3)).toBe(3)
  })
})
