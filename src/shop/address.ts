import { postcode, required, type Validator } from './form'
import type { Address } from './orders'

export const PROVINCES = [
  ['QC', 'Québec'],
  ['ON', 'Ontario'],
  ['NB', 'Nouveau-Brunswick'],
] as const

export const provinceName = (code: string) => PROVINCES.find(([c]) => c === code)?.[1] ?? code

const KEYS = ['firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postcode'] as const
export type AddressPrefix = 'billing' | 'shipping'

// Flat form values for an address, keyed `${prefix}_${field}` like WooCommerce's.
export const addressValues = (prefix: AddressPrefix, a?: Address | null) =>
  Object.fromEntries(KEYS.map((k) => [`${prefix}_${k}`, k === 'province' ? (a?.province ?? 'QC') : (a?.[k] ?? '')])) as Record<string, string>

export const addressNames = (prefix: AddressPrefix) => KEYS.filter((k) => k !== 'address2').map((k) => `${prefix}_${k}`)

export function addressRules<V extends Record<string, string>>(prefix: AddressPrefix): Record<string, Validator<V>> {
  return {
    [`${prefix}_firstName`]: required('Saisissez le prénom.'),
    [`${prefix}_lastName`]: required('Saisissez le nom.'),
    [`${prefix}_address1`]: required("Saisissez l'adresse, par exemple 4520, boulevard Saint-Laurent."),
    [`${prefix}_city`]: required('Saisissez la ville.'),
    [`${prefix}_province`]: required('Choisissez la province.'),
    [`${prefix}_postcode`]: postcode,
  }
}

export const toAddress = (prefix: AddressPrefix, v: Record<string, string>, phone?: string): Address => ({
  firstName: v[`${prefix}_firstName`].trim(),
  lastName: v[`${prefix}_lastName`].trim(),
  address1: v[`${prefix}_address1`].trim(),
  address2: v[`${prefix}_address2`]?.trim() || undefined,
  city: v[`${prefix}_city`].trim(),
  province: v[`${prefix}_province`],
  postcode: v[`${prefix}_postcode`].trim().toUpperCase().replace(/^(\w{3})\s*(\w{3})$/, '$1 $2'),
  phone,
})
