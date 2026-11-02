import { useSearchParams } from 'react-router'
import PageHeader from '../components/shop/PageHeader'
import ProductCard from '../components/shop/ProductCard'
import EmptyState from '../components/shop/EmptyState'
import { CATALOG, CATEGORIES, type Category } from '../shop/catalog'
import { plural } from '../shop/format'
import './Shop.css'

const SORTS = [
  { id: 'populaires', label: 'Les plus populaires' },
  { id: 'prix-croissant', label: 'Prix croissant' },
  { id: 'prix-decroissant', label: 'Prix décroissant' },
] as const

// Boutique (WooCommerce's shop archive): category pills and a sort, both kept
// in the URL (?categorie=…&tri=…) so a filtered view can be shared.
export default function Shop() {
  const [params, setParams] = useSearchParams()
  const category = params.get('categorie') as Category | null
  const sort = params.get('tri') ?? 'populaires'

  const items = CATALOG.filter((p) => !category || p.category === category).sort((a, b) =>
    sort === 'prix-croissant' ? a.price - b.price : sort === 'prix-decroissant' ? b.price - a.price : 0,
  )

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const currentLabel = CATEGORIES.find((c) => c.id === category)?.label

  return (
    <main className="page shop">
      <PageHeader
        crumbs={currentLabel ? [{ to: '/boutique', label: 'Boutique' }, { label: currentLabel }] : [{ label: 'Boutique' }]}
        title="Nos legims"
        lede="Précuits et congelés, prêts en 20 minutes. Livrés au froid dans le Grand Montréal."
      />

      <div className="shop__bar">
        <div className="shop__filters" role="group" aria-label="Catégories">
          {[{ id: null, label: 'Tout' }, ...CATEGORIES].map((c) => (
            <button
              key={c.label}
              type="button"
              className="filter-pill"
              aria-pressed={category === c.id}
              onClick={() => update('categorie', c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="shop__sort">
          <label className="field__label" htmlFor="tri">
            Trier par
          </label>
          <select id="tri" className="field__control" value={sort} onChange={(e) => update('tri', e.target.value === 'populaires' ? null : e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="shop__count" aria-live="polite">
        {plural(items.length, 'produit')}
      </p>

      {items.length ? (
        <ul className="product-grid">
          {items.map((item, i) => (
            <li key={item.id} style={{ '--i': i } as React.CSSProperties}>
              <ProductCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Aucun produit ici pour l'instant"
          action={
            <button type="button" className="btn-ghost" onClick={() => update('categorie', null)}>
              Voir tous les produits
            </button>
          }
        />
      )}
    </main>
  )
}
