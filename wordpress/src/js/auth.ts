/*
 * Mon compte, signed out (Login.tsx): the line under each form swaps the card
 * to the other mode (sign in ⇄ create an account). The CSS plays the slide and
 * the crossfade from data-mode; the hidden pane is inert and focus moves to
 * the new form's heading. The links point at #inscription / #connexion, which
 * also open the right side on arrival.
 */

type Mode = 'login' | 'register'

export function initAuth() {
  const card = document.querySelector<HTMLElement>('.auth-card[data-auth]')
  if (!card) return
  const panes = {
    login: card.querySelector<HTMLElement>('.auth-card__pane--login'),
    register: card.querySelector<HTMLElement>('.auth-card__pane--register'),
  }

  const set = (mode: Mode, focus: boolean) => {
    card.dataset.mode = mode
    panes.login?.toggleAttribute('inert', mode !== 'login')
    panes.register?.toggleAttribute('inert', mode !== 'register')
    if (focus) requestAnimationFrame(() => panes[mode]?.querySelector<HTMLElement>('.panel__title')?.focus({ preventScroll: true }))
  }

  if (location.hash === '#inscription') set('register', false)
  else if (location.hash === '#connexion') set('login', false)
  else set(card.dataset.mode === 'register' ? 'register' : 'login', false)
  card.dataset.authReady = ''

  card.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-auth-to]')
    if (!link) return
    e.preventDefault()
    const mode = link.dataset.authTo === 'register' ? 'register' : 'login'
    history.replaceState(null, '', mode === 'register' ? '#inscription' : location.pathname + location.search)
    set(mode, true)
  })
}
