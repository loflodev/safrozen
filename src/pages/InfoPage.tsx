import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowRightIcon, MailIcon } from '../components/icons'
import PageHeader from '../components/shop/PageHeader'
import { formatDate } from '../shop/format'
import { infoPage, type InfoBlock } from '../shop/pages'
import NotFound from './NotFound'
import './InfoPage.css'

// TODO: real contact details (same as the footer and the contact page).
const EMAIL = 'infos@safrozen.com'
const PHONE = '+1 (438) 969 8712'
const ADDRESS = 'Québec, Canada H1L 3A9'
const TOC_MIN = 3 // fewer headed sections read fine without a contents list

// "Témoins (cookies) et suivi" → "temoins-cookies-et-suivi", for the anchors.
const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const pad = (n: number) => String(n).padStart(2, '0') // taste-skill-ignore: numbered contents, by request

function Body({ blocks }: { blocks: InfoBlock[] }) {
  return blocks.map((b, i) =>
    typeof b === 'string' ? (
      <p key={i}>{b}</p>
    ) : (
      <ul key={i}>
        {b.map((li) => (
          <li key={li}>{li}</li>
        ))}
      </ul>
    ),
  )
}

// The heading the reader is in: the last one above 30% of the screen.
// `key` is the ids joined by spaces, so the effect only reruns when they change.
function useActiveHeading(key: string) {
  const [active, setActive] = useState<string>()
  useEffect(() => {
    const ids = key.split(' ').filter(Boolean)
    if (!ids.length) return
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key])
  return active
}

// Information pages (WordPress pages: notre histoire, livraison, FAQ, CGV, confidentialité,
// retours, mentions légales), one template reading pages.ts. The FAQ's sections are
// disclosures; the others read as an article: a numbered contents list beside the text
// (sticky from 900px) once there are TOC_MIN headed sections, and a contact card at the end.
export default function InfoPage() {
  const slug = useLocation().pathname.slice(1)
  const page = infoPage(slug)
  const headed = (page?.sections ?? []).flatMap((s) => (s.heading ? [{ id: slugify(s.heading), label: s.heading }] : []))
  const toc = slug !== 'faq' && headed.length >= TOC_MIN
  const active = useActiveHeading(toc ? headed.map((h) => h.id).join(' ') : '')
  if (!page) return <NotFound />

  return (
    <main id="main" className="page info">
      <div className="info__hero">
        <PageHeader
          crumbs={[{ label: page.title }]}
          title={page.title}
          aside={
            <div className="info__intro">
              <p className="section__lede">{page.lede}</p>
              {page.updated && (
                <p className="info__updated">
                  Dernière mise à jour : <time dateTime={page.updated}>{formatDate(page.updated)}</time>
                </p>
              )}
            </div>
          }
        />
      </div>
      {slug === 'faq' ? (
        <div className="info__faq">
          {page.sections.map((s, i) => (
            <details key={s.heading} open={i === 0}>
              <summary>{s.heading}</summary>
              <Body blocks={s.body} />
            </details>
          ))}
        </div>
      ) : (
        <div className="info__layout" data-toc={toc || undefined}>
          {toc && (
            <nav className="info__toc" aria-labelledby="info-toc-title">
              <p className="info__toc-title" id="info-toc-title">
                Sur cette page
              </p>
              <ol>
                {headed.map((h, i) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} aria-current={active === h.id ? 'location' : undefined}>
                      <span className="info__num" aria-hidden="true">
                        {pad(i + 1)}
                      </span>
                      {h.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="info__main">
            <article className="panel info__article" data-numbered={toc || undefined}>
              {page.sections.map((s, i) => (
                <section key={s.heading ?? i}>
                  {s.heading && (
                    <h2 id={slugify(s.heading)}>
                      {toc && (
                        <span className="info__num" aria-hidden="true">
                          {pad(headed.findIndex((h) => h.label === s.heading) + 1)}
                        </span>
                      )}
                      {s.heading}
                    </h2>
                  )}
                  <Body blocks={s.body} />
                </section>
              ))}
            </article>
            {page.contact && (
              <aside className="info__contact tint" aria-labelledby="info-contact-title">
                <span className="info__contact-icon" aria-hidden="true">
                  <MailIcon />
                </span>
                <h2 className="panel__title" id="info-contact-title">
                  {page.officer ? 'Nous joindre' : <>Une question sur cette page{' '}?</>}
                </h2>
                <dl className="info__facts">
                  {page.officer && (
                    <>
                      <div>
                        <dt>Responsable</dt>
                        <dd>{page.officer.name}</dd>
                      </div>
                      <div>
                        <dt>Fonction</dt>
                        <dd>{page.officer.role}</dd>
                      </div>
                    </>
                  )}
                  <div>
                    <dt>Courriel</dt>
                    <dd>
                      <a className="link" href={`mailto:${EMAIL}`}>
                        {EMAIL}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Téléphone</dt>
                    <dd>
                      <a className="link" href={`tel:+${PHONE.replace(/\D/g, '')}`}>
                        {PHONE}
                      </a>
                    </dd>
                  </div>
                  <div className="info__facts-wide">
                    <dt>Adresse postale</dt>
                    <dd>Les Aliments Safrozen Foods, {ADDRESS}</dd>
                  </div>
                </dl>
                <Link className="btn-chip" to="/contact">
                  Nous écrire
                  <ArrowRightIcon />
                </Link>
              </aside>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
