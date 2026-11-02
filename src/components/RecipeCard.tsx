import { Link } from 'react-router'
import type { Recipe } from '../shop/recipes'
import { ClockIcon } from './icons'
import './Recipes.css'

// A recipe card (landing section and the recipes archive): picture tile,
// title (its link covers the card), excerpt, then date · reading time.
export default function RecipeCard({ post, headingLevel = 3 }: { post: Recipe; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const
  return (
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
      <H className="recipe__title recipe__text">
        <Link className="recipe__link" to={`/recettes/${post.slug}`}>
          {post.title}
        </Link>
      </H>
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
  )
}
