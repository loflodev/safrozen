import { useEffect } from 'react'
import { useCart } from '../../shop/cart'
import { CheckIcon } from '../icons'
import './Toast.css'

const SHOW_MS = 4000

// "Ajouté au panier" toast, bottom centre. The live region is always in the
// page so screen readers announce each add; the visible pill fades out.
export default function Toast() {
  const { notice, dismissNotice, setDrawerOpen } = useCart()

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(dismissNotice, SHOW_MS)
    return () => window.clearTimeout(t)
  }, [notice, dismissNotice])

  return (
    <div className="toast-region" aria-live="polite">
      {notice && (
        <div className="toast" key={notice.key}>
          <span className="toast__icon" aria-hidden="true">
            <CheckIcon />
          </span>
          <span>{notice.text}</span>
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
      )}
    </div>
  )
}
