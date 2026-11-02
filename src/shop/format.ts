// Prices in Canadian dollars, French (Canada): "12,99 $".
const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' })
const day = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatPrice = (cents: number) => money.format(cents / 100)
// Dates are local calendar days ("2026-11-02"); parse them at local noon so
// no timezone shifts them to the day before.
export const formatDate = (iso: string) => day.format(new Date(`${iso.slice(0, 10)}T12:00`))

export const localDay = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 864e5)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` // taste-skill-ignore: ISO date
}
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`
