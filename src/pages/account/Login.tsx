import { useRef, useState, type RefObject } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRightIcon } from '../../components/icons'
import ErrorSummary from '../../components/shop/ErrorSummary'
import Field from '../../components/shop/Field'
import PageHeader from '../../components/shop/PageHeader'
import { DEMO_EMAIL, MIN_PASSWORD, useAccount } from '../../shop/account'
import { fieldVars } from '../../shop/catalog'
import { PRODUCTS } from '../../components/products'
import { email, password, useForm } from '../../shop/form'
import './Account.css'

const SIGN_IN_MS = 600 // mock round trip

type Mode = 'login' | 'register'

// TODO: placeholder illustrations (the landing's cut-outs on a hero field)
// until the real ones are drawn.
const ART: Record<Mode, { image: string; field: string; title: string; text: string }> = {
  login: {
    image: 'benefit-stew-pot',
    field: 'lalo',
    title: 'Content de vous revoir',
    text: 'Vos commandes, vos adresses et le suivi de vos livraisons vous attendent.',
  },
  register: {
    image: 'benefit-product-box',
    field: 'chayotte',
    title: 'Rejoignez la famille Legim Express',
    text: 'Commandez plus vite, suivez vos livraisons et recevez nos nouvelles recettes.',
  },
}

// Mon compte, signed out: one card, the form on the left and an illustration
// on the right. The link under the form swaps both to the other mode (sign in
// ⇄ create an account). After signing in, returns to where the visitor came
// from (e.g. the checkout). Arriving from the confirmation opens sign-up.
export default function Login() {
  const { state } = useLocation() as { state: { from?: string; register?: string } | null }
  const navigate = useNavigate()
  const account = useAccount()
  const [mode, setMode] = useState<Mode>(state?.register ? 'register' : 'login')
  const loginTitle = useRef<HTMLHeadingElement>(null)
  const registerTitle = useRef<HTMLHeadingElement>(null)

  const done = () => {
    if (state?.from) navigate(state.from, { replace: true })
  }

  const switchTo = (next: Mode) => {
    setMode(next)
    // Focus follows the swap, so keyboard and screen reader users land on the new form.
    requestAnimationFrame(() => (next === 'login' ? loginTitle : registerTitle).current?.focus())
  }

  return (
    <main className="page account">
      <PageHeader crumbs={[{ label: 'Mon compte' }]} title="Mon compte" />
      <div className="auth-card" data-mode={mode}>
        <div className="auth-card__forms">
          <div className="auth-card__pane auth-card__pane--login" inert={mode !== 'login'}>
            <SignIn onDone={done} login={account.login} titleRef={loginTitle} />
            <p className="auth-card__switch">
              Pas encore de compte ?{' '}
              <button type="button" className="link auth-card__toggle" onClick={() => switchTo('register')}>
                Créer un compte
              </button>
            </p>
          </div>
          <div className="auth-card__pane auth-card__pane--register" inert={mode !== 'register'}>
            <Register onDone={done} register={account.register} initialEmail={state?.register ?? ''} titleRef={registerTitle} />
            <p className="auth-card__switch">
              Déjà client ?{' '}
              <button type="button" className="link auth-card__toggle" onClick={() => switchTo('login')}>
                Se connecter
              </button>
            </p>
          </div>
        </div>

        <div className="auth-card__art" aria-hidden="true">
          {(Object.keys(ART) as Mode[]).map((m) => {
            const art = ART[m]
            return (
              <figure key={m} className={`auth-art auth-art--${m}`} style={fieldVars(PRODUCTS.find((p) => p.id === art.field)!)}>
                <div className="auth-art__texture" />
                <img src={`/images/${art.image}-1280.webp`} alt="" width={1280} height={1280} loading="lazy" decoding="async" />
                <figcaption>
                  <span className="auth-art__title">{art.title}</span>
                  <span className="auth-art__text">{art.text}</span>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </main>
  )
}

function SignIn({
  onDone,
  login,
  titleRef,
}: {
  onDone: () => void
  login: (e: string, p: string) => boolean
  titleRef: RefObject<HTMLHeadingElement | null>
}) {
  const form = useForm({ login_email: '', login_password: '' }, { login_email: email, login_password: password(MIN_PASSWORD) })
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="auth-form"
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
      <h2 className="panel__title" id="signin-title" tabIndex={-1} ref={titleRef}>
        Se connecter
      </h2>
      <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={summary.length} />
      <Field label="Adresse e-mail" type="email" autoComplete="username" inputMode="email" {...form.field('login_email')} />
      <Field label="Mot de passe" type="password" autoComplete="current-password" {...form.field('login_password')} />
      <div className="auth-form__row">
        <label className="check">
          <input type="checkbox" defaultChecked />
          Rester connecté
        </label>
        <Link className="link auth__lost" to="/mon-compte/mot-de-passe-perdu">
          Mot de passe oublié ?
        </Link>
      </div>
      <button type="submit" className="btn-chip" disabled={busy}>
        {busy ? 'Connexion…' : 'Se connecter'}
        {!busy && <ArrowRightIcon />}
      </button>
      {/* TODO: demo hint until real accounts exist. */}
      <p className="field__help">Démo : {DEMO_EMAIL}, n'importe quel mot de passe de {MIN_PASSWORD} caractères ou plus.</p>
    </form>
  )
}

function Register({
  onDone,
  register,
  initialEmail,
  titleRef,
}: {
  onDone: () => void
  register: (e: string, p: string) => boolean
  initialEmail: string
  titleRef: RefObject<HTMLHeadingElement | null>
}) {
  const form = useForm({ reg_email: initialEmail, reg_password: '' }, { reg_email: email, reg_password: password(MIN_PASSWORD) })
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])

  return (
    <form
      className="auth-form"
      noValidate
      aria-labelledby="register-title"
      onSubmit={(e) => {
        e.preventDefault()
        const errors = form.validate()
        setSummary(errors)
        if (!errors.length && register(form.values.reg_email, form.values.reg_password)) onDone()
      }}
    >
      <h2 className="panel__title" id="register-title" tabIndex={-1} ref={titleRef}>
        Créer un compte
      </h2>
      <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={summary.length} />
      <Field label="Adresse e-mail" type="email" autoComplete="email" inputMode="email" {...form.field('reg_email')} />
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
      <button type="submit" className="btn-chip">
        Créer mon compte
        <ArrowRightIcon />
      </button>
    </form>
  )
}
