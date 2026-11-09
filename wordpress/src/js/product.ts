import '../css/product.css'
import type { CartEvent } from './cart'
import { initStepper } from './stepper'

// Product page (Product.tsx): the quantity stepper, the phones' sticky add bar
// (once the buy box has scrolled away) and the "n dans votre panier" line.
// Adding goes through js/cart.ts (form[data-add-form]).

const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' })

const form = document.querySelector<HTMLFormElement>('form[data-add-form]')
const bar = document.querySelector<HTMLElement>('.product__bar')
const barPrice = bar?.querySelector<HTMLElement>('.price')
const unit = Number(barPrice?.dataset.unit)

const stepper = form?.querySelector<HTMLElement>('.stepper')
if (stepper) {
  initStepper(stepper, (n) => {
    if (barPrice && unit) barPrice.textContent = money.format(unit * n)
  })
}

if (form && bar) {
  const button = bar.querySelector<HTMLButtonElement>('[data-bar-add]')
  button?.addEventListener('click', () => form.requestSubmit())
  new IntersectionObserver(([entry]) => {
    const show = !entry.isIntersecting && entry.boundingClientRect.top < 0
    bar.dataset.show = String(show)
    bar.setAttribute('aria-hidden', String(!show))
    button?.setAttribute('tabindex', show ? '0' : '-1')
  }).observe(form)
}

// The cart now holds n of this product.
const line = document.querySelector<HTMLElement>('.product__in-cart')
const id = Number(form?.dataset.addForm)
document.addEventListener('safrozen:cart', (e) => {
  if (!line || !id) return
  const n = (e as CartEvent).detail.cart.items.filter((i) => i.id === id).reduce((sum, i) => sum + i.quantity, 0)
  line.hidden = n === 0
  const label = line.querySelector('[data-in-cart-label]')
  if (label) label.textContent = `${n} dans votre panier`
})
