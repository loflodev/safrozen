import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon, TrashIcon } from '../components/icons'
import EmptyState from '../components/shop/EmptyState'
import OrderSummary from '../components/shop/OrderSummary'
import PageHeader from '../components/shop/PageHeader'
import ProductArt from '../components/shop/ProductArt'
import QuantityStepper from '../components/shop/QuantityStepper'
import { MAX_QTY, useCart } from '../shop/cart'
import { formatPrice, plural } from '../shop/format'
import './Cart.css'

// Panier (WooCommerce's cart): lines 7 / summary 5 from 900px. Removing a
// line can be undone; on phones the total and the CTA stay in a bottom bar.
export default function Cart() {
  const cart = useCart()
  const totals = cart.totals()
  const [removed, setRemoved] = useState<{ id: string; quantity: number; name: string } | null>(null)

  const remove = (id: string, quantity: number, name: string) => {
    cart.remove(id)
    setRemoved({ id, quantity, name })
  }

  const header = (
    <PageHeader
      crumbs={[{ label: 'Panier' }]}
      title="Votre panier"
      lede={totals.count ? `${plural(totals.count, 'article')}, prêts à partir au froid.` : undefined}
    />
  )

  if (!cart.items.length) {
    return (
      <main className="page cart">
        {header}
        <p className="visually-hidden" aria-live="polite">
          {removed ? `${removed.name} retiré du panier.` : ''}
        </p>
        <EmptyState
          title="Votre panier est vide"
          action={
            <div className="cart__empty-actions">
              {removed && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    cart.add(removed.id, removed.quantity)
                    setRemoved(null)
                  }}
                >
                  Annuler le retrait
                </button>
              )}
              <Link className="btn-chip" to="/boutique">
                Voir la boutique
                <ArrowRightIcon />
              </Link>
            </div>
          }
        >
          <p>Nos legims sont prêts en 20 minutes. Commencez par le lalo, notre plus demandé.</p>
        </EmptyState>
      </main>
    )
  }

  return (
    <main className="page cart">
      {header}
      <div className="cart__layout">
        <section className="panel cart__lines" aria-labelledby="cart-lines-title">
          <h2 className="visually-hidden" id="cart-lines-title">
            Articles
          </h2>
          <div aria-live="polite">
            {removed && (
              <p className="notice cart__undo">
                <span>{removed.name} retiré du panier.</span>
                <button
                  type="button"
                  className="link cart__undo-btn"
                  onClick={() => {
                    cart.add(removed.id, removed.quantity)
                    setRemoved(null)
                  }}
                >
                  Annuler
                </button>
              </p>
            )}
          </div>
          <ul>
            {cart.items.map(({ id, quantity, product }) => (
              <li key={id} className="cart__line">
                <ProductArt item={product} className="cart__art" />
                <div className="cart__info">
                  <Link className="cart__name" to={`/produit/${product.slug}`}>
                    {product.name}
                  </Link>
                  <p className="cart__meta">
                    {product.weight} · {formatPrice(product.price)} l'unité
                  </p>
                  <div className="cart__controls">
                    <QuantityStepper
                      id={`qty-${id}`}
                      label={product.name}
                      value={quantity}
                      max={Math.min(MAX_QTY, product.stock)}
                      onChange={(n) => cart.setQuantity(id, n)}
                    />
                    <button type="button" className="cart__remove" onClick={() => remove(id, quantity, product.name)}>
                      <TrashIcon />
                      Retirer<span className="visually-hidden"> {product.name}</span>
                    </button>
                  </div>
                </div>
                <p className="cart__total">{formatPrice(product.price * quantity)}</p>
              </li>
            ))}
          </ul>
          <Link className="link cart__continue" to="/boutique">
            Continuer mes achats
          </Link>
        </section>

        <div className="cart__aside">
          <OrderSummary
            totals={totals}
            coupon={cart.coupon}
            onApplyCoupon={cart.applyCoupon}
            onRemoveCoupon={cart.removeCoupon}
          >
            <Link className="btn-chip" to="/commande">
              Passer la commande
              <ArrowRightIcon />
            </Link>
            <p className="field__help cart__reassure">Paiement sécurisé · Livraison offerte dès 60 $</p>
          </OrderSummary>
        </div>
      </div>

      <div className="checkout-bar">
        <span>
          <span className="checkout-bar__label">Total</span>
          <span className="price">{formatPrice(totals.total)}</span>
        </span>
        <Link className="btn-chip" to="/commande">
          Commander
        </Link>
      </div>
    </main>
  )
}
