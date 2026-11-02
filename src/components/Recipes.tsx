import { useRef } from 'react'
import { ArrowRightIcon, ClockIcon } from './icons'
import { useReveal } from './reveal'
import './Recipes.css'

// TODO: mock posts, newest first, until the blog exists.
const POSTS = [
  {
    image: 'benefit-stew-pot',
    alt: 'Une cocotte de légumes mijotés, carottes et persil.',
    date: '2026-10-28',
    dateLabel: '28 octobre 2026',
    title: 'Mijoté de lalo aux crevettes en 20 minutes',
    excerpt: 'Une boîte de Legim Express au Lalo, une poignée de crevettes et un filet de citron vert : le souper est servi.',
    read: '4 min de lecture',
  },
  {
    image: 'benefit-bean-bowl',
    alt: 'Un bol de pois rouges en sauce.',
    date: '2026-10-21',
    dateLabel: '21 octobre 2026',
    title: "Bol végétarien à l'aubergine et aux pois",
    excerpt: "Une base neutre, des pois rouges et un peu d'épices : notre recette favorite pour les soirs pressés.",
    read: '5 min de lecture',
  },
  {
    image: 'benefit-rice',
    alt: 'Une assiette de riz blanc.',
    date: '2026-10-14',
    dateLabel: '14 octobre 2026',
    title: 'Chayotte, riz blanc et avocat',
    excerpt: "Le classique du dimanche, sans les trois heures de cuisson. Nos astuces pour l'assaisonner à votre goût.",
    read: '3 min de lecture',
  },
]

export default function Recipes() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <section id="recettes" className="section recipes" ref={sectionRef} aria-labelledby="recipes-title">
      <div className="section__head recipes__head">
        <div>
          <h2 className="section__title recipes__title" id="recipes-title">
            Nos dernières recettes
          </h2>
          <p className="section__lede recipes__lede">Des idées simples pour apprêter Legim Express à votre goût.</p>
        </div>
        <a className="recipes__all" href="#recettes">
          Voir toutes les recettes
          <ArrowRightIcon />
        </a>
      </div>

      <ol className="recipes__list">
        {POSTS.map((post, i) => (
          <li key={post.date} className="recipe" style={{ '--i': i } as React.CSSProperties}>
            <article className="recipe__card">
              <div className="recipe__tile">
                <img
                  className="recipe__img"
                  src={`/images/${post.image}-640.webp`}
                  srcSet={`/images/${post.image}-640.webp 640w, /images/${post.image}-1280.webp 1280w`}
                  sizes="(min-width: 900px) 30vw, 90vw"
                  alt={post.alt}
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="recipe__title recipe__text">
                {/* TODO: link to the post once the blog exists. */}
                <a className="recipe__link" href="#recettes">
                  {post.title}
                </a>
              </h3>
              <p className="recipe__excerpt recipe__text">{post.excerpt}</p>
              <p className="recipe__meta recipe__text">
                <time dateTime={post.date}>{post.dateLabel}</time>
                <span aria-hidden="true">·</span>
                <span className="recipe__read">
                  <ClockIcon width={16} height={16} />
                  {post.read}
                </span>
              </p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
