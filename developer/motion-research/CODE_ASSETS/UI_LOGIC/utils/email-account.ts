import { type EmailAccount } from '@motion/rpc-types/legacy'

export function sortEmailAccounts(
  emailAccounts: EmailAccount[],
  mainEmailAccountId?: string
) {
  return emailAccounts.sort((a, b) => {
    // Main calendar email should be at the top
    if (a.id === mainEmailAccountId) return -1
    if (b.id === mainEmailAccountId) return 1
    return a.email.localeCompare(b.email)
  })
}

export const isPasswordValid = (password: string) => password.length >= 8
