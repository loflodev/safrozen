import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AddressFields from '../../components/shop/AddressFields'
import ErrorSummary from '../../components/shop/ErrorSummary'
import Field from '../../components/shop/Field'
import { useAccount } from '../../shop/account'
import { addressRules, addressValues, toAddress, type AddressPrefix } from '../../shop/address'
import { phone, useForm, type Validator } from '../../shop/form'

type Values = Record<string, string>

// Edit the billing (facturation) or shipping (livraison) address.
export default function AddressEdit() {
  const { type } = useParams()
  const prefix: AddressPrefix = type === 'livraison' ? 'shipping' : 'billing'
  const { user, update } = useAccount()
  const navigate = useNavigate()
  const current = user![prefix]
  const rules = useMemo(
    () => ({ ...addressRules<Values>(prefix), ...(prefix === 'billing' ? { phone } : {}) }) as Record<string, Validator<Values>>,
    [prefix],
  )
  const form = useForm<Values>({ ...addressValues(prefix, current), phone: current?.phone ?? '' }, rules)
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [attempt, setAttempt] = useState(0)

  return (
    <form
      className="panel account-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const errors = form.validate()
        setSummary(errors)
        setAttempt((n) => n + 1)
        if (errors.length) return
        update({ [prefix]: toAddress(prefix, form.values, form.values.phone.trim() || undefined) })
        navigate('/mon-compte/adresses', { state: { saved: true } })
      }}
    >
      <h2 className="panel__title">{prefix === 'billing' ? 'Adresse de facturation' : 'Adresse de livraison'}</h2>
      <ErrorSummary errors={summary.filter((s) => form.errors[s.id])} attempt={attempt} />
      <AddressFields prefix={prefix} section={prefix} field={(n) => form.field(n)} />
      {prefix === 'billing' && (
        <div className="form-grid form-grid--2">
          <Field label="Téléphone" type="tel" autoComplete="tel" inputMode="tel" {...form.field('phone')} />
        </div>
      )}
      <div className="account-form__actions">
        <button type="submit" className="btn-chip">
          Enregistrer l'adresse
        </button>
        <Link className="btn-ghost" to="/mon-compte/adresses">
          Annuler
        </Link>
      </div>
    </form>
  )
}
