// Store locator (page-points-de-vente.php; StoreLocator.tsx + StoreMap.tsx): the
// Leaflet map, the postal code search (kept in the URL, ?code=H2T1R2, so a search
// can be shared and survives a reload) or the visitor's position, and the cards
// the page printed, reordered by distance.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../css/locator.css'
import { distanceKm, formatKm, geocodePostcode, mapsUrl, normalizePostcode, postcodeError, type LatLng, type Store } from './stores'

const NEAREST = 3 // stores framed on the map after a search
const LISTED = 5 // cards shown before "Voir tous les magasins"
const MONTREAL: L.LatLngExpression = [45.55, -73.65]
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Chip-gradient pins (white glyph); the visitor is an ink dot.
const PIN = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
const pinIcon = (active: boolean) =>
  L.divIcon({ className: '', html: `<span class="store-pin${active ? ' store-pin--active' : ''}">${PIN}</span>`, iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22] })
const youIcon = L.divIcon({ className: '', html: '<span class="store-you"></span>', iconSize: [22, 22], iconAnchor: [11, 11] })

// Popup: name, address and the Google Maps link, built as DOM (no HTML strings).
function popup(store: Store) {
  const el = document.createElement('div')
  el.className = 'store-popup'
  const name = el.appendChild(document.createElement('strong'))
  name.textContent = store.name
  const addr = el.appendChild(document.createElement('span'))
  addr.textContent = `${store.address}, ${store.city}`
  const link = el.appendChild(document.createElement('a'))
  link.href = mapsUrl(store)
  link.target = '_blank'
  link.rel = 'noreferrer'
  link.textContent = 'Ouvrir dans Google Maps'
  return el
}

const data = document.getElementById('locator-stores')
const root = document.querySelector<HTMLElement>('.locator')

