// Store helpers of the React app's src/shop/stores.ts, for the store locator.
import { CONFIG } from './config'

export type LatLng = { lat: number; lng: number }

export type Store = LatLng & {
  id: string
  name: string
  address: string
  city: string
  postcode: string
  phone: string
  hours: string
}

// Great-circle distance in km.
export function distanceKm(a: LatLng, b: LatLng) {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

const km = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 1 })
export const formatKm = (d: number) => `${km.format(d < 10 ? d : Math.round(d))} km`

// Opens the store in Google Maps (app on phones, site elsewhere).
export const mapsUrl = (s: Store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${s.address}, ${s.city} ${s.postcode}`)}`

export const normalizePostcode = (v: string) => {
  const c = v.replace(/\s/g, '').toUpperCase()
  return `${c.slice(0, 3)} ${c.slice(3)}`
}

// The checkout's check (src/shop/form.ts postcode): an error, or null.
export const postcodeError = (v: string) =>
  !v.trim() ? 'Saisissez votre code postal.' : /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(v.trim()) ? null : 'Saisissez un code postal canadien, par exemple H2T 1R2.'

/*
 * Postal code → coordinates through the site (safrozen-core's /legim/v1/geocode:
 * Google's Geocoding API with the key of Réglages Legim, else OpenStreetMap).
 * Returns null when the code is unknown.
 */
export async function geocodePostcode(code: string, signal?: AbortSignal): Promise<LatLng | null> {
  const url = new URL(CONFIG.geocodeUrl)
  url.searchParams.set('code', normalizePostcode(code).replace(' ', ''))
  const res = await fetch(url, { signal })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`geocode ${res.status}`)
  return (await res.json()) as LatLng
}
