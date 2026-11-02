import { DELIVERY, PAYMENT } from '../../shop/catalog'
import { formatDate, formatPrice } from '../../shop/format'
import type { Order } from '../../shop/orders'
import AddressBlock from './AddressBlock'
import OrderSummary from './OrderSummary'
import StatusTimeline from './StatusTimeline'
import './OrderDetails.css'

// One order in full (confirmation, account order view, tracking): key facts,
// progress, addresses and the summary.
export default function OrderDetails({ order, showTimeline = true }: { order: Order; showTimeline?: boolean }) {
  const delivery = DELIVERY.find((d) => d.id === order.delivery)
  const payment = PAYMENT.find((p) => p.id === order.payment)
  return (
    <div className="order">
      <dl className="order__facts">
        <div>
          <dt>Commande</dt>
          <dd>n° {order.id}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(order.date)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatPrice(order.totals.total)}</dd>
        </div>
        <div>
          <dt>Paiement</dt>
          <dd>{payment?.label}</dd>
        </div>
      </dl>

      {showTimeline && (
        <section className="panel order__progress" aria-labelledby={`progress-${order.id}`}>
          <h2 className="panel__title" id={`progress-${order.id}`}>
            {order.status === 'delivered' ? 'Livrée' : order.delivery === 'pickup' ? 'Prête à partir de' : 'Livraison prévue'}{' '}
            {order.status !== 'delivered' && formatDate(order.eta)}
          </h2>
          <StatusTimeline status={order.status} />
        </section>
      )}

      <div className="order__grid">
        <div className="order__addresses">
          <section className="panel">
            <h2 className="panel__title">{order.delivery === 'pickup' ? 'Cueillette' : 'Livraison'}</h2>
            {order.delivery === 'pickup' ? (
              <p className="order__text">{delivery?.detail}</p>
            ) : (
              <AddressBlock address={order.shipping} />
            )}
            <p className="order__method">{delivery?.label}</p>
            {order.note && <p className="order__note">Note : {order.note}</p>}
          </section>
          <section className="panel">
            <h2 className="panel__title">Facturation</h2>
            <AddressBlock address={order.billing} />
            <p className="order__method">{order.email}</p>
          </section>
        </div>
        <OrderSummary
          title="Articles"
          lines={order.lines}
          totals={order.totals}
          coupon={order.coupon}
          deliveryLabel={delivery?.label}
        />
      </div>
    </div>
  )
}
