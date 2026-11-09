import '../css/account.css'
import { initAuth } from './auth'
import { initProvinceLists } from './address'
import { initForms } from './form'

// Mon compte and Suivi: the sign-in card's swap, the field checks, the nav's
// current pill, and the address form's province list, which follows the chosen country.

initAuth()
initForms()

// Phones: the nav is a sideways scroller, so bring the current section's pill into view.
const active = document.querySelector<HTMLElement>('.account__link.active')
const row = active?.closest('ul')
if (active && row && row.scrollWidth > row.clientWidth) {
  const [a, r] = [active.getBoundingClientRect(), row.getBoundingClientRect()]
  row.scrollLeft += a.left - r.left - (r.width - a.width) / 2
}

initProvinceLists()
