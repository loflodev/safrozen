import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowRightIcon, StarIcon, TruckIcon } from '../components/icons'
import PageHeader from '../components/shop/PageHeader'
import ProductArt from '../components/shop/ProductArt'
import ProductCard from '../components/shop/ProductCard'
import QuantityStepper from '../components/shop/QuantityStepper'
import { bySlug, CATALOG, CATEGORIES } from '../shop/catalog'
import { MAX_QTY, useCart } from '../shop/cart'
import { formatPrice } from '../shop/format'
import NotFound from './NotFound'
import './Product.css'

// Single product (WooCommerce's product page): art left, buy box right
// (7:5 from 900px), details as disclosures, then related products.
export default function ProductRoute() {
  const { slug = '' } = useParams()
  // Keyed by slug, so moving between products starts fresh (quantity 1).
  return <Product key={slug} slug={slug} />
}

function Product({ slug }: { slug: string }) {
  const item = bySlug(slug)
  const cart = useCart()
  const [qty, setQty] = useState(1)
  const buyRef = useRef<HTMLDivElement>(null)
  const [showBar, setShowBar] = useState(false)

  // Under 900px a sticky bar repeats the add button once the buy box scrolls away.
  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [item])

  if (!item) return <NotFound />

  const soldOut = item.stock === 0
  const max = Math.min(MAX_QTY, item.stock)
  const inCart = cart.lines.find((l) => l.id === item.id)?.quantity ?? 0
  const category = CATEGORIES.find((c) => c.id === item.category)!
  const related = CATALOG.filter((p) => p.id !== item.id).slice(0, 3)
  const add = () => cart.add(item.id, qty)

  return (
    <main className="page product">
      <div className="product__top">
        <div className="product__media">
          <ProductArt item={item} size={2048} eager className="product__art" />
        </div>

        <div className="product__info">
          <PageHeader
            crumbs={[
              { to: '/boutique', label: 'Boutique' },
              { to: `/boutique?categorie=${category.id}`, label: category.label },
              { label: item.name },
            ]}
            title={item.name}
          />
          <p className="product__short">{item.short}</p>

          {/* TODO: real rating once reviews are collected (same as the landing's). */}
          <Link className="product__rating" to="/#avis">
            <span className="product__stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((s) => (
                <StarIcon key={s} />
              ))}
            </span>
            4,9 / 5 · 120 avis
          </Link>

          <p className="price product__price">{formatPrice(item.price)}</p>

          <dl className="product__specs">
            <div>
              <dt>Poids</dt>
              <dd>{item.weight}</dd>
            </div>
            <div>
              <dt>Portions</dt>
              <dd>{item.portions}</dd>
            </div>
            <div>
              <dt>Prêt en</dt>
              <dd>{item.ready}</dd>
            </div>
          </dl>

          {item.contents && (
            <div className="product__contents">
              <h2 className="product__subhead">Dans le pack</h2>
              <ul>
                {item.contents.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="product__buy" ref={buyRef}>
            {soldOut ? (
              <p className="notice">Bientôt de retour. Cette boîte est en rupture de stock pour l'instant.</p>
            ) : (
              <>
                <QuantityStepper id="qty" label={item.name} value={qty} max={max} onChange={setQty} />
                <button type="button" className="btn-chip product__add" onClick={add}>
                  Ajouter au panier
                  <ArrowRightIcon />
                </button>
              </>
            )}
          </div>
          <p className="product__stock">
            {soldOut ? '' : item.stock < 10 ? `Plus que ${item.stock} en stock. ` : 'En stock. '}
            {inCart > 0 && (
              <>
                {inCart} dans votre panier ·{' '}
                <Link className="link" to="/panier">
                  Voir le panier
                </Link>
              </>
            )}
          </p>

          <p className="product__delivery">
            <TruckIcon />
            <span>
              Livraison offerte dès 60 $ dans le Grand Montréal.{' '}
              <Link className="link" to="/livraison">
                Délais et zones
              </Link>
            </span>
          </p>
        </div>
      </div>

      <section className="product__details" aria-label="Détails du produit">
        <details open>
          <summary>Description</summary>
          <p>{item.description}</p>
        </details>
        <details>
          <summary>Ingrédients</summary>
          <p>{item.ingredients}</p>
        </details>
        <details>
          <summary>Préparation</summary>
          <ol>
            {item.preparation.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </details>
        <details>
          <summary>Allergènes et conservation</summary>
          <p>{item.allergens}</p>
          <p>Se garde 3 mois au congélateur, à −18 °C. Ne pas recongeler après décongélation.</p>
        </details>
      </section>

      <section className="product__related" aria-labelledby="related-title">
        <div className="section__head">
          <h2 className="section__title" id="related-title">
            Vous aimerez aussi
          </h2>
        </div>
        <ul className="product-grid">
          {related.map((p, i) => (
            <li key={p.id} style={{ '--i': i } as React.CSSProperties}>
              <ProductCard item={p} />
            </li>
          ))}
        </ul>
      </section>

      {!soldOut && (
        <div className="product__bar" data-show={showBar} aria-hidden={!showBar}>
          <span className="product__bar-name">{item.name}</span>
          <span className="price">{formatPrice(item.price * qty)}</span>
          <button type="button" className="btn-chip" onClick={add} tabIndex={showBar ? 0 : -1}>
            Ajouter
          </button>
        </div>
      )}
    </main>
  )
}
