import { useEffect, useState } from 'react'
import { CartIcon, CloseIcon, FacebookIcon, InstagramIcon, MenuIcon, TikTokIcon } from './icons'
import './Navbar.css'

const LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#produits', label: 'Produit' },
  { href: '#recettes', label: 'Recette' },
  { href: '#histoire', label: 'Histoire' },
  { href: '#contact', label: 'Contact' },
]

// TODO: replace with the real profile URLs.
const SOCIALS = [
  { href: '#', label: 'TikTok', Icon: TikTokIcon },
  { href: '#', label: 'Facebook', Icon: FacebookIcon },
  { href: '#', label: 'Instagram', Icon: InstagramIcon },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const cartCount = 0

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="nav" data-open={open}>
      <a className="nav__brand" href="#accueil" aria-label="Legim Express, accueil" onClick={close}>
        <img
          className="nav__logo"
          src="/images/logo.png"
          alt=""
          width={257}
          height={257}
          decoding="async"
        />
      </a>

      <nav className="nav__menu nav__chip" id="nav-menu" aria-label="Principal">
        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a className="nav__pill" href={l.href} onClick={close}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav__end">
        <ul className="nav__socials nav__chip">
          {SOCIALS.map(({ href, label, Icon }) => (
            <li key={label}>
              <a className="nav__pill nav__icon" href={href} aria-label={label}>
                <Icon />
              </a>
            </li>
          ))}
        </ul>

        <a
          className="nav__chip nav__pill nav__icon nav__round"
          href="#panier"
          aria-label={`Panier, ${cartCount} article`}
        >
          <CartIcon />
          {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
        </a>

        <button
          type="button"
          className="nav__chip nav__pill nav__icon nav__round nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  )
}
