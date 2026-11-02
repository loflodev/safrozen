import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../components/icons'
import ErrorSummary from '../components/shop/ErrorSummary'
import Field from '../components/shop/Field'
import PageHeader from '../components/shop/PageHeader'
import { email, required, useForm } from '../shop/form'
import './Contact.css'

const SUBJECTS = ['Une commande', 'La livraison', 'Nos produits', 'Devenir partenaire', 'Autre chose']
const SEND_MS = 700 // mock round trip

// Contact (a WordPress page with a form): the form beside the shop's details.
// TODO: the form is mocked; nothing is sent.
export default function Contact() {
  const form = useForm(
    { name: '', contact_email: '', subject: SUBJECTS[0], order: '', message: '' },
    {
      name: required('Saisissez votre nom.'),
      contact_email: email,
      message: (v) => (v.trim().length >= 10 ? null : 'Écrivez votre message (au moins 10 caractères).'),
    },
  )
  const [summary, setSummary] = useState<{ id: string; message: string }[]>([])
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

  return (
    <main className="page contact">
      <PageHeader
        crumbs={[{ label: 'Contact' }]}
        title="Écrivez-nous"
        lede="Une question sur une commande, la livraison ou nos legims ? Nous répondons en un jour ouvrable."
      />
      <div className="contact__layout">
        {state === 'sent' ? (
          <div className="panel contact__form" role="status">
            <h2 className="panel__title">Merci, {form.values.name.split(' ')[0]} !</h2>
            <p className="auth__lede">Votre message est bien parti. Nous vous répondons à {form.values.contact_email} sous un jour ouvrable.</p>
            <Link className="btn-chip" to="/boutique">
              Voir la boutique
              <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <form
            className="panel contact__form"
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
            <ErrorSummary errors={summary.filter((s) => form.errors[s.id as keyof typeof form.errors])} attempt={attempt} />
            <div className="form-grid form-grid--2">
              <Field label="Nom" autoComplete="name" {...form.field('name')} />
              <Field label="Adresse e-mail" type="email" autoComplete="email" inputMode="email" {...form.field('contact_email')} />
              <Field as="select" label="Sujet" {...form.field('subject')}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Field>
              <Field label="Numéro de commande" optional inputMode="numeric" {...form.field('order')} />
              <Field as="textarea" label="Message" full rows={6} {...form.field('message')} />
            </div>
            <button type="submit" className="btn-chip contact__submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Envoi…' : 'Envoyer'}
              {state !== 'sending' && <ArrowRightIcon />}
            </button>
          </form>
        )}

        <aside className="contact__aside" aria-label="Nos coordonnées">
          <div className="panel">
            <h2 className="panel__title">Nos coordonnées</h2>
            {/* TODO: real contact details (same as the footer). */}
            <address className="contact__list">
              <span>
                <PinIcon />
                1234, rue Jean-Talon Est, Montréal (Québec)
              </span>
              <a href="tel:+15145550142">
                <PhoneIcon />
                514 555-0142
              </a>
              <a href="mailto:bonjour@legimexpress.ca">
                <MailIcon />
                bonjour@legimexpress.ca
              </a>
              <span>
                <ClockIcon />
                Du lundi au vendredi, 9 h à 17 h
              </span>
            </address>
          </div>
          <div className="panel contact__help">
            <h2 className="panel__title">Une commande en cours ?</h2>
            <p>Suivez-la en direct avec son numéro et votre e-mail.</p>
            <Link className="btn-ghost" to="/suivi">
              Suivre ma commande
            </Link>
            <Link className="link" to="/faq">
              Questions fréquentes
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
