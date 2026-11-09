import { Link, useParams } from 'react-router'
import { ArrowRightIcon, ClockIcon } from '../components/icons'
import PageHeader from '../components/shop/PageHeader'
import ProductCard from '../components/shop/ProductCard'
import RecipeCard from '../components/RecipeCard'
import { byId } from '../shop/catalog'
import { recipeBySlug, RECIPES } from '../shop/recipes'
import NotFound from './NotFound'
import './Recipes.css'

// One recipe (a blog post): picture, facts, ingredients beside the steps,
// the product it uses, then other recipes.
export default function RecipeDetail() {
  const { slug = '' } = useParams()
  const post = recipeBySlug(slug)
  if (!post) return <NotFound />
  const product = byId(post.productId)
  const others = RECIPES.filter((r) => r.slug !== post.slug).slice(0, 2)

  return (
    <main className="page recipe-page">
      <PageHeader crumbs={[{ to: '/recettes', label: 'Recettes' }, { label: post.title }]} title={post.title} lede={post.excerpt} />

      <div className="recipe-page__hero">
        <div className="recipe-page__tile">
          <img
            src={`/images/${post.image}-1280.webp`}
            alt={post.alt}
            width={1280}
            height={1280}
            decoding="async"
          />
        </div>
        <dl className="recipe-page__facts">
          <div>
            <dt>Pour</dt>
            <dd>{post.serves}</dd>
          </div>
          <div>
            <dt>Temps</dt>
            <dd>{post.time}</dd>
          </div>
          <div>
            <dt>Publié le</dt>
            <dd>
              <time dateTime={post.date}>{post.dateLabel}</time>
            </dd>
          </div>
          <div>
            <dt>Lecture</dt>
            <dd className="recipe-page__read">
              <ClockIcon width={16} height={16} />
              {post.read.replace(' de lecture', '')}
            </dd>
          </div>
        </dl>
      </div>

      <div className="recipe-page__body">
        <section className="panel recipe-page__ingredients" aria-labelledby="ingredients-title">
          <h2 className="panel__title" id="ingredients-title">
            Ingrédients
          </h2>
          <ul>
            {post.ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
        <section className="recipe-page__steps" aria-labelledby="steps-title">
          <h2 className="panel__title" id="steps-title">
            Préparation
          </h2>
          <ol>
            {post.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </div>

      {product && (
        <section className="recipe-page__product" aria-labelledby="used-title">
          <h2 className="panel__title" id="used-title">
            Le legim de cette recette
          </h2>
          <div className="recipe-page__product-card">
            <ProductCard item={product} />
          </div>
        </section>
      )}

      <section className="recipe-page__more" aria-labelledby="more-title">
        <div className="section__head recipes__head">
          <h2 className="section__title" id="more-title">
            D'autres recettes
          </h2>
          <Link className="recipes__all" to="/recettes">
            Toutes les recettes
            <ArrowRightIcon />
          </Link>
        </div>
        <ol className="recipes-grid">
          {others.map((r, i) => (
            <li key={r.slug} style={{ '--i': i, '--delay': '0ms' } as React.CSSProperties}>
              <RecipeCard post={r} />
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
