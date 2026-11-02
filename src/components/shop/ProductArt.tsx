import { fieldVars, type CatalogItem } from '../../shop/catalog'
import './ProductArt.css'

// A product on its hero field panel with the line texture (§11): the box is
// cropped 4:3 from its 2:1 canvas; pack photos sit whole inside the panel.
export default function ProductArt({
  item,
  size = 1280,
  eager = false,
  className = '',
}: {
  item: CatalogItem
  size?: 1280 | 2048
  eager?: boolean
  className?: string
}) {
  const src =
    item.imageKind === 'box' ? `/images/${item.image}-${size}.webp` : `/images/${item.image}-${size === 2048 ? 1280 : 640}.webp`
  return (
    <div className={`product-art product-art--${item.imageKind} ${className}`} style={fieldVars(item)}>
      <div className="product-art__texture" aria-hidden="true" />
      <img
        src={src}
        alt={`La boîte ${item.name}`}
        width={item.imageKind === 'box' ? 1280 : 640}
        height={item.imageKind === 'box' ? 640 : 640}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  )
}
