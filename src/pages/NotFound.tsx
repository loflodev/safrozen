import { Link } from 'react-router'
import { ArrowRightIcon } from '../components/icons'

export default function NotFound() {
  return (
    <main id="main" className="page">
      <div className="section__head">
        <h1 className="section__title">Page introuvable</h1>
        <p className="section__lede">Cette page n'existe pas ou a été déplacée.</p>
      </div>
      <Link className="btn-chip" to="/">
        Retour à l'accueil
        <ArrowRightIcon />
      </Link>
    </main>
  )
}
