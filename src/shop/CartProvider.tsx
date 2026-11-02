import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { byId, COUPONS } from './catalog'
import { CartContext, cartReducer, computeTotals, type Cart, type CartState } from './cart'
import { load, save } from './storage'

const KEY = 'legim:cart'

export default function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => load<CartState>(KEY, { lines: [], coupon: null }))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notice, setNotice] = useState<Cart['notice']>(null)

  useEffect(() => save(KEY, state), [state])

  const cart = useMemo<Cart>(
    () => ({
      ...state,
      items: state.lines.flatMap((l) => {
        const product = byId(l.id)
        return product ? [{ ...l, product }] : []
      }),
      totals: (deliveryId) => computeTotals(state, deliveryId),
      add: (id, quantity = 1) => {
        dispatch({ type: 'add', id, quantity })
        const name = byId(id)?.name
        if (name) setNotice({ text: `${name} ajouté au panier`, key: Date.now() })
      },
      setQuantity: (id, quantity) => dispatch({ type: 'set', id, quantity }),
      remove: (id) => dispatch({ type: 'remove', id }),
      applyCoupon: (code) => {
        const c = code.trim().toUpperCase()
        if (!COUPONS[c]) return false
        dispatch({ type: 'coupon', code: c })
        return true
      },
      removeCoupon: () => dispatch({ type: 'coupon', code: null }),
      clear: () => dispatch({ type: 'clear' }),
      drawerOpen,
      setDrawerOpen,
      notice,
      dismissNotice: () => setNotice(null),
    }),
    [state, drawerOpen, notice],
  )

  return <CartContext value={cart}>{children}</CartContext>
}
