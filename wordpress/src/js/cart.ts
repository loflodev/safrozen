import { CONFIG } from './config'
import { ICONS } from './icons'

/*
 * The cart lives in WooCommerce; the page talks to it through the Store API
 * (/wc/store/v1/cart). The navbar chip opens the mini-cart drawer (a modal
 * <dialog>, so focus is trapped and Escape closes it natively); add-to-cart
 * links ([data-add-to-cart]) and the product page's form ([data-add-form])
 * add without leaving the page and show a toast.
 * Without JS the chip is a link to the cart page and the add links use
 * WooCommerce's own ?add-to-cart= URLs.
 */

type Image = { src: string; srcset: string; sizes: string; alt: string }
export type Item = {
  key: string
  id: number
  quantity: number
  name: string
  permalink: string
  images: Image[]
  quantity_limits: { minimum: number; maximum: number }
  totals: { line_subtotal: string; currency_minor_unit: number }
  extensions: { safrozen?: { field: string[]; line: string; kind: 'box' | 'photo' } }
}
export type Cart = {
  items: Item[]
  items_count: number
  totals: { total_items: string; currency_minor_unit: number }
}

const SHOW_MS = 4000
// Quantities typed in the stepper are sent once typing pauses.
const TYPE_MS = 400

const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' })
const formatPrice = (minor: string, unit: number) => money.format(Number(minor) / 10 ** unit)
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`

// Store API names come HTML-encoded (&#039;); decode once, escape on output.
const decode = (s: string) => new DOMParser().parseFromString(s, 'text/html').documentElement.textContent ?? s
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]!)

let nonce = CONFIG.nonce
let cart: Cart | null = null

async function api(path: string, body?: object): Promise<Cart> {
  const res = await fetch(`${CONFIG.storeApi}${path}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Nonce: nonce },
    body: body ? JSON.stringify(body) : undefined,
  })
  nonce = res.headers.get('Nonce') ?? nonce
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ? decode(data.message) : 'Erreur du panier')
  return data
}

const dialog = document.querySelector<HTMLDialogElement>('.minicart')
const inner = dialog?.querySelector<HTMLElement>('.minicart__inner')
const toastRegion = document.querySelector<HTMLElement>('.toast-region')

function paintBadge(count: number) {
  document.querySelectorAll<HTMLAnchorElement>('[data-cart-open]').forEach((chip) => {
    chip.setAttribute('aria-label', `Panier, ${plural(count, 'article')}`)
    let badge = chip.querySelector('.nav__badge')
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span')
        badge.className = 'nav__badge'
        chip.append(badge)
      }
      badge.textContent = String(count)
    } else badge?.remove()
  })
}

// The product on its field panel, as ProductArt draws it on the shop pages.
function art(item: Item) {
  const image = item.images[0]
  const look = item.extensions.safrozen
  const vars = look
    ? [...look.field.map((c, i) => `--field-${i}:${c}`), `--field-line:${look.line}`].join(';')
    : ''
  return `<div class="product-art product-art--${look?.kind ?? 'box'} minicart__art" style="${esc(vars)}">
    <div class="product-art__texture" aria-hidden="true"></div>
    ${image ? `<img src="${esc(image.src)}" srcset="${esc(image.srcset)}" sizes="7rem" alt="La boîte ${esc(decode(item.name))}" loading="lazy" decoding="async">` : ''}
  </div>`
}

function line(item: Item) {
  const name = esc(decode(item.name))
  const max = Math.min(20, item.quantity_limits.maximum)
  const min = item.quantity_limits.minimum
  return `<li class="minicart__line" data-key="${esc(item.key)}">
    ${art(item)}
    <div class="minicart__info">
      <a class="minicart__name" href="${esc(item.permalink)}">${name}</a>
      <span class="minicart__price">${formatPrice(item.totals.line_subtotal, item.totals.currency_minor_unit)}</span>
      <div class="minicart__controls">
        <div class="stepper">
          <button type="button" class="stepper__btn" data-step="-1" ${item.quantity <= min ? 'disabled' : ''} aria-label="Retirer un, ${name}">${ICONS.minus}</button>
          <label class="visually-hidden" for="mini-qty-${item.id}">Quantité, ${name}</label>
          <input id="mini-qty-${item.id}" class="stepper__input" type="number" inputmode="numeric" min="${min}" max="${max}" value="${item.quantity}">
          <button type="button" class="stepper__btn" data-step="1" ${item.quantity >= max ? 'disabled' : ''} aria-label="Ajouter un, ${name}">${ICONS.plus}</button>
        </div>
        <button type="button" class="minicart__remove" data-remove aria-label="Retirer ${name}">${ICONS.trash}</button>
      </div>
    </div>
  </li>`
}

function paintDrawer() {
  if (!inner || !cart) return
  const count = cart.items_count
  const head = `<header class="minicart__head">
    <h2 class="panel__title" id="minicart-title">Votre panier <span class="minicart__count">(${plural(count, 'article')})</span></h2>
    <button type="button" class="minicart__close" data-cart-close aria-label="Fermer le panier">${ICONS.close}</button>
  </header>`
  inner.innerHTML = cart.items.length
    ? `${head}
      <ul class="minicart__lines">${cart.items.map(line).join('')}</ul>
      <footer class="minicart__foot">
        <p class="minicart__subtotal"><span>Sous-total</span><span class="price">${formatPrice(cart.totals.total_items, cart.totals.currency_minor_unit)}</span></p>
        <p class="field__help">Livraison et codes promo à l'étape suivante.</p>
        <a class="btn-chip" href="${esc(CONFIG.checkoutUrl)}">Commander ${ICONS.arrowRight}</a>
        <a class="btn-ghost" href="${esc(CONFIG.cartUrl)}">Voir le panier</a>
      </footer>`
    : `${head}
      <div class="minicart__empty">
        <p>Votre panier est vide pour l'instant.</p>
        <a class="btn-chip" href="${esc(CONFIG.shopUrl)}">Voir la boutique ${ICONS.arrowRight}</a>
      </div>`
}

