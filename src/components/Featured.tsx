import { useRef } from 'react'
import { Link } from 'react-router'
import { byId } from '../shop/catalog'
import { useCart } from '../shop/cart'
import { formatPrice } from '../shop/format'
import { ArrowRightIcon } from './icons'
import { PRODUCTS } from './products'
import { useReveal } from './reveal'
import './Featured.css'

// Copy for the two best sellers; prices and links come from the catalogue.
const FEATURED = [
  {
    id: 'lalo',
    name: 'Legim Express au Lalo',
    text: "Feuilles de lalo, épinards et légumes du jardin, mijotés à l'haïtienne.",
    specs: [
      ['Poids', '500 g'],
      ['Portions', '4'],
      ['Prêt en', '20 min'],
    ],
  },
  {
    id: 'eggplant',
    name: "Legim Express à l'Aubergine",
    text: "Aubergine fondante, chou, carotte et tomate, mijotés à l'haïtienne.",
    specs: [
      ['Poids', '500 g'],
      ['Portions', '4'],
      ['Prêt en', '20 min'],
    ],
  },
]

type Item = (typeof FEATURED)[number]

// The panel takes its product's pastel field and line tint from the hero.
const fieldVars = (id: string) => {
  const product = PRODUCTS.find((p) => p.id === id)!
  return {
    ...Object.fromEntries(product.field.map((c, i) => [`--field-${i}`, c])),
    '--field-line': product.line,
  } as React.CSSProperties
}

// One split row: the field panel with the box, and the copy beside it. The
// rows are a screen apart, so each plays its own entrance.
function FeaturedRow({ item, index }: { item: Item; index: number }) {
  const rowRef = useRef<HTMLLIElement>(null)
  useReveal(rowRef)
  const cart = useCart()
  const product = byId(item.id)!

  return (
    <li className="featured__row" ref={rowRef} style={{ '--i': index } as React.CSSProperties}>
      {/* The frame carries the white stroke and the lift; the panel inside it clips for the circle entrance. */}
      <div className="featured__frame">
        <div className="featured__panel" style={fieldVars(item.id)}>
          <div className="featured__texture" aria-hidden="true" />
          <div className="featured__pic">
            <img
              src={`/images/${item.id}-box-1280.webp`}
              alt={`La boîte ${item.name}`}
              width={1280}
              height={640}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
      <div className="featured__copy">
        <h3 className="featured__line featured__name" style={{ '--j': 0 } as React.CSSProperties}>
          <Link className="featured__link" to={`/produit/${product.slug}`}>
            {item.name}
          </Link>
        </h3>
        <p className="featured__line featured__text" style={{ '--j': 1 } as React.CSSProperties}>
          {item.text}
        </p>
        <dl className="featured__line featured__specs" style={{ '--j': 2 } as React.CSSProperties}>
          {item.specs.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="featured__line featured__buy" style={{ '--j': 3 } as React.CSSProperties}>
          <p className="featured__price">{formatPrice(product.price)}</p>
          <button type="button" className="btn-chip" onClick={() => cart.add(product.id)}>
            Ajouter au panier
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </li>
  )
}

export default function Featured() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <section id="produits" className="section featured" ref={sectionRef} aria-labelledby="featured-title">
      <div className="section__head">
        <h2 className="section__title featured__title" id="featured-title">
          Nos meilleures ventes
        </h2>
      </div>

      <ul className="featured__list">
        {FEATURED.map((item, i) => (
          <FeaturedRow key={item.id} item={item} index={i} />
        ))}
      </ul>
    </section>
  )
}
