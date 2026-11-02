import { STATUS_STEPS, type OrderStatus } from '../../shop/orders'
import { CheckIcon } from '../icons'
import './StatusTimeline.css'

// Order progress (tracking, order view): Reçue · Préparée · En livraison · Livrée.
export default function StatusTimeline({ status }: { status: OrderStatus }) {
  const at = STATUS_STEPS.findIndex((s) => s.id === status)
  return (
    <ol className="timeline">
      {STATUS_STEPS.map((s, i) => {
        const state = i < at ? 'done' : i === at ? 'current' : 'todo'
        return (
          <li key={s.id} className="timeline__step" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="timeline__dot" aria-hidden="true">
              {state !== 'todo' && <CheckIcon />}
            </span>
            <span className="timeline__label">
              {s.label}
              <span className="visually-hidden">{state === 'todo' ? ', à venir' : state === 'current' ? ', en cours' : ', terminé'}</span>
            </span>
            {state === 'current' && <span className="timeline__detail">{s.detail}</span>}
          </li>
        )
      })}
    </ol>
  )
}
