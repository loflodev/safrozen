import { MinusIcon, PlusIcon } from '../icons'
import './QuantityStepper.css'

// − n + pill. The number is a real input so it can be typed and read out.
export default function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
  label,
  id,
}: {
  value: number
  onChange: (n: number) => void
  max: number
  min?: number
  label: string
  id: string
}) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)))
  return (
    <div className="stepper">
      <button type="button" className="stepper__btn" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Retirer un, ${label}`}>
        <MinusIcon />
      </button>
      <label className="visually-hidden" htmlFor={id}>
        Quantité, {label}
      </label>
      <input
        id={id}
        className="stepper__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n) && e.target.value !== '') set(n)
        }}
      />
      <button type="button" className="stepper__btn" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`Ajouter un, ${label}`}>
        <PlusIcon />
      </button>
    </div>
  )
}
