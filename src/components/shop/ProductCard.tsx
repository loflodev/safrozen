import { Link } from 'react-router'
import { useCart } from '../../shop/cart'
import { formatPrice } from '../../shop/format'
import type { CatalogItem } from '../../shop/catalog'
import { PlusIcon } from '../icons'
import ProductArt from './ProductArt'
import './ProductCard.css'

// Shop grid card: field panel, name (the link covers the card), spec line,
// price and a quick add. Out-of-stock items say so and can't be added.
export default function ProductCard({ item, onAdded }: { item: CatalogItem; onAdded?: (item: CatalogItem) => void }) {
  const cart = useCart()
  const soldOut = item.stock === 0
  return (
    <article className="product-card">
      <ProductArt item={item} className="product-card__art product-art--lifted" />
      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={`/produit/${item.slug}`}>{item.name}</Link>
        </h3>
        <p className="product-card__meta">
          {item.weight} · {item.portions} portions · prêt en {item.ready}
        </p>
        <div className="product-card__buy">
          <p className="price">{formatPrice(item.price)}</p>
          {soldOut ? (
            <p className="product-card__soldout">Bientôt de retour</p>
          ) : (
            <button
              type="button"
              className="product-card__add"
              aria-label={`Ajouter ${item.name} au panier`}
              onClick={() => {
                cart.add(item.id)
                onAdded?.(item)
              }}
            >
              <PlusIcon />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