// Pages that show the cart themselves (product, cart, checkout) follow it
// through this event; `changed` is false for a plain read.
export type CartEvent = CustomEvent<{ cart: Cart; changed: boolean }>

function setCart(next: Cart, changed = true) {
  cart = next
  paintBadge(next.items_count)
  paintDrawer()
  document.dispatchEvent(new CustomEvent('safrozen:cart', { detail: { cart: next, changed } }))
}

async function openDrawer() {
  if (!dialog) return
  if (!cart) setCart(await api('cart'), false)
  if (!dialog.open) dialog.showModal()
}

function toast(text: string) {
  if (!toastRegion) return
  window.clearTimeout(Number(toastRegion.dataset.timer))
  // A fresh element each time, so its entrance replays.
  toastRegion.innerHTML = `<div class="toast">
    <span class="toast__icon" aria-hidden="true">${ICONS.check}</span>
    <span>${esc(text)}</span>
    <button type="button" class="toast__action" data-toast-cart>Voir le panier</button>
  </div>`
  toastRegion.dataset.timer = String(window.setTimeout(() => (toastRegion.innerHTML = ''), SHOW_MS))
}

// Serialises cart writes, so quick taps on the stepper apply in order.
let queue = Promise.resolve()
const write = (path: string, body: object) => {
  const run = queue.then(async () => {
    inner?.setAttribute('aria-busy', 'true')
    try {
      setCart(await api(path, body))
    } catch (err) {
      toast((err as Error).message)
      setCart(await api('cart'), false)
    } finally {
      inner?.removeAttribute('aria-busy')
    }
  })
  queue = run.catch(() => {})
  return run
}

export function initCart() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const chip = target.closest<HTMLAnchorElement>('[data-cart-open]')
    if (chip) {
      // New tabs and modified clicks keep the link to the cart page.
      if (e.metaKey || e.ctrlKey || e.shiftKey || (e as MouseEvent).button !== 0 || !dialog) return
      e.preventDefault()
      document.dispatchEvent(new Event('safrozen:menu-close'))
      openDrawer()
      return
    }

    const add = target.closest<HTMLAnchorElement>('[data-add-to-cart]')
    if (add) {
      e.preventDefault()
      add.setAttribute('aria-disabled', 'true')
      api('cart/add-item', { id: Number(add.dataset.addToCart), quantity: 1 })
        .then((next) => {
          setCart(next)
          toast(`${add.dataset.productName} ajouté au panier`)
        })
        .catch((err: Error) => toast(err.message))
        .finally(() => add.removeAttribute('aria-disabled'))
      return
    }

    if (target.closest('[data-toast-cart]')) {
      if (toastRegion) toastRegion.innerHTML = ''
      openDrawer()
      return
    }

    if (!dialog?.contains(target)) return
    // A click on the backdrop (the dialog itself, outside its panel) closes it.
    if (target === dialog || target.closest('[data-cart-close]')) {
      dialog.close()
      return
    }
    const row = target.closest<HTMLElement>('.minicart__line')
    if (!row) return
    const key = row.dataset.key!
    if (target.closest('[data-remove]')) write('cart/remove-item', { key })
    const stepBtn = target.closest<HTMLButtonElement>('[data-step]')
    if (stepBtn) {
      const input = row.querySelector<HTMLInputElement>('.stepper__input')!
      const n = Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value) + Number(stepBtn.dataset.step)))
      input.value = String(n)
      write('cart/update-item', { key, quantity: n })
    }
  })

  // The product page's form (quantity + "Ajouter au panier"); without JS it posts to WooCommerce.
  document.addEventListener('submit', (e) => {
    const form = (e.target as HTMLElement).closest<HTMLFormElement>('form[data-add-form]')
    if (!form) return
    e.preventDefault()
    const button = form.querySelector<HTMLButtonElement>('[type="submit"]')
    if (button?.getAttribute('aria-disabled') === 'true') return
    const quantity = Math.max(1, Number(form.querySelector<HTMLInputElement>('[name="quantity"]')?.value) || 1)
    button?.setAttribute('aria-disabled', 'true')
    api('cart/add-item', { id: Number(form.dataset.addForm), quantity })
      .then((next) => {
        setCart(next)
        toast(`${form.dataset.productName} ajouté au panier`)
      })
      .catch((err: Error) => toast(err.message))
      .finally(() => button?.removeAttribute('aria-disabled'))
  })

  let typeTimer = 0
  dialog?.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement
    const key = input.closest<HTMLElement>('.minicart__line')?.dataset.key
    const n = Number(input.value)
    if (!key || input.value === '' || !Number.isFinite(n)) return
    window.clearTimeout(typeTimer)
    typeTimer = window.setTimeout(() => {
      write('cart/update-item', { key, quantity: Math.max(Number(input.min), Math.min(Number(input.max), n)) })
    }, TYPE_MS)
  })
}