if (data && root) {
  const stores: Store[] = JSON.parse(data.textContent || '[]')
  const form = root.querySelector<HTMLFormElement>('.locator__search')!
  const input = form.querySelector<HTMLInputElement>('#locator-postcode')!
  const clearButton = form.querySelector<HTMLButtonElement>('.locator__clear')!
  const submit = form.querySelector<HTMLButtonElement>('.locator__submit')!
  const submitLabel = submit.querySelector<HTMLElement>('.locator__submit-label')!
  const submitIcon = submit.querySelector('svg')
  const geo = form.querySelector<HTMLButtonElement>('.locator__geo')!
  const errorBox = form.querySelector<HTMLElement>('.locator__error')!
  const status = form.querySelector<HTMLElement>('.locator__status')!
  const mapBox = root.querySelector<HTMLElement>('.locator__map')!
  const list = root.querySelector<HTMLOListElement>('.locator__list')!
  const resultsTitle = root.querySelector<HTMLElement>('#locator-results-title')!
  const more = root.querySelector<HTMLButtonElement>('.locator__more')!
  const items = new Map([...list.querySelectorAll<HTMLLIElement>('li[data-id]')].map((li) => [li.dataset.id!, li]))
  const idle = status.textContent!.trim()

  let origin: LatLng | null = null
  let label = ''
  let showAll = false
  let asked = 0 // the latest question; older answers are dropped
  // Set by a search the visitor makes (not one from the URL): on phones, the
  // page then jumps to the nearest store once the answer lands.
  let jump = false
  let ctl: AbortController | null = null

  // --- Map (one-finger drag off on touch screens, so the page still scrolls) ---
  mapBox.hidden = false
  const map = L.map(mapBox.querySelector<HTMLElement>('.store-map')!, {
    center: MONTREAL,
    zoom: 10,
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
  })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  // Leaflet measures its box once; re-measure when the layout settles or changes.
  new ResizeObserver(() => map.invalidateSize()).observe(map.getContainer())
  const markers = new Map(
    stores.map((s) => [
      s.id,
      L.marker([s.lat, s.lng], { icon: pinIcon(false), title: s.name, alt: s.name, keyboard: true })
        .bindPopup(popup(s), { closeButton: true })
        .on('click', () => select(s.id, false))
        .addTo(map),
    ]),
  )
  let you: L.Marker | null = null

  const sorted = () =>
    origin ? stores.map((s) => ({ s, km: distanceKm(origin!, s) })).sort((a, b) => a.km - b.km) : stores.map((s) => ({ s, km: null as number | null }))

  // Every store at first; after a search, the visitor's point and the nearest stores.
  function frame() {
    map.invalidateSize()
    you?.remove()
    you = null
    const points = (origin ? sorted().slice(0, NEAREST).map((r) => r.s) : stores).map((s) => [s.lat, s.lng] as L.LatLngTuple)
    if (origin) {
      you = L.marker([origin.lat, origin.lng], { icon: youIcon, title: 'Votre position', alt: 'Votre position', zIndexOffset: 1000 }).addTo(map)
      points.push([origin.lat, origin.lng])
    }
    // No animation: the selected store's pan follows at once and would cut a zoom short.
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: origin ? 14 : 12, animate: false })
  }

  // The selected store: its pin turns ink, its card gets the ink ring, and the
  // map pans to it and opens its popup.
  function select(id: string | null, pan = true) {
    markers.forEach((m, key) => m.setIcon(pinIcon(key === id)))
    items.forEach((li, key) => {
      const card = li.querySelector('.store-card')!
      card.classList.toggle('store-card--selected', key === id)
      if (key === id) card.setAttribute('aria-current', 'true')
      else card.removeAttribute('aria-current')
    })
    const m = id ? markers.get(id) : null
    if (!id) map.closePopup()
    if (m && pan) {
      map.panTo(m.getLatLng())
      m.openPopup()
    }
  }

  // Cards in distance order (the nearest marked), the first five unless all were asked for.
  function render() {
    const rows = sorted()
    rows.forEach(({ s, km }, i) => {
      const li = items.get(s.id)
      if (!li) return
      list.append(li)
      li.hidden = !showAll && i >= LISTED
      const tag = li.querySelector<HTMLElement>('.store-card__km')!
      tag.hidden = km === null
      tag.classList.toggle('store-card__km--nearest', km !== null && i === 0)
      tag.textContent = km === null ? '' : `${i === 0 ? 'Le plus proche · ' : ''}${formatKm(km)}`
    })
    more.hidden = showAll || rows.length <= LISTED
    more.textContent = `Voir tous les magasins (${rows.length})`
    resultsTitle.textContent = origin ? 'Magasins du plus proche au plus loin' : 'Tous les magasins'
    const first = rows[0]
    if (origin && first) status.textContent = `Le plus proche de ${label} : ${first.s.name}, à ${formatKm(first.km!)}.`
  }

  function setLoading(loading: boolean) {
    submit.disabled = loading
    geo.disabled = loading
    submitLabel.textContent = loading ? 'Recherche…' : 'Chercher'
    if (submitIcon) submitIcon.style.display = loading ? 'none' : ''
    if (loading) {
      errorBox.hidden = true
      status.hidden = false
      status.textContent = 'Recherche en cours…'
    }
  }

  function fail(message: string) {
    jump = false
    setLoading(false)
    status.hidden = true
    errorBox.hidden = false
    errorBox.textContent = message
  }

  function found(point: LatLng, what: string) {
    setLoading(false)
    origin = point
    label = what
    showAll = false
    render()
    frame()
    select(sorted()[0]?.s.id ?? null)
    if (jump && matchMedia('(max-width: 899px)').matches) {
      input.blur() // closes the phone keyboard
      list.firstElementChild?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
    }
    jump = false
  }

  function reset() {
    ctl?.abort()
    asked++
    jump = false
    setLoading(false)
    origin = null
    showAll = false
    errorBox.hidden = true
    status.hidden = false
    status.textContent = idle
    render()
    frame()
    select(null)
  }

  // --- The postal code: Field.tsx's checks (on blur once filled, on submit) ---
  const fieldError = document.createElement('p')
  fieldError.className = 'field__error'
  fieldError.id = 'locator-postcode-error'
  const showFieldError = (message: string | null) => {
    if (message) {
      fieldError.textContent = message
      input.parentElement!.append(fieldError)
      input.setAttribute('aria-invalid', 'true')
      input.setAttribute('aria-describedby', 'locator-postcode-help locator-postcode-error')
    } else {
      fieldError.remove()
      input.removeAttribute('aria-invalid')
      input.setAttribute('aria-describedby', 'locator-postcode-help')
    }
  }
  input.addEventListener('blur', () => input.value.trim() && showFieldError(postcodeError(input.value)))
  input.addEventListener('input', () => {
    syncClear()
    if (input.hasAttribute('aria-invalid') && !postcodeError(input.value)) showFieldError(null)
  })

  // The clear button: empties the field and drops the search (back to every store).
  const syncClear = () => (clearButton.hidden = !input.value)
  clearButton.addEventListener('click', () => {
    input.value = ''
    syncClear()
    showFieldError(null)
    const url = new URL(location.href)
    if (url.searchParams.has('code')) {
      url.searchParams.delete('code')
      history.pushState(null, '', url)
    }
    reset()
    input.focus()
  })

  function searchCode(code: string) {
    ctl?.abort()
    const ask = ++asked
    ctl = new AbortController()
    const shown = normalizePostcode(code)
    input.value = shown
    syncClear()
    setLoading(true)
    geocodePostcode(code, ctl.signal)
      .then((point) => {
        if (ask !== asked) return
        if (point) found(point, shown)
        else fail(`Nous ne trouvons pas le code postal ${shown}. Vérifiez-le, ou utilisez votre position.`)
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError' && ask === asked) fail('La recherche ne répond pas pour le moment. Réessayez dans un instant.')
      })
  }

  // Runs the search the URL holds (on load and on back / forward).
  function fromUrl() {
    const code = new URLSearchParams(location.search).get('code') ?? ''
    if (code && !postcodeError(code)) searchCode(code)
    else {
      input.value = code
      syncClear()
      reset()
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = postcodeError(input.value)
    showFieldError(message)
    if (message) {
      input.focus()
      return
    }
    const code = normalizePostcode(input.value).replace(' ', '')
    const url = new URL(location.href)
    url.searchParams.set('code', code)
    history.pushState(null, '', url)
    jump = true
    searchCode(code)
  })
  addEventListener('popstate', fromUrl)

  if ('geolocation' in navigator) {
    geo.hidden = false
    geo.addEventListener('click', () => {
      ctl?.abort()
      const ask = ++asked
      const url = new URL(location.href)
      url.searchParams.delete('code')
      history.replaceState(null, '', url)
      input.value = ''
      syncClear()
      showFieldError(null)
      jump = true
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (p) => ask === asked && found({ lat: p.coords.latitude, lng: p.coords.longitude }, 'votre position'),
        () => ask === asked && fail('Nous n’avons pas accès à votre position. Entrez plutôt votre code postal.'),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      )
    })
  }

  items.forEach((li, id) => {
    const show = li.querySelector<HTMLButtonElement>('.store-card__show')!
    show.hidden = false
    show.addEventListener('click', () => {
      select(id)
      mapBox.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' })
    })
  })

  more.addEventListener('click', () => {
    showAll = true
    render()
  })

  fromUrl()
}
