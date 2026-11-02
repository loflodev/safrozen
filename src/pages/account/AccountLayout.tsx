import { NavLink, Outlet, useMatches } from 'react-router'
import PageHeader from '../../components/shop/PageHeader'
import { useAccount } from '../../shop/account'
import Login from './Login'
import './Account.css'

const NAV = [
  { to: '/mon-compte', label: 'Tableau de bord', end: true },
  { to: '/mon-compte/commandes', label: 'Commandes' },
  { to: '/mon-compte/adresses', label: 'Adresses' },
  { to: '/mon-compte/details', label: 'Détails du compte' },
  { to: '/mon-compte/deconnexion', label: 'Déconnexion' },
]

// /mon-compte/*: the login forms when signed out (like WooCommerce, any
// account URL asks to sign in first), else the side nav and the section.
export default function AccountLayout() {
  const { user } = useAccount()
  const matches = useMatches()
  if (!user) return <Login />

  const title = (matches.at(-1)?.handle as { title?: string } | undefined)?.title
  return (
    <main className="page account">
      <PageHeader
        crumbs={title ? [{ to: '/mon-compte', label: 'Mon compte' }, { label: title }] : [{ label: 'Mon compte' }]}
        title={title ?? 'Mon compte'}
      />
      <div className="account__layout">
        <nav className="account__nav" aria-label="Mon compte">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink className="account__link" to={n.to} end={n.end}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="account__content">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
