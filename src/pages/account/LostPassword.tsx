import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon } from '../../components/icons'
import Field from '../../components/shop/Field'
import PageHeader from '../../components/shop/PageHeader'
import { email, useForm } from '../../shop/form'
import './Account.css'

// Mot de passe perdu: ask for the e-mail, always confirm the same way (never
// reveal whether an account exists). TODO: no e-mail is sent in the mock.
export default function LostPassword() {
  const form = useForm({ lost_email: '' }, { lost_email: email })
  const [sent, setSent] = useState(false)

  return (
    <main id="main" className="page account">
      <PageHeader
        crumbs={[{ to: '/mon-compte', label: 'Mon compte' }, { label: 'Mot de passe oublié' }]}
        title="Mot de passe oublié"
        lede="Saisissez votre adresse e-mail : nous vous envoyons un lien pour en choisir un nouveau."
      />
      <div className="auth auth--single">
        {sent ? (
          <div className="panel auth__panel" role="status">
            <h2 className="panel__title">Vérifiez vos e-mails</h2>
            <p className="auth__lede">
              Si un compte existe pour {form.values.lost_email}, un lien de réinitialisation vient de partir. Il est valable une heure.
            </p>
            {/* TODO: demo shortcut to the reset form until e-mails are sent. */}
            <Link className="btn-chip" to="/mon-compte/reinitialiser">
              Ouvrir le lien (démo)
              <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <form
            className="panel auth__panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!form.validate().length) setSent(true)
            }}
          >
            <Field label="Adresse e-mail" type="email" autoComplete="email" inputMode="email" {...form.field('lost_email')} />
            <button type="submit" className="btn-chip">
              Envoyer le lien
              <ArrowRightIcon />
            </button>
            <Link className="link auth__lost" to="/mon-compte">
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}
