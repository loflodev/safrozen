import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRightIcon, ClockIcon, CloseIcon, PhoneIcon, PinIcon } from '../components/icons'
import Field from '../components/shop/Field'
import PageHeader from '../components/shop/PageHeader'
import StoreMap from '../components/shop/StoreMap'
import { postcode, useForm } from '../shop/form'
import { STORES, distanceKm, formatKm, geocodePostcode, mapsUrl, normalizePostcode, type LatLng } from '../shop/stores'
import './StoreLocator.css'

type Search =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'found'; origin: LatLng; label: string }
  | { state: 'error'; message: string }

const NEAREST = 3 // stores framed on the map after a search
const LISTED = 5 // cards shown before "Voir tous les magasins"
const geolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Store locator (WP: the locator plugin's page). The postal code lives in the
// URL (?code=H2T1R2), so a search can be shared and survives a reload.
export default function StoreLocator() {
  const [params, setParams] = useSearchParams()
  const code = params.get('code') ?? ''
  const form = useForm({ postcode: code ? normalizePostcode(code) : '' }, { postcode })
  // The last answer, keyed by what was asked (a postal code, or the position),
  // so a new question reads as loading until its own answer lands.
  const [result, setResult] = useState<{ key: string; search: Search } | null>(null)
  const [picked, setPicked] = useState<{ origin: LatLng | null; id: string } | null>(null)
  const [showAll, setShowAll] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  // The search the visitor just made (not one from the URL), by key: on phones,
  // the page jumps to the nearest store once its answer lands. Keyed because
  // the router writes ?code= a moment after the submit.
  const jumpRef = useRef<string | null>(null)
  const [asked, setAsked] = useState(0)
  const key = code ? `code:${code}` : 'geo'
  const search: Search =
    result?.key === key ? result.search : code && !postcode(code) ? { state: 'loading' } : { state: 'idle' }

  useEffect(() => {
    if (!code || postcode(code)) return
    const ctl = new AbortController()
    const answer = (search: Search) => setResult({ key: `code:${code}`, search })
    geocodePostcode(code, ctl.signal)
      .then((origin) =>
        answer(
          origin
            ? { state: 'found', origin, label: normalizePostcode(code) }
            : { state: 'error', message: `Nous ne trouvons pas le code postal ${normalizePostcode(code)}. Vérifiez-le, ou utilisez votre position.` },
        ),
      )
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError')
          answer({ state: 'error', message: 'La recherche ne répond pas pour le moment. Réessayez dans un instant.' })
      })
    return () => ctl.abort()
  }, [code])

  const origin = search.state === 'found' ? search.origin : null
  const stores = useMemo(
    () =>
      origin
        ? STORES.map((s) => ({ ...s, km: distanceKm(origin, s) })).sort((a, b) => a.km - b.km)
        : STORES.map((s) => ({ ...s, km: null as number | null })),
    [origin],
  )
  const nearest = useMemo(() => (origin ? stores.slice(0, NEAREST) : []), [origin, stores])
  // The store picked for this search, else the nearest one.
  const selectedId = picked && picked.origin === origin ? picked.id : (nearest[0]?.id ?? null)
  const select = (id: string) => setPicked({ origin, id })

  useEffect(() => {
    if (jumpRef.current !== key || search.state === 'loading' || search.state === 'idle') return
    jumpRef.current = null
    if (search.state !== 'found' || !matchMedia('(max-width: 899px)').matches) return
    ;(document.activeElement as HTMLElement | null)?.blur() // closes the phone keyboard
    listRef.current?.firstElementChild?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [key, search.state, asked])

  // The clear button: empties the field and drops the search (back to every store).
  const clear = () => {
    form.set({ postcode: '' })
    form.setErrors({})
    setParams({})
    setResult(null)
    setPicked(null)
    setShowAll(false)
    document.getElementById('postcode')?.focus()
  }

  const locateMe = () => {
    jumpRef.current = 'geo'
    setAsked((n) => n + 1)
    const answer = (search: Search) => setResult({ key: 'geo', search })
    setParams({}, { replace: true })
    form.set({ postcode: '' })
    answer({ state: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (p) => answer({ state: 'found', origin: { lat: p.coords.latitude, lng: p.coords.longitude }, label: 'votre position' }),
      () => answer({ state: 'error', message: 'Nous n’avons pas accès à votre position. Entrez plutôt votre code postal.' }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const showOnMap = (id: string) => {
    select(id)
    mapRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' })
  }

  const status =
    search.state === 'loading'
      ? 'Recherche en cours…'
      : search.state === 'found'
        ? `Le plus proche de ${search.label} : ${stores[0].name}, à ${formatKm(stores[0].km!)}.`
        : search.state === 'idle'
          ? `${STORES.length} épiceries partenaires ont nos produits au congélateur.`
          : ''

  return (
    <main className="page locator">
      <PageHeader
        crumbs={[{ label: 'Trouver un magasin' }]}
        title="Trouver un magasin"
        lede="Entrez votre code postal : nous vous montrons l’épicerie la plus proche qui a nos produits au congélateur."
      />

      <div className="locator__layout">
        <form
          className="panel locator__search"
          role="search"
          aria-label="Chercher un magasin"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (form.validate().length) return
            const next = normalizePostcode(form.values.postcode)
            form.set({ postcode: next })
            jumpRef.current = `code:${next.replace(' ', '')}`
            setAsked((n) => n + 1)
            setParams({ code: next.replace(' ', '') })
          }}
        >
          <Field
            label="Votre code postal"
            autoComplete="postal-code"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={7}
            help="Par exemple H2T 1R2."
            end={
              <button type="button" className="field__end" onClick={clear} hidden={!form.values.postcode} aria-label="Effacer le code postal et la recherche">
                <CloseIcon />
              </button>
            }
            {...form.field('postcode')}
          />
          <div className="locator__actions">
            <button type="submit" className="btn-chip" disabled={search.state === 'loading'}>
              {search.state === 'loading' ? 'Recherche…' : 'Chercher'}
              {search.state !== 'loading' && <ArrowRightIcon />}
            </button>
            {geolocation && (
              <button type="button" className="btn-ghost locator__geo" onClick={locateMe} disabled={search.state === 'loading'}>
                <PinIcon />
                Utiliser ma position
              </button>
            )}
          </div>
          {search.state === 'error' ? (
            <p className="notice notice--error" role="alert">
              {search.message}
            </p>
          ) : (
            <p className="locator__status" role="status">
              {status}
            </p>
          )}
        </form>

        <div className="locator__map" ref={mapRef}>
          <StoreMap stores={STORES} nearest={nearest} origin={origin} selectedId={selectedId} onSelect={select} />
        </div>

        <section className="locator__results" aria-labelledby="locator-results-title">
          <h2 className="visually-hidden" id="locator-results-title">
            {origin ? 'Magasins du plus proche au plus loin' : 'Tous les magasins'}
          </h2>
          <ol className="locator__list" ref={listRef}>
            {(showAll ? stores : stores.slice(0, LISTED)).map((s, i) => (
              <li key={s.id}>
                <article className={`store-card${s.id === selectedId ? ' store-card--selected' : ''}`} aria-current={s.id === selectedId || undefined}>
                  <div className="store-card__head">
                    <h3 className="store-card__name">{s.name}</h3>
                    {s.km !== null && (
                      <span className={`store-card__km${i === 0 ? ' store-card__km--nearest' : ''}`}>
                        {i === 0 && 'Le plus proche · '}
                        {formatKm(s.km)}
                      </span>
                    )}
                  </div>
                  <p className="store-card__line">
                    <PinIcon />
                    {s.address}, {s.city} {s.postcode}
                  </p>
                  {s.hours && (
                    <p className="store-card__line">
                      <ClockIcon />
                      {s.hours}
                    </p>
                  )}
                  {s.phone && (
                    <p className="store-card__line">
                      <PhoneIcon />
                      <a className="link" href={`tel:+1${s.phone.replace(/\D/g, '')}`}>
                        {s.phone}
                      </a>
                    </p>
                  )}
                  <div className="store-card__actions">
                    <a className="btn-chip" href={mapsUrl(s)} target="_blank" rel="noreferrer">
                      Itinéraire
                      <span className="visually-hidden"> vers {s.name} dans Google Maps (nouvel onglet)</span>
                      <ArrowRightIcon />
                    </a>
                    <button type="button" className="link store-card__show" onClick={() => showOnMap(s.id)}>
                      Voir sur la carte
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ol>
          {!showAll && stores.length > LISTED && (
            <button type="button" className="btn-ghost locator__more" onClick={() => setShowAll(true)}>
              Voir tous les magasins ({stores.length})
            </button>
          )}
        </section>
      </div>
    </main>
  )
}
