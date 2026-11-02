import { useRef } from 'react'
import { ArrowRightIcon, ClockIcon } from './icons'
import { useReveal } from './reveal'
import { RECIPES } from '../shop/recipes'
import './Recipes.css'

const POSTS = RECIPES

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
