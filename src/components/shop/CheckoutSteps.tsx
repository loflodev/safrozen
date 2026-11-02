import { CheckIcon } from '../icons'
import './CheckoutSteps.css'

const CHECKOUT_STEPS = ['Coordonnées', 'Livraison', 'Paiement'] as const

// Three-step progress for the checkout. Done steps can be revisited.
export default function CheckoutSteps({ current, onGo }: { current: number; onGo: (step: number) => void }) {
  return (
    <ol className="steps" aria-label="Étapes de la commande">
      {CHECKOUT_STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={label} className="steps__item" data-state={state}>
            <button
              type="button"
              className="steps__btn"
              disabled={i >= current}
              aria-current={state === 'current' ? 'step' : undefined}
              onClick={() => onGo(i)}
            >
              <span className="steps__dot" aria-hidden="true">
                {state === 'done' ? <CheckIcon /> : i + 1}
              </span>
              <span className="steps__label">
                {label}
                {state === 'done' && <span className="visually-hidden"> (terminé, modifier)</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
