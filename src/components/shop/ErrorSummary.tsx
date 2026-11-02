import { useEffect, useRef } from 'react'

// Shown after a failed submit (§17): takes focus, links each error to its field.
// `attempt` changes on every submit, so focus moves again on a repeat failure.
export default function ErrorSummary({ errors, attempt }: { errors: { id: string; message: string }[]; attempt: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (errors.length) ref.current?.focus()
  }, [attempt, errors.length])
  if (!errors.length) return null
  return (
    <div className="notice notice--error" role="alert" tabIndex={-1} ref={ref} aria-labelledby="error-summary-title">
      <h2 className="notice__title" id="error-summary-title">
        {errors.length > 1 ? `${errors.length} champs sont à corriger` : 'Un champ est à corriger'}
      </h2>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                ev.preventDefault()
                document.getElementById(e.id)?.focus()
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
