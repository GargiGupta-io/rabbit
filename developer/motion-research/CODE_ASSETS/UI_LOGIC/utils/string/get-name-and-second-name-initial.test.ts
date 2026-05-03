import { getNameAndSecondNameInitial } from './get-name-and-second-name-initial'

describe('getNameAndSecondNameInitial', () => {
  it('should return the initials of a name', () => {
    expect(getNameAndSecondNameInitial('John Doe')).toEqual('John D.')
  })

  it('should handle long or short names', () => {
    expect(getNameAndSecondNameInitial('John Doe Junior')).toEqual('John D.')
    expect(getNameAndSecondNameInitial('John')).toEqual('John')
  })

  it('should handle empty string', () => {
    expect(getNameAndSecondNameInitial('')).toEqual('')
  })
})
