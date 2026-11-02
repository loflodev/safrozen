import { useId, useState, type ReactNode } from 'react'
import type { CartTotals } from '../../shop/cart'
import { COUPONS } from '../../shop/catalog'
import { formatPrice } from '../../shop/format'
import './OrderSummary.css'

type Line = { id: string; name: string; price: number; quantity: number }

// Order summary panel (cart, checkout, confirmation, order view): lines,
// subtotal, coupon, delivery, total, then the page's action.
export default function OrderSummary({
  title = 'Récapitulatif',
  lines,
  totals,
  coupon,
  deliveryLabel,
  onApplyCoupon,
  onRemoveCoupon,
  children,
}: {
  title?: string
  lines?: Line[]
  totals: CartTotals
  coupon: string | null
  deliveryLabel?: string
  onApplyCoupon?: (code: string) => boolean
  onRemoveCoupon?: () => void
  children?: ReactNode
}) {
  return (
    <section className="summary panel" aria-labelledby="summary-title">
      <h2 className="panel__title" id="summary-title">
        {title}
      </h2>
      {lines && (
        <ul className="summary__lines">
          {lines.map((l) => (
            <li key={l.id}>
              <span>
                {l.name} <span className="summary__qty">× {l.quantity}</span>
              </span>
              <span>{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="summary__totals">
        <div>
          <dt>Sous-total</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        {coupon && (
          <div className="summary__discount">
            <dt>
              Code {coupon}
              {onRemoveCoupon && (
                <button type="button" className="summary__remove" onClick={onRemoveCoupon}>
                  Retirer
                </button>
              )}
            </dt>
            <dd>−{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div>
          <dt>{deliveryLabel ?? 'Livraison'}</dt>
          <dd>{deliveryLabel ? (totals.delivery ? formatPrice(totals.delivery) : 'Offerte') : 'Calculée à la commande'}</dd>
        </div>
        <div className="summary__total">
          <dt>Total</dt>
          <dd className="price">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {onApplyCoupon && !coupon && <CouponForm onApply={onApplyCoupon} />}
      {children && <div className="summary__action">{children}</div>}
    </section>
  )
}

function CouponForm({ onApply }: { onApply: (code: string) => boolean }) {
  const id = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  return (
    <form
      className="coupon"
      onSubmit={(e) => {
        e.preventDefault()
        if (!code.trim()) return setError('Saisissez un code promo.')
        setError(onApply(code) ? '' : "Ce code n'est pas valide.")
      }}
    >
      <label className="field__label" htmlFor={id}>
        Code promo
      </label>
      <div className="coupon__row">
        <input
          id={id}
          className="field__control"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-help`}
        />
        <button type="submit" className="btn-ghost">
          Appliquer
        </button>
      </div>
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        <p className="field__help" id={`${id}-help`}>
          {/* TODO: mock hint until real coupons exist. */}
          Essayez {Object.keys(COUPONS)[0]}.
        </p>
      )}
    </form>
  )
}
