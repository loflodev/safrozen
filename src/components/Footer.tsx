import { useRef } from 'react'
import { Link } from 'react-router'
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TikTokIcon } from './icons'
import { useReveal } from './reveal'
import './Footer.css'

const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/recettes', label: 'Recettes' },
  { href: '/notre-histoire', label: 'Histoire' },
  { href: '/contact', label: 'Contact' },
]

// WooCommerce's customer pages and the store's information pages.
const HELP = [
  { href: '/points-de-vente', label: 'Trouver un magasin' },
  { href: '/suivi', label: 'Suivi de commande' },
  { href: '/mon-compte', label: 'Mon compte' },
  { href: '/livraison', label: 'Livraison' },
  { href: '/faq', label: 'Questions fréquentes' },
  { href: '/retours', label: 'Retours' },
]

// TODO: real profile URLs and contact details.
const SOCIALS = [
  { href: '#', label: 'TikTok', Icon: TikTokIcon },
  { href: '#', label: 'Facebook', Icon: FacebookIcon },
  { href: '#', label: 'Instagram', Icon: InstagramIcon },
]

const WORDMARK = 'Legim Express'

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  useReveal(footerRef)

  return (
    <footer id="contact" className="footer" ref={footerRef}>
      <div className="footer__grid">
        <div className="footer__col footer__about" style={{ '--i': 0 } as React.CSSProperties}>
          <img
            className="footer__logo"
            src="/images/logo-256.webp"
            srcSet="/images/logo-128.webp 128w, /images/logo-256.webp 256w"
            sizes="88px"
            alt="Legim Express"
            width={257}
            height={257}
            loading="lazy"
          />
          <p className="footer__text">
            Des légumes mijotés à l'haïtienne, précuits et congelés, prêts en 20 minutes.
          </p>
        </div>

        <nav className="footer__col" aria-labelledby="footer-nav" style={{ '--i': 1 } as React.CSSProperties}>
          <h2 className="footer__heading" id="footer-nav">
            Navigation
          </h2>
          <ul className="footer__list">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link className="footer__link" to={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-labelledby="footer-help" style={{ '--i': 2 } as React.CSSProperties}>
          <h2 className="footer__heading" id="footer-help">
            Aide
          </h2>
          <ul className="footer__list">
            {HELP.map((l) => (
              <li key={l.href}>
                <Link className="footer__link" to={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col" style={{ '--i': 3 } as React.CSSProperties}>
          <h2 className="footer__heading">Contact</h2>
          <address className="footer__list footer__contact">
            <span>
              <PinIcon />
              Québec, Canada H1L 3A9
            </span>
            <a className="footer__link" href="tel:+14389698712">
              <PhoneIcon />
              +1 (438) 969 8712
            </a>
            <a className="footer__link" href="mailto:infos@safrozen.com">
              <MailIcon />
              infos@safrozen.com
            </a>
            <span>
              <ClockIcon />
              Du lundi au vendredi, 9 h à 17 h
            </span>
          </address>
        </div>

        <div className="footer__col" style={{ '--i': 4 } as React.CSSProperties}>
          <h2 className="footer__heading">Suivez-nous</h2>
          <ul className="footer__socials">
            {SOCIALS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a className="footer__social" href={href} aria-label={label}>
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="footer__wordmark" aria-hidden="true">
        {Array.from(WORDMARK).map((ch, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </p>

      <div className="footer__bottom">
        <p>© 2026 Les Aliments Safrozen Foods. Tous droits réservés.</p>
        <p className="footer__legal">
          <Link className="footer__link" to="/conditions-utilisation">
            Conditions d’utilisation
          </Link>
          <Link className="footer__link" to="/cgv">
            CGV
          </Link>
          <Link className="footer__link" to="/confidentialite">
            Confidentialité
          </Link>
        </p>
      </div>
    </footer>
  )
}
