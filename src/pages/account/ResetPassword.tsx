import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon } from '../../components/icons'
import Field from '../../components/shop/Field'
import PageHeader from '../../components/shop/PageHeader'
import { MIN_PASSWORD } from '../../shop/account'
import { password, useForm } from '../../shop/form'
import './Account.css'

// Réinitialiser le mot de passe (reached from the e-mailed link).
export default function ResetPassword() {
  const form = useForm(
    { new_password: '', confirm_password: '' },
    {
      new_password: password(MIN_PASSWORD),
      confirm_password: (v, all) => (!v ? 'Confirmez le mot de passe.' : v === all.new_password ? null : 'Les deux mots de passe ne correspondent pas.'),
    },
  )
  const [done, setDone] = useState(false)

  return (
    <main id="main" className="page account">
      <PageHeader
        crumbs={[{ to: '/mon-compte', label: 'Mon compte' }, { label: 'Nouveau mot de passe' }]}
        title="Nouveau mot de passe"
      />
      <div className="auth auth--single">
        {done ? (
          <div className="panel auth__panel" role="status">
            <h2 className="panel__title">Mot de passe modifié</h2>
            <p className="auth__lede">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <Link className="btn-chip" to="/mon-compte">
              Se connecter
              <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <form
            className="panel auth__panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!form.validate().length) setDone(true)
            }}
          >
            <Field label="Nouveau mot de passe" type="password" autoComplete="new-password" help={`Au moins ${MIN_PASSWORD} caractères.`} {...form.field('new_password')} />
            <Field label="Confirmez le mot de passe" type="password" autoComplete="new-password" {...form.field('confirm_password')} />
            <button type="submit" className="btn-chip">
              Enregistrer
              <ArrowRightIcon />
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
