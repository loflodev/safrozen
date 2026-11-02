import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AccountContext, DEMO_EMAIL, MIN_PASSWORD, type Account, type User } from './account'
import { DEMO_ACCOUNT_ADDRESS } from './orders'
import { load, save } from './storage'

const KEY = 'legim:user'

const newUser = (email: string): User =>
  email.toLowerCase() === DEMO_EMAIL
    ? {
        firstName: 'Nadège',
        lastName: 'Pierre',
        displayName: 'Nadège',
        email: DEMO_EMAIL,
        billing: DEMO_ACCOUNT_ADDRESS,
        shipping: DEMO_ACCOUNT_ADDRESS,
      }
    : { firstName: '', lastName: '', displayName: email.split('@')[0], email, billing: null, shipping: null }

export default function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load<User | null>(KEY, null))

  useEffect(() => save(KEY, user), [user])

  const account = useMemo<Account>(
    () => ({
      user,
      login: (email, password) => {
        if (password.length < MIN_PASSWORD) return false
        setUser(newUser(email.trim()))
        return true
      },
      register: (email, password) => {
        if (password.length < MIN_PASSWORD) return false
        setUser(newUser(email.trim()))
        return true
      },
      logout: () => setUser(null),
      update: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
    }),
    [user],
  )

  return <AccountContext value={account}>{children}</AccountContext>
}
