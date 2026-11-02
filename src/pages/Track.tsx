import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRightIcon } from '../components/icons'
import ErrorSummary from '../components/shop/ErrorSummary'
import Field from '../components/shop/Field'
import OrderDetails from '../components/shop/OrderDetails'
import PageHeader from '../components/shop/PageHeader'
import { email, required, useForm } from '../shop/form'
import { trackOrder, type Order } from '../shop/orders'
import './Track.css'

// Suivi de commande (WooCommerce's order-tracking form): order number + the
// e-mail used to order. Links from the confirmation prefill both (?commande=&email=).
export default function Track() {
  const [params, setParams] = useSearchParams()
  const initialId = params.get('commande') ?? ''
  const initialEmail = params.get('email') ?? ''
  const form = useForm(
    { order_id: initialId, order_email: initialEmail },
    { order_id: required('Saisissez le numéro de commande, par exemple 1041.'), order_email: email },
  )
  // Arriving with both filled in (from the confirmation) shows the order at once.
  const [order, setOrder] = useState<Order | null | undefined>(() =>
    initialId && initialEmail ? (trackOrder(initialId, initialEmail) ?? null) : undefined,
  )
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [attempt, setAttempt] = useState(0)

  return (
    <main className="page track">
      <PageHeader
        crumbs={[{ label: 'Suivi de commande' }]}
        title="Suivre ma commande"
        lede="Saisissez le numéro de commande reçu par e-mail et l'adresse utilisée pour commander."
      />

      <form
        className="panel track__form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const errors = form.validate()
          setSummary(errors)
          setAttempt((n) => n + 1)
          if (errors.length) return
          const found = trackOrder(form.values.order_id, form.values.order_email)
          setOrder(found ?? null)
          if (found) setParams({ commande: found.id }, { replace: true, preventScrollReset: true })
        }}
      >
        <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={attempt} />
        <div className="track__fields">
          <Field label="Numéro de commande" inputMode="numeric" autoComplete="off" help="Par exemple 1041" {...form.field('order_id')} />
          <Field label="Adresse e-mail" type="email" inputMode="email" autoComplete="email" {...form.field('order_email')} />
          <button type="submit" className="btn-chip track__submit">
            Suivre
            <ArrowRightIcon />
          </button>
        </div>
      </form>

      <div aria-live="polite" className="track__result">
        {order === null && (
          <p className="notice notice--error">
            <strong>Aucune commande ne correspond.</strong> Vérifiez le numéro (sans le #) et l'adresse e-mail utilisée pour commander.
          </p>
        )}
        {order && (
          <>
            <h2 className="visually-hidden">Commande n° {order.id}</h2>
            <OrderDetails order={order} />
          </>
        )}
      </div>
    </main>
  )
}
