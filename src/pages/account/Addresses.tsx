import { Link } from 'react-router'
import AddressBlock from '../../components/shop/AddressBlock'
import { useAccount } from '../../shop/account'

const TYPES = [
  { id: 'facturation', key: 'billing', label: 'Adresse de facturation' },
  { id: 'livraison', key: 'shipping', label: 'Adresse de livraison' },
] as const

// Adresses: billing and shipping cards, each with its edit link.
export default function Addresses() {
  const { user } = useAccount()
  return (
    <div className="addresses">
      <p className="dash__hello">Ces adresses sont proposées par défaut à la commande.</p>
      <div className="addresses__grid">
        {TYPES.map((t) => {
          const a = user![t.key]
          return (
            <section key={t.id} className="panel addresses__card" aria-labelledby={`addr-${t.id}`}>
              <h2 className="panel__title" id={`addr-${t.id}`}>
                {t.label}
              </h2>
              {a ? <AddressBlock address={a} /> : <p className="auth__lede">Vous n'avez pas encore enregistré cette adresse.</p>}
              <Link className="btn-ghost" to={`/mon-compte/adresses/${t.id}`}>
                {a ? 'Modifier' : 'Ajouter'}
                <span className="visually-hidden"> l'{t.label.toLowerCase()}</span>
              </Link>
            </section>
          )
        })}
      </div>
    </div>
  )
}
