import { Link } from 'react-router'
import { ArrowRightIcon } from '../../components/icons'
import EmptyState from '../../components/shop/EmptyState'
import { useAccount } from '../../shop/account'
import { formatDate, formatPrice, plural } from '../../shop/format'
import { ordersFor, STATUS_STEPS } from '../../shop/orders'

// Commandes: a table from 700px, stacked cards below (same markup).
export default function Orders() {
  const { user } = useAccount()
  const orders = ordersFor(user!.email)

  if (!orders.length)
    return (
      <EmptyState
        title="Aucune commande pour l'instant"
        action={
          <Link className="btn-chip" to="/boutique">
            Découvrir nos produits
            <ArrowRightIcon />
          </Link>
        }
      />
    )

  return (
    <div className="panel orders">
      <table className="orders__table">
        <caption className="visually-hidden">Vos commandes</caption>
        <thead>
          <tr>
            <th scope="col">Commande</th>
            <th scope="col">Date</th>
            <th scope="col">État</th>
            <th scope="col">Total</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <th scope="row" data-label="Commande">
                n° {o.id}
              </th>
              <td data-label="Date">{formatDate(o.date)}</td>
              <td data-label="État">
                <span className="status-pill" data-status={o.status}>
                  {STATUS_STEPS.find((s) => s.id === o.status)?.label}
                </span>
              </td>
              <td data-label="Total">
                {formatPrice(o.totals.total)} <span className="orders__count">pour {plural(o.totals.count, 'article')}</span>
              </td>
              <td>
                <Link className="btn-ghost orders__view" to={`/mon-compte/commandes/${o.id}`}>
                  Voir<span className="visually-hidden"> la commande n° {o.id}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
