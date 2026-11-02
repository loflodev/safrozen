import { useRef } from 'react'
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TikTokIcon } from './icons'
import { useReveal } from './reveal'
import './Footer.css'

const LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#produits', label: 'Produits' },
  { href: '#recettes', label: 'Recettes' },
  { href: '#histoire', label: 'Histoire' },
  { href: '#contact', label: 'Contact' },
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
          <img className="footer__logo" src="/images/logo.png" alt="Legim Express" width={257} height={257} loading="lazy" />
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
                <a className="footer__link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col" style={{ '--i': 2 } as React.CSSProperties}>
          <h2 className="footer__heading">Contact</h2>
          <address className="footer__list footer__contact">
            <span>
              <PinIcon />
              1234, rue Jean-Talon Est, Montréal (Québec)
            </span>
            <a className="footer__link" href="tel:+15145550142">
              <PhoneIcon />
              514 555-0142
            </a>
            <a className="footer__link" href="mailto:bonjour@legimexpress.ca">
              <MailIcon />
              bonjour@legimexpress.ca
            </a>
            <span>
              <ClockIcon />
              Du lundi au vendredi, 9 h à 17 h
            </span>
          </address>
        </div>

        <div className="footer__col" style={{ '--i': 3 } as React.CSSProperties}>
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
        <p>© 2026 Les Aliments Safrozen. Tous droits réservés.</p>
        <p className="footer__legal">
          <a className="footer__link" href="#">
            Mentions légales
          </a>
          <a className="footer__link" href="#">
            Confidentialité
          </a>
        </p>
      </div>
    </footer>
  )
}
