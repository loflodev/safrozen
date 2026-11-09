/*
 * The − n + pill (QuantityStepper.tsx) on server-drawn pages: the buttons
 * step the real number input within its min and max and keep their own
 * disabled state; onChange gets the new value.
 */
export function initStepper(root: HTMLElement, onChange?: (n: number) => void) {
  const input = root.querySelector<HTMLInputElement>('.stepper__input')
  if (!input) return
  const [minus, plus] = [...root.querySelectorAll<HTMLButtonElement>('[data-step]')]
  const min = Number(input.min) || 1
  const max = Number(input.max) || Infinity
  const sync = () => {
    const n = Number(input.value)
    if (minus) minus.disabled = n <= min
    if (plus) plus.disabled = n >= max
  }
  root.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-step]')
    if (!btn) return
    const n = Math.max(min, Math.min(max, (Number(input.value) || min) + Number(btn.dataset.step)))
    input.value = String(n)
    sync()
    onChange?.(n)
  })
  input.addEventListener('input', () => {
    const n = Number(input.value)
    if (input.value === '' || !Number.isFinite(n)) return
    sync()
    onChange?.(Math.max(min, Math.min(max, n)))
  })
  // A typed value out of range comes back inside it.
  input.addEventListener('change', () => {
    input.value = String(Math.max(min, Math.min(max, Number(input.value) || min)))
    sync()
  })
  sync()
}
