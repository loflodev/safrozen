import '../css/main.css'
import { initCart } from './cart'
import { initCrumbs } from './crumbs'
import { initReveals } from './reveal'

// Shared on every page: the navbar's mobile menu, the section entrances, the cart.

const nav = document.querySelector<HTMLElement>('.nav')
const toggle = nav?.querySelector<HTMLButtonElement>('.nav__toggle')

const setOpen = (open: boolean) => {
  if (!nav || !toggle) return
  nav.dataset.open = String(open)
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu')
  toggle.querySelector('[data-icon="menu"]')?.toggleAttribute('hidden', open)
  toggle.querySelector('[data-icon="close"]')?.toggleAttribute('hidden', !open)
}

toggle?.addEventListener('click', () => setOpen(nav?.dataset.open !== 'true'))
// A link click (menu, logo, account) closes the panel; so does Escape.
nav?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setOpen(false)
})
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.dataset.open === 'true') setOpen(false)
})
document.addEventListener('safrozen:menu-close', () => setOpen(false))

// A select marked data-autosubmit (the shop's sort) applies as soon as it changes.
document.addEventListener('change', (e) => {
  const select = (e.target as HTMLElement).closest<HTMLSelectElement>('select[data-autosubmit]')
  select?.form?.requestSubmit()
})

initReveals()
initCrumbs()
initCart()
