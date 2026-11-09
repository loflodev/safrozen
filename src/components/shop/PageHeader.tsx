import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import './PageHeader.css'

export type Crumb = { to?: string; label: string }

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
      {crumbs && <Crumbs crumbs={crumbs} />}
      <div className="section__head page-header__head">
        <h1 className="section__title">{title}</h1>
        {lede && <p className="section__lede">{lede}</p>}
        {aside}
      </div>
    </header>
  )
}

// The breadcrumb trail on its own, for pages that place it apart from the title.
// Under 600px, with two or more crumbs after Accueil, the middle ones fold into
// a "…" button that opens them as a dropdown, so the trail keeps to one line.
export function Crumbs({ crumbs, className = '' }: { crumbs: Crumb[]; className?: string }) {
  const middle = crumbs.slice(0, -1)
  const current = crumbs[crumbs.length - 1]
  const foldable = crumbs.length >= 2
  const [open, setOpen] = useState(false)
  const moreRef = useRef<HTMLLIElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <nav className={`crumbs ${className}`} aria-label="Fil d'Ariane" data-foldable={foldable || undefined}>
      <ol>
        <li>
          <Link to="/">Accueil</Link>
        </li>
        {foldable && (
          <li className="crumbs__more" ref={moreRef}>
            <button
              ref={buttonRef}
              type="button"
              className="crumbs__toggle"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label="Afficher le chemin complet"
              onClick={() => setOpen((o) => !o)}
            >
              …
            </button>
            <ul className="crumbs__menu" id={menuId} hidden={!open}>
              {middle.map((c) => (
                <li key={c.label}>
                  {c.to ? (
                    <Link to={c.to} onClick={() => setOpen(false)}>
                      {c.label}
                    </Link>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        )}
        {middle.map((c) => (
          <li key={c.label} className="crumbs__mid">
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          </li>
        ))}
        <li className="crumbs__current">
          {current.to ? <Link to={current.to}>{current.label}</Link> : <span aria-current="page">{current.label}</span>}
        </li>
      </ol>
    </nav>
  )
}
