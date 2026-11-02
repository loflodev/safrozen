import type { ReactNode } from 'react'
import './EmptyState.css'

// A quiet panel for "nothing here yet" (empty cart, no orders, no results).
export default function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty panel">
      <div className="veg-texture" aria-hidden="true" />
      <h2 className="panel__title">{title}</h2>
      {children && <div className="empty__text">{children}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  )
}
