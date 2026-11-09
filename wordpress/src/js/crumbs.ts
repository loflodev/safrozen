// The "…" crumb (Crumbs in PageHeader.tsx): under 600px it opens the folded
// middle crumbs as a dropdown; Escape or a press outside closes it.
export function initCrumbs(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.crumbs__more').forEach((more) => {
    const button = more.querySelector<HTMLButtonElement>('.crumbs__toggle')
    const menu = more.querySelector<HTMLElement>('.crumbs__menu')
    if (!button || !menu) return

    const setOpen = (open: boolean) => {
      button.setAttribute('aria-expanded', String(open))
      menu.hidden = !open
    }

    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'))
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || menu.hidden) return
      setOpen(false)
      button.focus()
    })
    window.addEventListener('pointerdown', (e) => {
      if (!menu.hidden && !more.contains(e.target as Node)) setOpen(false)
    })
  })
}
