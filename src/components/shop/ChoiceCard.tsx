import type { ReactNode } from 'react'
import './ChoiceCard.css'

// Radio as a card (delivery and payment methods): label, detail and an aside
// (price). The whole card is the label, so it is one big target.
export default function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  label,
  detail,
  aside,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: ReactNode
  detail?: ReactNode
  aside?: ReactNode
}) {
  return (
    <label className="choice" data-checked={checked}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="choice__text">
        <span className="choice__label">{label}</span>
        {detail && <span className="choice__detail">{detail}</span>}
      </span>
      {aside && <span className="choice__aside">{aside}</span>}
    </label>
  )
}
