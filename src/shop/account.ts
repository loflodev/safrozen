import { createContext, useContext } from 'react'
import type { Address } from './orders'

// TODO: mock accounts until WordPress users exist. Passwords are not checked
// beyond length; nothing leaves the browser.
export type User = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  billing: Address | null
  shipping: Address | null
}

export type Account = {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (email: string, password: string) => boolean
  logout: () => void
  update: (patch: Partial<User>) => void
}

export const MIN_PASSWORD = 8
export const DEMO_EMAIL = 'demo@safrozen.com'

export const AccountContext = createContext<Account | null>(null)

export function useAccount() {
  const account = useContext(AccountContext)
  if (!account) throw new Error('useAccount outside AccountProvider')
  return account
}
