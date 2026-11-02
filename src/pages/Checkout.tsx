import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowRightIcon } from '../components/icons'
import AddressBlock from '../components/shop/AddressBlock'
import AddressFields from '../components/shop/AddressFields'
import CheckoutSteps from '../components/shop/CheckoutSteps'
import ChoiceCard from '../components/shop/ChoiceCard'
import ErrorSummary from '../components/shop/ErrorSummary'
import Field from '../components/shop/Field'
import OrderSummary from '../components/shop/OrderSummary'
import PageHeader from '../components/shop/PageHeader'
import { useAccount } from '../shop/account'
import { addressNames, addressRules, addressValues, toAddress } from '../shop/address'
import { useCart } from '../shop/cart'
import { DELIVERY, PAYMENT } from '../shop/catalog'
import { email, phone, useForm, type Validator } from '../shop/form'
import { formatPrice, localDay } from '../shop/format'
import { placeOrder } from '../shop/orders'
import './Cart.css'
import './Checkout.css'

type Values = Record<string, string>

const PAY_DELAY_MS = 900 // mock payment round trip

// Commande (WooCommerce's checkout) in three steps on one page: contact and
// billing, delivery, payment. Each step validates before the next opens.
export default function Checkout() {
  const cart = useCart()
  const { user } = useAccount()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [attempt, setAttempt] = useState(0)
  const [paying, setPaying] = useState(false)
  const [placed, setPlaced] = useState(false)
  const stepRef = useRef<HTMLHeadingElement>(null)

  const rules = useMemo(
    () =>
      ({
        email: email,
        phone: phone,
        ...addressRules<Values>('billing'),
        ...addressRules<Values>('shipping'),
        terms: (v: string) => (v === 'oui' ? null : 'Acceptez les conditions générales de vente pour commander.'),
      }) as Record<string, Validator<Values>>,
    [],
  )

  const form = useForm<Values>(
    {
      email: user?.email ?? '',
      phone: user?.billing?.phone ?? '',
      ...addressValues('billing', user?.billing),
      ...addressValues('shipping', user?.shipping),
      delivery: 'standard',
      sameAddress: 'oui',
      note: '',
      payment: 'card',
      terms: '',
    },
    rules,
  )
  const v = form.values

  // Once the order is placed the cart is cleared; don't bounce to /panier then.
  if (!cart.items.length && !placed) return <Navigate to="/panier" replace />

  const totals = cart.totals(v.delivery)
  const method = DELIVERY.find((d) => d.id === v.delivery)!
  const needsShipping = v.delivery !== 'pickup' && v.sameAddress !== 'oui'

  const STEP_FIELDS = [
    ['email', 'phone', ...addressNames('billing')],
    needsShipping ? addressNames('shipping') : [],
    ['terms'],
  ]

  const goTo = (n: number) => {
    setStep(n)
    setSummary([])
    // Move focus to the new step's heading so keyboard and screen reader users follow.
    requestAnimationFrame(() => stepRef.current?.focus())
  }

  const submitStep = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = form.validate(STEP_FIELDS[step])
    setSummary(errors)
    setAttempt((n) => n + 1)
    if (errors.length) return
    if (step < 2) return goTo(step + 1)

    setPaying(true)
    window.setTimeout(() => {
      const billing = toAddress('billing', v, v.phone.trim())
      const order = placeOrder({
        email: v.email.trim(),
        lines: cart.items.map(({ id, quantity, product }) => ({ id, name: product.name, price: product.price, quantity })),
        totals,
        coupon: cart.coupon,
        billing,
        shipping: v.delivery === 'pickup' ? billing : needsShipping ? toAddress('shipping', v) : billing,
        delivery: v.delivery,
        payment: v.payment,
        note: v.note.trim() || undefined,
        eta: localDay(v.delivery === 'express' ? 1 : 3),
      })
      setPlaced(true)
      cart.clear()
      navigate(`/commande/recue/${order.id}`, { state: { email: order.email } })
    }, PAY_DELAY_MS)
  }

  const field = (name: string) => form.field(name)

  return (
    <main className="page checkout">
      <PageHeader crumbs={[{ to: '/panier', label: 'Panier' }, { label: 'Commande' }]} title="Commande" />

      <div className="checkout__layout">
        <div>
          <CheckoutSteps current={step} onGo={goTo} />

          {!user && step === 0 && (
            <p className="notice checkout__login">
              Déjà client ?{' '}
              <Link className="link" to="/mon-compte" state={{ from: '/commande' }}>
                Connectez-vous
              </Link>{' '}
              pour retrouver vos adresses. Sinon, commandez simplement en invité.
            </p>
          )}

          <form className="panel checkout__step" onSubmit={submitStep} noValidate>
            {/* Fixed fields drop out of the summary as they are corrected. */}
            <ErrorSummary errors={summary.filter((e) => form.errors[e.id])} attempt={attempt} />

            {step === 0 && (
              <>
                <h2 className="panel__title" tabIndex={-1} ref={stepRef}>
                  Vos coordonnées
                </h2>
                <div className="form-grid form-grid--2 checkout__group">
                  <Field label="Adresse e-mail" type="email" autoComplete="email" inputMode="email" help="Pour la confirmation et le suivi de la commande." {...field('email')} />
                  <Field label="Téléphone" type="tel" autoComplete="tel" inputMode="tel" help="Le livreur vous appelle à l'arrivée." {...field('phone')} />
                </div>
                <h3 className="checkout__subhead">Adresse de facturation</h3>
                <AddressFields prefix="billing" section="billing" field={field} />
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="panel__title" tabIndex={-1} ref={stepRef}>
                  Livraison
                </h2>
                <fieldset className="checkout__choices">
                  <legend className="checkout__subhead">Mode de livraison</legend>
                  {DELIVERY.map((d) => {
                    const free = d.price === 0 || (d.freeFrom !== undefined && totals.subtotal - totals.discount >= d.freeFrom)
                    return (
                      <ChoiceCard
                        key={d.id}
                        name="delivery"
                        value={d.id}
                        checked={v.delivery === d.id}
                        onChange={(id) => form.set({ delivery: id })}
                        label={d.label}
                        detail={d.freeFrom && !free ? `${d.detail}. Offerte dès ${formatPrice(d.freeFrom)}.` : d.detail}
                        aside={free ? 'Offerte' : formatPrice(d.price)}
                      />
                    )
                  })}
                </fieldset>

                {v.delivery !== 'pickup' && (
                  <>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={v.sameAddress === 'oui'}
                        onChange={(e) => form.set({ sameAddress: e.target.checked ? 'oui' : '' })}
                      />
                      Livrer à mon adresse de facturation
                    </label>
                    {v.sameAddress === 'oui' ? (
                      <div className="checkout__address">
                        <AddressBlock address={toAddress('billing', v)} />
                      </div>
                    ) : (
                      <>
                        <h3 className="checkout__subhead">Adresse de livraison</h3>
                        <AddressFields prefix="shipping" section="shipping" field={field} />
                      </>
                    )}
                  </>
                )}

                <div className="checkout__group">
                  <Field
                    as="textarea"
                    label="Note pour la livraison"
                    optional
                    help="Code de porte, étage, voisin à qui laisser le colis…"
                    rows={3}
                    {...field('note')}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="panel__title" tabIndex={-1} ref={stepRef}>
                  Paiement
                </h2>
                <fieldset className="checkout__choices">
                  <legend className="checkout__subhead">Moyen de paiement</legend>
                  {PAYMENT.map((p) => (
                    <ChoiceCard
                      key={p.id}
                      name="payment"
                      value={p.id}
                      checked={v.payment === p.id}
                      onChange={(id) => form.set({ payment: id })}
                      label={p.label}
                      detail={p.detail}
                    />
                  ))}
                </fieldset>
                {/* TODO: mock; the real payment happens on the provider's page. */}
                <p className="field__help checkout__secure">
                  {v.payment === 'card'
                    ? 'Vous saisirez votre carte sur la page sécurisée de notre prestataire de paiement.'
                    : 'Aucun paiement n’est demandé maintenant.'}{' '}
                  Démonstration : aucun paiement réel n'est effectué.
                </p>
                <div className="field">
                  <label className="check">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={v.terms === 'oui'}
                      onChange={(e) => {
                        form.set({ terms: e.target.checked ? 'oui' : '' })
                        if (e.target.checked) form.setErrors((er) => ({ ...er, terms: undefined }))
                      }}
                      aria-invalid={form.errors.terms ? true : undefined}
                      aria-describedby={form.errors.terms ? 'terms-error' : undefined}
                    />
                    <span>
                      J'accepte les{' '}
                      <Link className="link" to="/cgv" target="_blank">
                        conditions générales de vente
                      </Link>
                      .
                    </span>
                  </label>
                  {form.errors.terms && (
                    <p className="field__error" id="terms-error">
                      {form.errors.terms}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="checkout__actions">
              {step > 0 && (
                <button type="button" className="btn-ghost" onClick={() => goTo(step - 1)} disabled={paying}>
                  Retour
                </button>
              )}
              <button type="submit" className="btn-chip" aria-disabled={paying || undefined} disabled={paying}>
                {step < 2 ? (
                  <>
                    Continuer
                    <ArrowRightIcon />
                  </>
                ) : paying ? (
                  'Paiement en cours…'
                ) : (
                  <>
                    Payer {formatPrice(totals.total)}
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </div>
            <p className="visually-hidden" aria-live="polite">
              {paying ? 'Paiement en cours, veuillez patienter.' : ''}
            </p>
          </form>
        </div>

        <div className="checkout__aside">
          <OrderSummary
            lines={cart.items.map(({ id, quantity, product }) => ({ id, name: product.name, price: product.price, quantity }))}
            totals={totals}
            coupon={cart.coupon}
            deliveryLabel={step > 0 ? method.label : undefined}
            onApplyCoupon={cart.applyCoupon}
            onRemoveCoupon={cart.removeCoupon}
          >
            <Link className="link checkout__edit" to="/panier">
              Modifier le panier
            </Link>
          </OrderSummary>
        </div>
      </div>
    </main>
  )
}
