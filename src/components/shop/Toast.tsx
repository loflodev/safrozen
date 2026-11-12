import { useEffect, useState } from 'react'
import { useCart } from '../../shop/cart'
import { CheckIcon } from '../icons'
import './Toast.css'

const SHOW_MS = 4000

// "Ajouté au panier" toast, bottom centre. The live region is always in the
// page so screen readers announce each add; each notice gets its own pill.
export default function Toast() {
  const { notice } = useCart()

  return (
    <div className="toast-region" aria-live="polite">
      {notice && <Pill key={notice.key} text={notice.text} />}
    </div>
  )
}

// The timer waits while the mouse or focus is on the pill, then the pill
// leaves the way it came (down and out) before the notice is cleared.
function Pill({ text }: { text: string }) {
  const { dismissNotice, setDrawerOpen } = useCart()
  const [held, setHeld] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (held || leaving) return
    const t = window.setTimeout(() => setLeaving(true), SHOW_MS)
    return () => window.clearTimeout(t)
  }, [held, leaving])

  return (
    <div
      className="toast"
      data-leaving={leaving || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onAnimationEnd={() => leaving && dismissNotice()}
    >
      <span className="toast__icon" aria-hidden="true">
        <CheckIcon />
      </span>
      <span>{text}</span>
      <button
        type="button"
        className="toast__action"
        onClick={() => {
          dismissNotice()
          setDrawerOpen(true)
        }}
      >
        Voir le panier
      </button>
    </div>
  )
}
