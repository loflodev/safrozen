import type { ReactNode } from 'react'
import { Link } from 'react-router'
import './PageHeader.css'

type Crumb = { to?: string; label: string }

// Inner page header: breadcrumbs, the page's <h1> and a lede (or any aside)
// at the right from 900px, like the landing's section heads.
export default function PageHeader({
  title,
  lede,
  crumbs,
  aside,
}: {
  title: ReactNode
  lede?: ReactNode
  crumbs?: Crumb[]
  aside?: ReactNode
}) {
  return (
    <header className="page-header">
      {crumbs && (
        <nav className="crumbs" aria-label="Fil d'Ariane">
          <ol>
            <li>
              <Link to="/">Accueil</Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="section__head page-header__head">
        <h1 className="section__title">{title}</h1>
        {lede && <p className="section__lede">{lede}</p>}
        {aside}
      </div>
    </header>
  )
}
