import type { CartTotals } from './cart'
import { localDay } from './format'
import { load, save } from './storage'

// Orders, shaped like WooCommerce's. TODO: mock history until the store exists;
// orders placed in this browser are kept in localStorage.
export type OrderStatus = 'received' | 'preparing' | 'shipped' | 'delivered'

export const STATUS_STEPS: { id: OrderStatus; label: string; detail: string }[] = [
  { id: 'received', label: 'Reçue', detail: 'Nous avons bien reçu votre commande.' },
  { id: 'preparing', label: 'Préparée', detail: 'Vos legims sont emballés au froid.' },
  { id: 'shipped', label: 'En livraison', detail: 'Le livreur est en route.' },
  { id: 'delivered', label: 'Livrée', detail: 'Bon appétit !' },
]

export type Address = {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  postcode: string
  phone?: string
}

export type Order = {
  id: string
  date: string
  status: OrderStatus
  email: string
  lines: { id: string; name: string; price: number; quantity: number }[]
  totals: CartTotals
  coupon: string | null
  billing: Address
  shipping: Address
  delivery: string
  payment: string
  note?: string
  eta: string
}

const KEY = 'legim:orders'

const DEMO_ADDRESS: Address = {
  firstName: 'Nadège',
  lastName: 'Pierre',
  address1: '4520, boulevard Saint-Laurent',
  address2: 'App. 3',
  city: 'Montréal',
  province: 'QC',
  postcode: 'H2T 1R2',
  phone: '514 555-0199',
}

const SEED: Order[] = [
  {
    id: '1041',
    date: '2026-10-29',
    status: 'shipped',
    email: 'demo@safrozen.com',
    lines: [
      { id: 'lalo', name: 'Legim Express au Lalo', price: 1299, quantity: 2 },
      { id: 'eggplant', name: "Legim Express à l'Aubergine", price: 1299, quantity: 1 },
    ],
    totals: { count: 3, subtotal: 3897, discount: 0, delivery: 799, total: 4696 },
    coupon: null,
    billing: DEMO_ADDRESS,
    shipping: DEMO_ADDRESS,
    delivery: 'standard',
    payment: 'card',
    eta: '2026-11-03',
  },
  {
    id: '1038',
    date: '2026-10-12',
    status: 'delivered',
    email: 'demo@safrozen.com',
    lines: [{ id: 'pack-famille', name: 'Pack famille', price: 6499, quantity: 1 }],
    totals: { count: 1, subtotal: 6499, discount: 0, delivery: 0, total: 6499 },
    coupon: null,
    billing: DEMO_ADDRESS,
    shipping: DEMO_ADDRESS,
    delivery: 'standard',
    payment: 'interac',
    eta: '2026-10-15',
  },
]

export const DEMO_ACCOUNT_ADDRESS = DEMO_ADDRESS

export function allOrders(): Order[] {
  return [...load<Order[]>(KEY, []), ...SEED]
}

export function placeOrder(order: Omit<Order, 'id' | 'date' | 'status'>): Order {
  const placed = load<Order[]>(KEY, [])
  const id = String(1042 + placed.length)
  const full: Order = { ...order, id, date: localDay(), status: 'received' }
  save(KEY, [full, ...placed])
  return full
}

export const findOrder = (id: string) => allOrders().find((o) => o.id === id.replace(/^#/, '').trim())

export const ordersFor = (email: string) =>
  allOrders().filter((o) => o.email.toLowerCase() === email.toLowerCase())

// Tracking asks for the e-mail too, like WooCommerce's order tracking form.
export const trackOrder = (id: string, email: string) => {
  const o = findOrder(id)
  return o && o.email.toLowerCase() === email.trim().toLowerCase() ? o : undefined
}
