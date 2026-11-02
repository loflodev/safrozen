import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAccount } from '../shop/account'
import { useCart } from '../shop/cart'
import { CartIcon, CloseIcon, FacebookIcon, InstagramIcon, MenuIcon, TikTokIcon, UserIcon } from './icons'
import './Navbar.css'

// Hash links point at landing sections; off the landing they go to "/#…".
const LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '/boutique', label: 'Produit' },
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
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const cart = useCart()
  const cartCount = cart.totals().count
  const { user } = useAccount()
  // The footer (#contact) is on every page, so its link stays a plain hash.
  const to = (href: string) => (href.startsWith('#') && !onHome && href !== '#contact' ? `/${href}` : href)

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
      <Link className="nav__brand" to={onHome ? '#accueil' : '/'} aria-label="Legim Express, accueil" onClick={close}>
        <img
          className="nav__logo"
          src="/images/logo.png"
          alt=""
          width={257}
          height={257}
          decoding="async"
        />
      </Link>

      <nav className="nav__menu nav__chip" id="nav-menu" aria-label="Principal">
        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              {to(l.href).startsWith('#') ? (
                <a className="nav__pill" href={l.href} onClick={close}>
                  {l.label}
                </a>
              ) : (
                <Link className="nav__pill" to={to(l.href)} onClick={close}>
                  {l.label}
                </Link>
              )}
            </li>
          ))}
          <li className="nav__menu-only">
            <Link className="nav__pill" to="/mon-compte" onClick={close}>
              Mon compte
            </Link>
          </li>
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

        <Link
          className="nav__chip nav__pill nav__icon nav__round nav__account"
          to="/mon-compte"
          aria-label={user ? `Mon compte, ${user.displayName}` : 'Mon compte, se connecter'}
          onClick={close}
        >
          <UserIcon />
        </Link>

        <Link
          className="nav__chip nav__pill nav__icon nav__round"
          to="/panier"
          aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}
          onClick={(e) => {
            // The chip opens the mini-cart; the link stays for new tabs and no-JS.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
            e.preventDefault()
            close()
            cart.setDrawerOpen(true)
          }}
        >
          <CartIcon />
          {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
        </Link>

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
