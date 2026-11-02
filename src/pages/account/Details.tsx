import { useState } from 'react'
import ErrorSummary from '../../components/shop/ErrorSummary'
import Field from '../../components/shop/Field'
import { MIN_PASSWORD, useAccount } from '../../shop/account'
import { email, required, useForm } from '../../shop/form'

type Values = Record<string, string>

// Détails du compte: names, display name, e-mail, and an optional password
// change (current + new + confirm), like WooCommerce's edit-account form.
export default function Details() {
  const { user, update } = useAccount()
  const form = useForm<Values>(
    {
      firstName: user!.firstName,
      lastName: user!.lastName,
      displayName: user!.displayName,
      account_email: user!.email,
      current_password: '',
      new_password: '',
      confirm_new: '',
    },
    {
      firstName: required('Saisissez votre prénom.'),
      lastName: required('Saisissez votre nom.'),
      displayName: required('Saisissez un nom affiché.'),
      account_email: email,
      current_password: (v, all) => (all.new_password && !v ? 'Saisissez votre mot de passe actuel pour le changer.' : null),
      new_password: (v) => (v && v.length < MIN_PASSWORD ? `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.` : null),
      confirm_new: (v, all) => (all.new_password && v !== all.new_password ? 'Les deux mots de passe ne correspondent pas.' : null),
    },
  )
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [attempt, setAttempt] = useState(0)
  const [saved, setSaved] = useState(false)

  return (
    <form
      className="panel account-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const errors = form.validate()
        setSummary(errors)
        setAttempt((n) => n + 1)
        setSaved(!errors.length)
        if (errors.length) return
        const v = form.values
        update({ firstName: v.firstName.trim(), lastName: v.lastName.trim(), displayName: v.displayName.trim(), email: v.account_email.trim() })
        form.set({ current_password: '', new_password: '', confirm_new: '' })
      }}
    >
      <ErrorSummary errors={summary.filter((s) => form.errors[s.id])} attempt={attempt} />
      <div role="status">{saved && <p className="notice notice--success">Vos informations sont enregistrées.</p>}</div>
      <div className="form-grid form-grid--2">
        <Field label="Prénom" autoComplete="given-name" {...form.field('firstName')} />
        <Field label="Nom" autoComplete="family-name" {...form.field('lastName')} />
        <Field label="Nom affiché" full autoComplete="nickname" help="C'est ainsi que nous vous saluons dans votre compte." {...form.field('displayName')} />
        <Field label="Adresse e-mail" full type="email" autoComplete="email" inputMode="email" {...form.field('account_email')} />
      </div>
      <fieldset className="account-form__fieldset">
        <legend className="form-subhead">Changer de mot de passe</legend>
        <p className="field__help">Laissez vide pour garder le mot de passe actuel.</p>
        <div className="form-grid">
          <Field label="Mot de passe actuel" type="password" autoComplete="current-password" optional {...form.field('current_password')} />
          <Field label="Nouveau mot de passe" type="password" autoComplete="new-password" optional help={`Au moins ${MIN_PASSWORD} caractères.`} {...form.field('new_password')} />
          <Field label="Confirmez le nouveau mot de passe" type="password" autoComplete="new-password" optional {...form.field('confirm_new')} />
        </div>
      </fieldset>
      <div className="account-form__actions">
        <button type="submit" className="btn-chip">
          Enregistrer
        </button>
      </div>
    </form>
  )
}
