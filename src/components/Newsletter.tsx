import { useRef, useState, type FormEvent } from 'react'
import { ArrowRightIcon } from './icons'
import { useReveal } from './reveal'
import './Newsletter.css'

const TITLE = 'Rejoignez notre communauté !'

export default function Newsletter() {
  const sectionRef = useRef<HTMLElement>(null)
  const [done, setDone] = useState(false)
  useReveal(sectionRef)

  // TODO: no mailing list yet; the sign-up is only confirmed on the page.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    form.reset()
    setDone(true)
  }

  return (
    <section className="section newsletter" ref={sectionRef} aria-labelledby="newsletter-title">
      <div className="newsletter__panel">
        <div className="veg-texture newsletter__texture" aria-hidden="true" />
        <div className="newsletter__intro">
        <h2 className="section__title newsletter__title" id="newsletter-title" aria-label={TITLE}>
          {TITLE.split(' ').map((word, i) => (
            <span key={i} className="newsletter__word" aria-hidden="true">
              <span style={{ '--i': i } as React.CSSProperties}>{word}</span>
            </span>
          ))}
        </h2>
        <p className="newsletter__lede">Recevez nos dernières nouvelles directement dans votre boîte mail.</p>
        </div>

        <form className="newsletter__form" onSubmit={onSubmit} noValidate>
          <label className="newsletter__label" htmlFor="newsletter-email">
            Votre adresse courriel
          </label>
          <div className="newsletter__row">
            <input
              className="newsletter__input"
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nom@exemple.com"
              required
              onInput={() => setDone(false)}
            />
            <button className="btn-chip newsletter__submit" type="submit">
              S'inscrire
              <ArrowRightIcon />
            </button>
          </div>
          <p className="newsletter__status" aria-live="polite">
            {done ? 'Merci ! Vous êtes bien inscrit·e à nos nouvelles.' : ''}
          </p>
        </form>
      </div>
    </section>
  )
}
