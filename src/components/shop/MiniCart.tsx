import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart } from '../../shop/cart'
import { formatPrice, plural } from '../../shop/format'
import { ArrowRightIcon, CloseIcon, TrashIcon } from '../icons'
import ProductArt from './ProductArt'
import QuantityStepper from './QuantityStepper'
import { useSwipeClose } from './swipeClose'
import './MiniCart.css'

// Mini-cart drawer from the navbar's cart chip. A modal <dialog>, so focus is
// trapped and Escape closes it natively; a click on the backdrop closes it too,
// and on touch screens it swipes away to the right (swipeClose.ts).
export default function MiniCart() {
  const cart = useCart()
  const ref = useRef<HTMLDialogElement>(null)
  const { pathname } = useLocation()
  const { count, subtotal } = cart.totals()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (cart.drawerOpen && !d.open) d.showModal()
    if (!cart.drawerOpen && d.open) d.close()
  }, [cart.drawerOpen])

  // Any navigation closes it.
  const { setDrawerOpen } = cart
  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen])

  const close = () => cart.setDrawerOpen(false)
  useSwipeClose(ref, close)

  return (
    <dialog
      ref={ref}
      className="minicart"
      aria-labelledby="minicart-title"
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="minicart__inner">
        <header className="minicart__head">
          <h2 className="panel__title" id="minicart-title">
            Votre panier <span className="minicart__count">({plural(count, 'article')})</span>
          </h2>
          <button type="button" className="minicart__close" onClick={close} aria-label="Fermer le panier">
            <CloseIcon />
          </button>
        </header>

        {cart.items.length === 0 ? (
          <div className="minicart__empty">
            <p>Votre panier est vide pour l'instant.</p>
            <Link className="btn-chip" to="/boutique" onClick={close}>
              Voir la boutique
              <ArrowRightIcon />
            </Link>
          </div>
        ) : (
          <>
            <ul className="minicart__lines">
              {cart.items.map(({ id, quantity, product }) => (
                <li key={id} className="minicart__line">
                  <ProductArt item={product} className="minicart__art" />
                  <div className="minicart__info">
                    <Link className="minicart__name" to={`/produit/${product.slug}`} onClick={close}>
                      {product.name}
                    </Link>
                    <span className="minicart__price">{formatPrice(product.price * quantity)}</span>
                    <div className="minicart__controls">
                      <QuantityStepper
                        id={`mini-qty-${id}`}
                        label={product.name}
                        value={quantity}
                        max={Math.min(20, product.stock)}
                        onChange={(n) => cart.setQuantity(id, n)}
                      />
                      <button type="button" className="minicart__remove" onClick={() => cart.remove(id)} aria-label={`Retirer ${product.name}`}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="minicart__foot">
              <p className="minicart__subtotal">
                <span>Sous-total</span>
                <span className="price">{formatPrice(subtotal)}</span>
              </p>
              <p className="field__help">Livraison et codes promo à l'étape suivante.</p>
              <Link className="btn-chip" to="/commande" onClick={close}>
                Commander
                <ArrowRightIcon />
              </Link>
              <Link className="btn-ghost" to="/panier" onClick={close}>
                Voir le panier
              </Link>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
