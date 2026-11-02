import { useCallback, useState, type ChangeEvent } from 'react'

// Small form state for the shop's forms (§17): validate on blur, all at once
// on submit, an error per field in French.
export type Validator<V> = (value: string, values: V) => string | null

export function useForm<V extends Record<string, string>>(initial: V, rules: Partial<Record<keyof V, Validator<V>>>) {
  const [values, setValues] = useState<V>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({})
  const [submitCount, setSubmitCount] = useState(0)

  const check = useCallback(
    (name: keyof V, all: V) => rules[name]?.(all[name] ?? '', all) ?? null,
    [rules],
  )

  const field = (name: keyof V & string) => ({
    id: name,
    name,
    value: values[name],
    error: errors[name],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const next = { ...values, [name]: e.target.value }
      setValues(next)
      // Once a field shows an error, clear it as soon as it is fixed.
      if (errors[name]) setErrors((er) => ({ ...er, [name]: check(name, next) ?? undefined }))
    },
    onBlur: () => {
      if (values[name] === '' && !errors[name]) return // don't scold an untouched empty field
      setErrors((er) => ({ ...er, [name]: check(name, values) ?? undefined }))
    },
  })

  // Validates everything; returns the errors in field order (for the summary).
  const validate = () => {
    const next: Partial<Record<keyof V, string>> = {}
    for (const name of Object.keys(rules) as (keyof V)[]) {
      const e = check(name, values)
      if (e) next[name] = e
    }
    setErrors(next)
    setSubmitCount((n) => n + 1)
    return (Object.keys(next) as (keyof V & string)[]).map((id) => ({ id, message: next[id]! }))
  }

  const set = (patch: Partial<V>) => setValues((v) => ({ ...v, ...patch }))

  return { values, errors, field, validate, set, submitCount, setErrors }
}

export const required =
  (message: string) =>
  (v: string): string | null =>
    v.trim() ? null : message

export const email = (v: string) =>
  !v.trim() ? 'Saisissez votre adresse e-mail.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Saisissez une adresse e-mail valide, par exemple nom@exemple.ca.'

export const phone = (v: string) =>
  !v.trim() ? 'Saisissez un numéro de téléphone.' : v.replace(/\D/g, '').length >= 10 ? null : 'Saisissez un numéro à 10 chiffres, par exemple 514 555-0142.'

export const postcode = (v: string) =>
  !v.trim() ? 'Saisissez votre code postal.' : /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(v.trim()) ? null : 'Saisissez un code postal canadien, par exemple H2T 1R2.'

export const password = (min: number) => (v: string) =>
  !v ? 'Saisissez un mot de passe.' : v.length >= min ? null : `Le mot de passe doit faire au moins ${min} caractères.`
