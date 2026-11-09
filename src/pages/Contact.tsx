import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRightIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TikTokIcon,
} from '../components/icons'
import ErrorSummary from '../components/shop/ErrorSummary'
import Field from '../components/shop/Field'
import PageHeader from '../components/shop/PageHeader'
import { fieldVars } from '../shop/catalog'
import { PRODUCTS } from '../components/products'
import { email, phone, required, useForm } from '../shop/form'
import './Contact.css'

const SUBJECTS = ['Une commande', 'La livraison', 'Nos produits', 'Trouver un magasin', 'Devenir partenaire', 'Autre chose']
const SEND_MS = 700 // mock round trip
const STORE_LOCATOR = '/points-de-vente'

// TODO: real contact details and profile URLs (same as the footer).
const ADDRESS = 'Québec, Canada H1L 3A9'
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`
const SOCIALS = [
  { href: '#', label: 'TikTok', handle: '@legimexpress', Icon: TikTokIcon },
  { href: '#', label: 'Facebook', handle: 'Legim Express', Icon: FacebookIcon },
  { href: '#', label: 'Instagram', handle: '@legimexpress', Icon: InstagramIcon },
]

// Contact (a WordPress page with a form): the store locator first, then the
// shop's details beside the form, then the socials.
// TODO: the form is mocked; nothing is sent.
export default function Contact() {
  const form = useForm(
    { name: '', contact_email: '', contact_phone: '', subject: SUBJECTS[0], message: '' },
    {
      name: required('Saisissez votre nom complet.'),
      contact_email: email,
      contact_phone: (v) => (v.trim() ? phone(v) : null),
      message: (v) => (v.trim().length >= 10 ? null : 'Écrivez votre message (au moins 10 caractères).'),
    },
  )
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const chayotte = PRODUCTS.find((p) => p.id === 'chayotte')!

  return (
    <main className="page contact">
      <PageHeader
        crumbs={[{ label: 'Contact' }]}
        title="Parlons-en"
        lede="Une question sur une commande, la livraison ou nos legims ? Nous répondons en un jour ouvrable."
      />

      <section className="contact-locator" style={fieldVars(chayotte)} aria-labelledby="contact-locator-title">
        <div className="contact-locator__texture" aria-hidden="true" />
        <div className="contact-locator__copy">
          <h2 className="contact-locator__title" id="contact-locator-title">
            Trouvez nos legims près de chez vous
          </h2>
          <p className="contact-locator__text">
            Nos boîtes vous attendent au congélateur de nos épiciers partenaires. Cherchez le magasin le plus proche.
          </p>
          <Link className="btn-chip contact-locator__cta" to={STORE_LOCATOR}>
            Trouver un magasin
            <ArrowRightIcon />
          </Link>
        </div>
        <img
          className="contact-locator__art"
          src="/images/chayotte-box-1280.webp"
          alt=""
          width={1280}
          height={640}
          decoding="async"
        />
      </section>

      <div className="contact__layout">
        <section className="panel contact__info" aria-labelledby="contact-info-title">
          <h2 className="panel__title" id="contact-info-title">
            Nos coordonnées
          </h2>
          <address className="contact__list">
            <a className="contact-row" href="tel:+14389698712">
              <span className="contact-row__icon" aria-hidden="true">
                <PhoneIcon />
              </span>
              <span className="contact-row__text">
                <span className="contact-row__label">Appelez-nous</span>
                +1 (438) 969 8712
              </span>
            </a>
            <a className="contact-row" href="mailto:infos@safrozen.com">
              <span className="contact-row__icon" aria-hidden="true">
                <MailIcon />
              </span>
              <span className="contact-row__text">
                <span className="contact-row__label">Écrivez-nous</span>
                infos@safrozen.com
              </span>
            </a>
            <a className="contact-row" href={MAPS_URL} target="_blank" rel="noreferrer">
              <span className="contact-row__icon" aria-hidden="true">
                <PinIcon />
              </span>
              <span className="contact-row__text">
                <span className="contact-row__label">
                  Venez nous voir<span className="visually-hidden"> (itinéraire, nouvel onglet)</span>
                </span>
                {ADDRESS}
              </span>
            </a>
          </address>
          <p className="contact__hours">
            <ClockIcon />
            Du lundi au vendredi, 9 h à 17 h
          </p>
        </section>

        {state === 'sent' ? (
          <div className="panel contact__form" role="status">
            <h2 className="panel__title">Merci, {form.values.name.trim().split(' ')[0]} !</h2>
            <p>Votre message est bien parti. Nous vous répondons à {form.values.contact_email} sous un jour ouvrable.</p>
            <Link className="btn-ghost" to={STORE_LOCATOR}>
              Trouver un magasin
            </Link>
          </div>
        ) : (
          <form
            className="panel contact__form"
            aria-labelledby="contact-form-title"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              const errors = form.validate()
              setSummary(errors)
              setAttempt((n) => n + 1)
              if (errors.length) return
              setState('sending')
              window.setTimeout(() => setState('sent'), SEND_MS)
            }}
          >
            <h2 className="panel__title" id="contact-form-title">
              Envoyez-nous un message
            </h2>
            <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={attempt} />
            <div className="form-grid form-grid--2">
              <Field label="Nom complet" autoComplete="name" full {...form.field('name')} />
              <Field label="Adresse e-mail" type="email" autoComplete="email" inputMode="email" {...form.field('contact_email')} />
              <Field label="Téléphone" optional type="tel" autoComplete="tel" inputMode="tel" {...form.field('contact_phone')} />
              <Field as="select" label="Sujet" full {...form.field('subject')}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Field>
              <Field as="textarea" label="Message" full rows={6} {...form.field('message')} />
            </div>
            <button type="submit" className="btn-chip contact__submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Envoi…' : 'Envoyer le message'}
              {state !== 'sending' && <ArrowRightIcon />}
            </button>
          </form>
        )}

        <section className="panel contact__social" aria-labelledby="contact-social-title">
          <h2 className="panel__title" id="contact-social-title">
            Suivez-nous
          </h2>
          <ul className="contact__socials">
            {SOCIALS.map(({ href, label, handle, Icon }) => (
              <li key={label}>
                <a className="contact-row" href={href}>
                  <span className="contact-row__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="contact-row__text">
                    <span className="contact-row__label">{label}</span>
                    {handle}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
