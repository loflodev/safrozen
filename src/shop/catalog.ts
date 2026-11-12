import { PRODUCTS } from '../components/products'

// TODO: mock catalogue (prices in cents) until the WooCommerce store exists.
// Field colours and line tints come from the hero's PRODUCTS (CLAUDE.md §1).
export type Category = 'plats' | 'packs'

export type CatalogItem = {
  id: string
  slug: string
  category: Category
  name: string
  short: string
  description: string
  price: number
  weight: string
  portions: string
  ready: string
  image: string // base name in /public/images, {image}-1280.webp
  imageKind: 'box' | 'photo'
  field: string[]
  line: string
  ingredients: string
  preparation: string[]
  allergens: string
  stock: number
  contents?: string[] // packs: the boxes inside
}

const field = (id: string) => PRODUCTS.find((p) => p.id === id)!
const PREP = [
  'Sortez la boîte du congélateur, sans la décongeler.',
  'Videz-la dans une casserole avec 125 ml d’eau.',
  'Couvrez et laissez mijoter 20 minutes à feu moyen, en remuant de temps en temps.',
  'Assaisonnez à votre goût et servez avec du riz blanc.',
]

export const CATALOG: CatalogItem[] = [
  {
    id: 'lalo',
    slug: 'legim-au-lalo',
    category: 'plats',
    name: 'Legim Express au Lalo',
    short: "Feuilles de lalo, épinards et légumes du jardin, mijotés à l'haïtienne.",
    description:
      "Notre legim le plus demandé : des feuilles de lalo et d'épinards fondantes, du chou, de la carotte et de l'aubergine, mijotés lentement comme à la maison. La base n'est pas épicée, pour que vous l'assaisonniez à votre goût.",
    price: 1299,
    weight: '500 g',
    portions: '4',
    ready: '20 min',
    image: 'lalo-box',
    imageKind: 'box',
    field: field('lalo').field,
    line: field('lalo').line,
    ingredients: 'Lalo (corète), épinards, chou, carotte, aubergine, oignon, ail, tomate, huile de tournesol, sel, thym.',
    preparation: PREP,
    allergens: 'Sans gluten. Préparé dans un atelier qui manipule des crustacés.',
    stock: 42,
  },
  {
    id: 'eggplant',
    slug: 'legim-a-l-aubergine',
    category: 'plats',
    name: "Legim Express à l'Aubergine",
    short: "Aubergine fondante, chou, carotte et tomate, mijotés à l'haïtienne.",
    description:
      "L'aubergine fond dans une sauce tomate douce avec le chou et la carotte. Un legim tout en rondeur qui accompagne aussi bien le riz que la banane plantain.",
    price: 1299,
    weight: '500 g',
    portions: '4',
    ready: '20 min',
    image: 'eggplant-box',
    imageKind: 'box',
    field: field('eggplant').field,
    line: field('eggplant').line,
    ingredients: 'Aubergine, chou, carotte, tomate, oignon, ail, poivron, huile de tournesol, sel, persil.',
    preparation: PREP,
    allergens: 'Sans gluten. Préparé dans un atelier qui manipule des crustacés.',
    stock: 30,
  },
  {
    id: 'chayotte',
    slug: 'legim-a-la-chayotte',
    category: 'plats',
    name: 'Legim Express à la Chayotte',
    short: 'Chayotte tendre, chou et carotte, le legim léger du dimanche.',
    description:
      "La chayotte, le chou et la carotte cuisent doucement jusqu'à devenir fondants. Le plus léger de nos produits, parfait avec du riz blanc et un avocat.",
    price: 1299,
    weight: '500 g',
    portions: '4',
    ready: '20 min',
    image: 'chayotte-box',
    imageKind: 'box',
    field: field('chayotte').field,
    line: field('chayotte').line,
    ingredients: 'Chayotte (mirliton), chou, carotte, oignon, ail, tomate, huile de tournesol, sel, thym.',
    preparation: PREP,
    allergens: 'Sans gluten. Préparé dans un atelier qui manipule des crustacés.',
    stock: 0,
  },
  {
    id: 'pack-decouverte',
    slug: 'pack-decouverte',
    category: 'packs',
    name: 'Pack découverte',
    short: 'Les trois legims, une boîte de chaque, pour trouver votre favori.',
    description:
      'Une boîte de chaque legim : lalo, aubergine et chayotte. Le meilleur moyen de goûter toute la gamme, à petit prix.',
    price: 3499,
    weight: '3 × 500 g',
    portions: '12',
    ready: '20 min',
    image: 'trio-eco',
    imageKind: 'photo',
    field: field('chayotte').field,
    line: field('chayotte').line,
    ingredients: 'Voir chaque legim.',
    preparation: PREP,
    allergens: 'Sans gluten. Préparé dans un atelier qui manipule des crustacés.',
    stock: 18,
    contents: ['Legim Express au Lalo', "Legim Express à l'Aubergine", 'Legim Express à la Chayotte'],
  },
  {
    id: 'pack-famille',
    slug: 'pack-famille',
    category: 'packs',
    name: 'Pack famille',
    short: 'Six boîtes au choix du chef, pour deux semaines de soupers rapides.',
    description:
      'Deux boîtes de chaque legim, de quoi préparer six soupers pour quatre. Se garde trois mois au congélateur.',
    price: 6499,
    weight: '6 × 500 g',
    portions: '24',
    ready: '20 min',
    image: '6pack-g',
    imageKind: 'photo',
    field: field('lalo').field,
    line: field('lalo').line,
    ingredients: 'Voir chaque legim.',
    preparation: PREP,
    allergens: 'Sans gluten. Préparé dans un atelier qui manipule des crustacés.',
    stock: 9,
    contents: ['2 × Legim Express au Lalo', "2 × Legim Express à l'Aubergine", '2 × Legim Express à la Chayotte'],
  },
]

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'plats', label: 'Plats' },
  { id: 'packs', label: 'Packs' },
]

export const byId = (id: string) => CATALOG.find((p) => p.id === id)
export const bySlug = (slug: string) => CATALOG.find((p) => p.slug === slug)

// The panel takes its product's pastel field and line tint from the hero.
export const fieldVars = (item: Pick<CatalogItem, 'field' | 'line'>) =>
  ({
    ...Object.fromEntries(item.field.map((c, i) => [`--field-${i}`, c])),
    '--field-line': item.line,
  }) as React.CSSProperties

// TODO: delivery methods and fees until the store's shipping zones exist.
export type DeliveryMethod = { id: string; label: string; detail: string; price: number; freeFrom?: number }
export const DELIVERY: DeliveryMethod[] = [
  { id: 'standard', label: 'Livraison standard', detail: 'Grand Montréal, en 2 à 3 jours ouvrables', price: 799, freeFrom: 6000 },
  { id: 'express', label: 'Livraison express', detail: 'Le lendemain, commandé avant 14 h', price: 1299 },
  { id: 'pickup', label: 'Cueillette', detail: 'Québec, H1L 3A9, dès le lendemain', price: 0 },
]

// TODO: payment methods are mocked; no payment is taken.
export const PAYMENT = [
  { id: 'card', label: 'Carte de crédit', detail: 'Visa, Mastercard, Amex' },
  { id: 'interac', label: 'Virement Interac', detail: 'Instructions envoyées par e-mail' },
  { id: 'cod', label: 'Paiement à la livraison', detail: 'Carte ou comptant, à la porte' },
]

// TODO: coupons until the store's are known.
export const COUPONS: Record<string, { label: string; percent: number }> = {
  BIENVENUE10: { label: '10 % sur la première commande', percent: 10 },
}
