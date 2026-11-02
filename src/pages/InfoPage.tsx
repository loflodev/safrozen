import { useLocation } from 'react-router'
import PageHeader from '../components/shop/PageHeader'
import { formatDate } from '../shop/format'
import { infoPage } from '../shop/pages'
import NotFound from './NotFound'
import './InfoPage.css'

// Information pages (WordPress pages: livraison, FAQ, CGV, confidentialité,
// retours, mentions légales), one template reading pages.ts. The FAQ's
// sections are disclosures; the others read as an article.
export default function InfoPage() {
  const slug = useLocation().pathname.slice(1)
  const page = infoPage(slug)
  if (!page) return <NotFound />
  const faq = slug === 'faq'

  return (
    <main className="page info">
      <PageHeader crumbs={[{ label: page.title }]} title={page.title} lede={page.lede} />
      {faq ? (
        <div className="info__faq">
          {page.sections.map((s, i) => (
            <details key={s.heading} open={i === 0}>
              <summary>{s.heading}</summary>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </details>
          ))}
        </div>
      ) : (
        <article className="panel info__article">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          {page.updated && <p className="info__updated">Dernière mise à jour : {formatDate(page.updated)}</p>}
        </article>
      )}
    </main>
  )
}
