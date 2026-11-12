import { Link } from 'react-router'
import { ArrowRightIcon, BoxIcon, TruckIcon, UserIcon } from '../../components/icons'
import StatusTimeline from '../../components/shop/StatusTimeline'
import { useAccount } from '../../shop/account'
import { formatDate, formatPrice } from '../../shop/format'
import { ordersFor } from '../../shop/orders'

// Tableau de bord: a greeting, the latest order's progress and shortcuts.
export default function Dashboard() {
  const { user } = useAccount()
  const latest = ordersFor(user!.email)[0]

  return (
    <div className="dash">
      <p className="dash__hello">
        Bonjour <strong>{user!.displayName}</strong>. D'ici, suivez vos commandes, gérez vos adresses et modifiez votre mot de passe.
      </p>

      {latest ? (
        <section className="panel dash__latest" aria-labelledby="latest-title">
          <div className="dash__latest-head">
            <h2 className="panel__title" id="latest-title">
              Dernière commande, n° {latest.id}
            </h2>
            <p className="dash__meta">
              {formatDate(latest.date)} · {formatPrice(latest.totals.total)}
            </p>
          </div>
          <StatusTimeline status={latest.status} />
          <Link className="btn-ghost" to={`/mon-compte/commandes/${latest.id}`}>
            Voir la commande
          </Link>
        </section>
      ) : (
        <section className="panel dash__latest">
          <h2 className="panel__title">Pas encore de commande</h2>
          <Link className="btn-chip" to="/boutique">
            Découvrir nos produits
            <ArrowRightIcon />
          </Link>
        </section>
      )}

      <ul className="dash__links">
        <li>
          <Link className="dash__card" to="/mon-compte/commandes">
            <span className="dash__icon" aria-hidden="true">
              <BoxIcon />
            </span>
            <span className="dash__card-title">Commandes</span>
            <span className="dash__card-text">Historique et factures</span>
          </Link>
        </li>
        <li>
          <Link className="dash__card" to="/mon-compte/adresses">
            <span className="dash__icon" aria-hidden="true">
              <TruckIcon />
            </span>
            <span className="dash__card-title">Adresses</span>
            <span className="dash__card-text">Livraison et facturation</span>
          </Link>
        </li>
        <li>
          <Link className="dash__card" to="/mon-compte/details">
            <span className="dash__icon" aria-hidden="true">
              <UserIcon />
            </span>
            <span className="dash__card-title">Détails du compte</span>
            <span className="dash__card-text">Nom, e-mail, mot de passe</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
