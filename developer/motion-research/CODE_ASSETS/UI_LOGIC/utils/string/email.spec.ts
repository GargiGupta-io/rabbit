import { isEnterpriseEmail } from './email'

describe('isEnterpriseEmail returns correctly', () => {
  it.each([
    ['goodemail@company.com', true],
    ['goodemail@education.com', true],
    ['bademail@gmail.com', false],
    ['what space@company.com', false],
    ['bademail@yahoo.com', false],
    ['@company.com', false],
    ['test@icloud.com', false],
    ['test@live.com', false],
    ['test@school.edu', false],
    ['test@privaterelay.apple.com', false],
    ['test@proton.me', false],
    ['test@protonmail.com', false],
    ['test@mail.', false],
    ['test@mail.net', false],
    ['', false],
  ])('%s returns %s', (email, expected) => {
    expect(isEnterpriseEmail(email)).toEqual(expected)
  })
})
