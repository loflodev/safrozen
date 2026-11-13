import PageHeader from '../components/shop/PageHeader'
import RecipeCard from '../components/RecipeCard'
import { RECIPES } from '../shop/recipes'
import './Recipes.css'

// Recettes (the blog archive): every post, newest first, 3 / 2 / 1 columns.
export default function RecipesArchive() {
  return (
    <main id="main" className="page">
      <PageHeader
        crumbs={[{ label: 'Recettes' }]}
        title="Nos recettes"
        lede="Des idées simples pour apprêter Legim Express à votre goût, en 20 minutes ou presque."
      />
      <ol className="recipes-grid">
        {RECIPES.map((post, i) => (
          <li key={post.slug} style={{ '--i': i, '--delay': '0ms' } as React.CSSProperties}>
            <RecipeCard post={post} headingLevel={2} />
          </li>
        ))}
      </ol>
    </main>
  )
}
