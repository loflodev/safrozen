import { createContext, useContext } from 'react'
import { byId, COUPONS, DELIVERY, type CatalogItem } from './catalog'

// Cart state, shaped like WooCommerce's (line items keyed by product, a
// coupon code, totals in cents) so it can move to the Store API later.
export type CartLine = { id: string; quantity: number }
export type CartState = { lines: CartLine[]; coupon: string | null }

export type CartTotals = {
  count: number
  subtotal: number
  discount: number
  delivery: number
  total: number
}

export type Cart = CartState & {
  items: (CartLine & { product: CatalogItem })[]
  totals: (deliveryId?: string) => CartTotals
  add: (id: string, quantity?: number) => void
  setQuantity: (id: string, quantity: number) => void
  remove: (id: string) => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  clear: () => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}

export const MAX_QTY = 20

export type CartAction =
  | { type: 'add'; id: string; quantity: number }
  | { type: 'set'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'coupon'; code: string | null }
  | { type: 'clear' }

const clampQty = (id: string, q: number) => Math.max(0, Math.min(q, MAX_QTY, byId(id)?.stock ?? 0))

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const line = state.lines.find((l) => l.id === action.id)
      const quantity = clampQty(action.id, (line?.quantity ?? 0) + action.quantity)
      if (quantity === 0) return state
      return line
        ? { ...state, lines: state.lines.map((l) => (l.id === action.id ? { ...l, quantity } : l)) }
        : { ...state, lines: [...state.lines, { id: action.id, quantity }] }
    }
    case 'set': {
      const quantity = clampQty(action.id, action.quantity)
      return quantity === 0
        ? { ...state, lines: state.lines.filter((l) => l.id !== action.id) }
        : { ...state, lines: state.lines.map((l) => (l.id === action.id ? { ...l, quantity } : l)) }
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) }
    case 'coupon':
      return { ...state, coupon: action.code }
    case 'clear':
      return { lines: [], coupon: null }
  }
}

export function computeTotals(state: CartState, deliveryId?: string): CartTotals {
  let count = 0
  let subtotal = 0
  for (const l of state.lines) {
    const p = byId(l.id)
    if (!p) continue
    count += l.quantity
    subtotal += p.price * l.quantity
  }
  const coupon = state.coupon ? COUPONS[state.coupon] : undefined
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0
  const method = DELIVERY.find((d) => d.id === deliveryId)
  const delivery = !method || (method.freeFrom !== undefined && subtotal - discount >= method.freeFrom) ? 0 : method.price
  return { count, subtotal, discount, delivery, total: subtotal - discount + delivery }
}

export const CartContext = createContext<Cart | null>(null)

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart outside CartProvider')
  return cart
}
