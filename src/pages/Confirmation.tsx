import { Link, useLocation, useParams } from 'react-router'
import { ArrowRightIcon, CheckIcon } from '../components/icons'
import OrderDetails from '../components/shop/OrderDetails'
import PageHeader from '../components/shop/PageHeader'
import { useAccount } from '../shop/account'
import { findOrder } from '../shop/orders'
import './Confirmation.css'

// Commande reçue (WooCommerce's order-received page). Shown to whoever just
// placed it (router state) or its account owner; anyone else is sent to tracking.
export default function Confirmation() {
  const { id = '' } = useParams()
  const { state } = useLocation() as { state: { email?: string } | null }
  const { user } = useAccount()
  const order = findOrder(id)
  const allowed = order && (state?.email === order.email || user?.email.toLowerCase() === order.email.toLowerCase())

  if (!order || !allowed) {
    return (
      <main className="page">
        <PageHeader title="Commande introuvable" lede="Pour retrouver une commande, utilisez son numéro et votre adresse e-mail." />
        <Link className="btn-chip" to={`/suivi${order ? `?commande=${order.id}` : ''}`}>
          Suivre une commande
          <ArrowRightIcon />
        </Link>
      </main>
    )
  }

  const firstName = order.billing.firstName
  return (
    <main className="page confirmation">
      <PageHeader
        title={`Merci, ${firstName} !`}
        lede={
          <>
            Votre commande n° {order.id} est confirmée. Un e-mail de confirmation part à <strong>{order.email}</strong>.
          </>
        }
      />

      <p className="notice notice--success confirmation__notice" role="status">
        <span className="confirmation__check" aria-hidden="true">
          <CheckIcon />
        </span>
        Commande reçue. Nous la préparons au froid.
      </p>

      <OrderDetails order={order} />

      <div className="confirmation__actions">
        <Link className="btn-chip" to={`/suivi?commande=${order.id}&email=${encodeURIComponent(order.email)}`}>
          Suivre ma commande
          <ArrowRightIcon />
        </Link>
        <Link className="btn-ghost" to="/boutique">
          Continuer mes achats
        </Link>
      </div>

      {!user && (
        <section className="panel confirmation__account" aria-labelledby="account-cta">
          <h2 className="panel__title" id="account-cta">
            Gagnez du temps la prochaine fois
          </h2>
          <p>Créez un compte avec {order.email} pour retrouver vos adresses et suivre toutes vos commandes.</p>
          <Link className="btn-ghost" to="/mon-compte" state={{ register: order.email }}>
            Créer mon compte
          </Link>
        </section>
      )}
    </main>
  )
}
