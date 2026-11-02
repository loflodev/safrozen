import { useRef } from 'react'
import { ArrowRightIcon } from './icons'
import { PRODUCTS } from './products'
import { useReveal } from './reveal'
import './Featured.css'

// TODO: real prices, weights and copy once the catalogue exists.
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
    price: '12,99 $',
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
    price: '12,99 $',
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

  return (
    <li className="featured__row" ref={rowRef} style={{ '--i': index } as React.CSSProperties}>
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
      <div className="featured__copy">
        <h3 className="featured__line featured__name" style={{ '--j': 0 } as React.CSSProperties}>
          {item.name}
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
          <p className="featured__price">{item.price}</p>
          <a className="btn-chip" href="#panier">
            Ajouter au panier
            <ArrowRightIcon />
          </a>
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
        <p className="section__lede featured__lede">Les deux favoris de nos clients, prêts quand vous l'êtes.</p>
      </div>

      <ul className="featured__list">
        {FEATURED.map((item, i) => (
          <FeaturedRow key={item.id} item={item} index={i} />
        ))}
      </ul>
    </section>
  )
}
