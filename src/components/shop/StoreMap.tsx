import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapsUrl, type LatLng, type Store } from '../../shop/stores'
import './StoreMap.css'

const MONTREAL: L.LatLngExpression = [45.55, -73.65]

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

/*
 * Leaflet map on OpenStreetMap tiles. One-finger drag is off on touch screens
 * so the page still scrolls over the map; pinch and the +/- buttons zoom.
 */
export default function StoreMap({
  stores,
  nearest,
  origin,
  selectedId,
  onSelect,
}: {
  stores: Store[]
  nearest: Store[]
  origin: LatLng | null
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef(new Map<string, L.Marker>())
  const youRef = useRef<L.Marker | null>(null)
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  })

  useEffect(() => {
    const map = L.map(boxRef.current!, {
      center: MONTREAL,
      zoom: 10,
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    mapRef.current = map
    // Leaflet measures its box once; re-measure when the layout settles or changes.
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(boxRef.current!)
    const markers = markersRef.current
    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markers.clear()
      youRef.current = null
    }
  }, [])

  // One marker per store.
  useEffect(() => {
    const map = mapRef.current!
    const markers = markersRef.current
    for (const s of stores) {
      const m = L.marker([s.lat, s.lng], { icon: pinIcon(false), title: s.name, alt: s.name, keyboard: true })
        .bindPopup(popup(s), { closeButton: true })
        .on('click', () => onSelectRef.current(s.id))
        .addTo(map)
      markers.set(s.id, m)
    }
    return () => {
      markers.forEach((m) => m.remove())
      markers.clear()
    }
  }, [stores])

  // Every store at first; after a search, the visitor's point and the nearest stores.
  useEffect(() => {
    const map = mapRef.current!
    map.invalidateSize()
    youRef.current?.remove()
    youRef.current = null
    const points = (origin ? nearest : stores).map((s) => [s.lat, s.lng] as L.LatLngTuple)
    if (origin) {
      youRef.current = L.marker([origin.lat, origin.lng], { icon: youIcon, title: 'Votre position', alt: 'Votre position', zIndexOffset: 1000 }).addTo(map)
      points.push([origin.lat, origin.lng])
    }
    // No animation: the selected store's pan follows at once and would cut a zoom short.
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: origin ? 14 : 12, animate: false })
  }, [origin, nearest, stores])

  // The selected store: its pin turns ink, the map pans to it and opens its popup.
  useEffect(() => {
    markersRef.current.forEach((m, id) => m.setIcon(pinIcon(id === selectedId)))
    if (!selectedId) {
      mapRef.current!.closePopup()
      return
    }
    const m = markersRef.current.get(selectedId)
    if (!m) return
    mapRef.current!.panTo(m.getLatLng())
    m.openPopup()
  }, [selectedId, stores])

  return <div className="store-map" ref={boxRef} role="region" aria-label="Carte des magasins" />
}
