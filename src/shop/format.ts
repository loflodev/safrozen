// Prices in Canadian dollars, French (Canada): "12,99 $".
const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' })
const day = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatPrice = (cents: number) => money.format(cents / 100)
export const formatDate = (iso: string) => day.format(new Date(iso))
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`
