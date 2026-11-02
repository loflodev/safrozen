import { Link, useParams } from 'react-router'
import OrderDetails from '../../components/shop/OrderDetails'
import { useAccount } from '../../shop/account'
import { useCart } from '../../shop/cart'
import { findOrder } from '../../shop/orders'

// One order from the account (WooCommerce's view-order), with "order again".
export default function OrderView() {
  const { id = '' } = useParams()
  const { user } = useAccount()
  const cart = useCart()
  const order = findOrder(id)

  if (!order || order.email.toLowerCase() !== user!.email.toLowerCase())
    return (
      <div className="panel">
        <h2 className="panel__title">Commande introuvable</h2>
        <Link className="link" to="/mon-compte/commandes">
          Retour à mes commandes
        </Link>
      </div>
    )

  return (
    <div className="order-view">
      <OrderDetails order={order} />
      <div className="order-view__actions">
        <button
          type="button"
          className="btn-chip"
          onClick={() => {
            for (const l of order.lines) cart.add(l.id, l.quantity)
            cart.setDrawerOpen(true)
          }}
        >
          Commander à nouveau
        </button>
        <Link className="btn-ghost" to="/mon-compte/commandes">
          Toutes mes commandes
        </Link>
      </div>
    </div>
  )
}
