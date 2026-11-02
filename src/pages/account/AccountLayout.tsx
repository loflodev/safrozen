import { useAccount } from '../../shop/account'
import Login from './Login'

// /mon-compte: the login forms when signed out, the account area when in.
export default function AccountLayout() {
  const { user } = useAccount()
  if (!user) return <Login />
  return (
    <main className="page account">
      <h1 className="section__title">Bonjour {user.displayName}</h1>
    </main>
  )
}
