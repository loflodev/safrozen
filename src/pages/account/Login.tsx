import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRightIcon } from '../../components/icons'
import ErrorSummary from '../../components/shop/ErrorSummary'
import Field from '../../components/shop/Field'
import PageHeader from '../../components/shop/PageHeader'
import { DEMO_EMAIL, MIN_PASSWORD, useAccount } from '../../shop/account'
import { email, password, useForm } from '../../shop/form'
import './Account.css'

const SIGN_IN_MS = 600 // mock round trip

// Mon compte, logged out (WooCommerce's login / register forms side by side).
// After signing in, returns to where the visitor came from (e.g. the checkout).
export default function Login() {
  const { state } = useLocation() as { state: { from?: string; register?: string } | null }
  const navigate = useNavigate()
  const account = useAccount()

  const done = () => {
    if (state?.from) navigate(state.from, { replace: true })
  }

  return (
    <main className="page account">
      <PageHeader crumbs={[{ label: 'Mon compte' }]} title="Mon compte" lede="Retrouvez vos commandes, vos adresses et le suivi de vos livraisons." />
      <div className="auth">
        <SignIn onDone={done} login={account.login} />
        <Register onDone={done} register={account.register} initialEmail={state?.register ?? ''} autoFocus={!!state?.register} />
      </div>
    </main>
  )
}

function SignIn({ onDone, login }: { onDone: () => void; login: (e: string, p: string) => boolean }) {
  const form = useForm({ login_email: '', login_password: '' }, { login_email: email, login_password: password(MIN_PASSWORD) })
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="panel auth__panel"
      noValidate
      aria-labelledby="signin-title"
      onSubmit={(e) => {
        e.preventDefault()
        const errors = form.validate()
        setSummary(errors)
        if (errors.length) return
        setBusy(true)
        window.setTimeout(() => {
          setBusy(false)
          if (login(form.values.login_email, form.values.login_password)) onDone()
        }, SIGN_IN_MS)
      }}
    >
      <h2 className="panel__title" id="signin-title">
        Se connecter
      </h2>
      <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={summary.length} />
      <Field label="Adresse e-mail" type="email" autoComplete="username" inputMode="email" {...form.field('login_email')} />
      <Field label="Mot de passe" type="password" autoComplete="current-password" {...form.field('login_password')} />
      <label className="check">
        <input type="checkbox" defaultChecked />
        Rester connecté
      </label>
      <button type="submit" className="btn-chip" disabled={busy}>
        {busy ? 'Connexion…' : 'Se connecter'}
        {!busy && <ArrowRightIcon />}
      </button>
      <Link className="link auth__lost" to="/mon-compte/mot-de-passe-perdu">
        Mot de passe oublié ?
      </Link>
      {/* TODO: demo hint until real accounts exist. */}
      <p className="field__help">Démo : {DEMO_EMAIL}, n'importe quel mot de passe de {MIN_PASSWORD} caractères ou plus.</p>
    </form>
  )
}

function Register({
  onDone,
  register,
  initialEmail,
  autoFocus,
}: {
  onDone: () => void
  register: (e: string, p: string) => boolean
  initialEmail: string
  autoFocus: boolean
}) {
  const form = useForm({ reg_email: initialEmail, reg_password: '' }, { reg_email: email, reg_password: password(MIN_PASSWORD) })
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])

  return (
    <form
      className="panel auth__panel auth__panel--register"
      noValidate
      aria-labelledby="register-title"
      onSubmit={(e) => {
        e.preventDefault()
        const errors = form.validate()
        setSummary(errors)
        if (!errors.length && register(form.values.reg_email, form.values.reg_password)) onDone()
      }}
    >
      <h2 className="panel__title" id="register-title">
        Créer un compte
      </h2>
      <p className="auth__lede">Commandez plus vite, suivez vos livraisons et recevez nos nouvelles recettes.</p>
      <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={summary.length} />
      <Field label="Adresse e-mail" type="email" autoComplete="email" inputMode="email" autoFocus={autoFocus} {...form.field('reg_email')} />
      <Field
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        help={`Au moins ${MIN_PASSWORD} caractères.`}
        {...form.field('reg_password')}
      />
      <p className="field__help">
        Vos données servent à traiter vos commandes et à gérer votre compte, comme décrit dans notre{' '}
        <Link className="link" to="/confidentialite">
          politique de confidentialité
        </Link>
        .
      </p>
      <button type="submit" className="btn-ghost">
        Créer mon compte
      </button>
    </form>
  )
}
