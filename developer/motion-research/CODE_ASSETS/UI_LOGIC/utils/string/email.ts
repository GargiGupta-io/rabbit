import { isEmailValid } from '@motion/utils/string'

const enterpriseEmailRegex =
  /[^@]+@(?!gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|live\.com|icloud\.com|[^@]+\.edu|privaterelay\.apple\.com|proton\.me|protonmail\.com|googlemail\.com|mail\.)/i

export const isEnterpriseEmail = (email: string) => {
  return isEmailValid(email) && enterpriseEmailRegex.test(email)
}
