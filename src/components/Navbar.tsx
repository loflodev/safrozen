import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useAccount } from '../shop/account'
import { useCart } from '../shop/cart'
import {
  BookIcon,
  BoxIcon,
  CartIcon,
  CloseIcon,
  FacebookIcon,
  HomeIcon,
  InstagramIcon,
  LeafIcon,
  LogoutIcon,
  MailIcon,
  MenuIcon,
  PinIcon,
  QuestionIcon,
  TikTokIcon,
  TruckIcon,
  UserIcon,
} from './icons'
import './Navbar.css'

// Hash links point at landing sections; off the landing they go to "/#…".
// Accueil is the home page; on the landing itself it scrolls back to the hero.
const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Produit' },
  { href: '/recettes', label: 'Recette' },
  { href: '/notre-histoire', label: 'Histoire' },
  { href: '/contact', label: 'Contact' },
]

type MenuItem = { href: string; label: string; Icon: typeof HomeIcon }

// The mobile panel (< 900px) lists every destination by category, each with an icon.
const GROUPS: { id: string; title: string; items: MenuItem[] }[] = [
  {
    id: 'decouvrir',
    title: 'Découvrir',
    items: [
      { href: '/', label: 'Accueil', Icon: HomeIcon },
      { href: '/boutique', label: 'Produits', Icon: BoxIcon },
      { href: '/recettes', label: 'Recettes', Icon: BookIcon },
      { href: '/notre-histoire', label: 'Notre histoire', Icon: LeafIcon },
    ],
  },
  {
    id: 'aide',
    title: 'Aide',
    items: [
      { href: '/suivi', label: 'Suivre ma commande', Icon: TruckIcon },
      { href: '/points-de-vente', label: 'Points de vente', Icon: PinIcon },
      { href: '/faq', label: 'FAQ', Icon: QuestionIcon },
      { href: '/contact', label: 'Contact', Icon: MailIcon },
    ],
  },
]

const ACCOUNT_IN: MenuItem[] = [
  { href: '/mon-compte', label: 'Mon compte', Icon: UserIcon },
  { href: '/mon-compte/deconnexion', label: 'Déconnexion', Icon: LogoutIcon },
]
const ACCOUNT_OUT: MenuItem[] = [{ href: '/mon-compte', label: 'Se connecter', Icon: UserIcon }]

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
  const to = (href: string) => {
    if (href === '/' && onHome) return '#accueil'
    return href.startsWith('#') && !onHome ? `/${href}` : href
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)
  const groups = [...GROUPS, { id: 'compte', title: 'Mon compte', items: user ? ACCOUNT_IN : ACCOUNT_OUT }]

  return (
    <header className="nav" data-open={open}>
      <Link className="nav__brand" to={onHome ? '#accueil' : '/'} aria-label="Legim Express, accueil" onClick={close}>
        <img
          className="nav__logo"
          src="/images/logo-256.webp"
          srcSet="/images/logo-128.webp 128w, /images/logo-256.webp 256w"
          sizes="(min-width: 900px) 112px, 72px"
          fetchPriority="high"
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
                <a className="nav__pill" href={to(l.href)} onClick={close}>
                  {l.label}
                </a>
              ) : (
                <Link className="nav__pill" to={to(l.href)} onClick={close}>
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="nav__groups">
          {groups.map((g) => (
            <section key={g.id} className="nav__group">
              <h2 className="nav__group-title" id={`nav-group-${g.id}`}>
                {g.title}
              </h2>
              <ul aria-labelledby={`nav-group-${g.id}`}>
                {g.items.map(({ href, label, Icon }) => (
                  <li key={href}>
                    {to(href).startsWith('#') ? (
                      <a className="nav__pill nav__item" href={to(href)} onClick={close}>
                        <Icon />
                        {label}
                      </a>
                    ) : (
                      <NavLink className="nav__pill nav__item" to={to(href)} end onClick={close}>
                        <Icon />
                        {label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
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
