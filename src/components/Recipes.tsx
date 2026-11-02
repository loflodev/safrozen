import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon } from './icons'
import RecipeCard from './RecipeCard'
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
        <Link className="recipes__all" to="/recettes">
          Voir toutes les recettes
          <ArrowRightIcon />
        </Link>
      </div>

      <ol className="recipes__list">
        {POSTS.map((post, i) => (
          <li key={post.date} className="recipe" style={{ '--i': i } as React.CSSProperties}>
            <RecipeCard post={post} />
          </li>
        ))}
      </ol>
    </section>
  )
}
