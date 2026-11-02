import { useRef } from 'react'
import { StarIcon } from './icons'
import { useReveal } from './reveal'
import './Testimonials.css'

// TODO: mock reviews until real ones are collected.
const REVIEWS = [
  {
    quote:
      "Comme chez ma grand-mère, sans passer l'après-midi aux fourneaux. J'ajoute un peu de bœuf et toute la famille se régale.",
    name: 'Nadège P.',
    city: 'Montréal',
  },
  {
    quote:
      "Le lalo est parfait, bien fondant. C'est devenu notre repas du mercredi soir : vingt minutes et c'est sur la table.",
    name: 'Jean-Robert L.',
    city: 'Laval',
  },
  {
    quote:
      "J'adore que la base ne soit pas épicée : je l'assaisonne à mon goût, et mes enfants en redemandent.",
    name: 'Sophie M.',
    city: 'Longueuil',
  },
]

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <section id="avis" className="section testimonials" ref={sectionRef} aria-labelledby="testimonials-title">
      <div className="section__head">
        <div>
          <h2 className="section__title testimonials__title" id="testimonials-title">
            Ils en parlent
          </h2>
          <p className="section__lede testimonials__lede">Ce que nos clients disent de Legim Express.</p>
        </div>
        {/* TODO: real average and count once reviews are collected. */}
        <p className="testimonials__score">
          <span className="testimonials__avg">
            4,9<span className="testimonials__max"> / 5</span>
          </span>
          <span className="testimonials__count">
            <span className="review__stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((s) => (
                <StarIcon key={s} />
              ))}
            </span>
            D'après 120 avis
          </span>
        </p>
      </div>

      <ul className="testimonials__list">
        {REVIEWS.map((review, i) => (
          <li key={review.name} className="review" style={{ '--i': i } as React.CSSProperties}>
            <figure className="review__card">
              <p className="review__stars" role="img" aria-label="5 étoiles sur 5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <StarIcon key={s} className="review__star" style={{ '--s': s } as React.CSSProperties} />
                ))}
              </p>
              <blockquote className="review__quote">
                <p>{review.quote}</p>
              </blockquote>
              <figcaption className="review__who">
                <span className="review__avatar" aria-hidden="true">
                  {initials(review.name)}
                </span>
                <span>
                  <span className="review__name">{review.name}</span>
                  <span className="review__city">{review.city}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
