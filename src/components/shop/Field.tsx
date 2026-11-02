import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type Common = {
  id: string
  label: ReactNode
  error?: string
  help?: ReactNode
  optional?: boolean
  full?: boolean
}

type Props =
  | (Common & { as?: 'input' } & InputHTMLAttributes<HTMLInputElement>)
  | (Common & { as: 'select'; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>)
  | (Common & { as: 'textarea' } & TextareaHTMLAttributes<HTMLTextAreaElement>)

// Labelled control (§17): label above, help or error below, wired with
// aria-describedby and aria-invalid. Styles live in index.css (.field).
export default function Field(props: Props) {
  const { id, label, error, help, optional, full, as = 'input', ...rest } = props
  const describedBy = [error && `${id}-error`, help && `${id}-help`].filter(Boolean).join(' ') || undefined
  const control = {
    id,
    className: 'field__control',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': optional ? undefined : true,
  }
  return (
    <div className={`field${full ? ' field--full' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (facultatif)</span>}
      </label>
      {as === 'select' ? (
        <select {...control} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)} />
      ) : as === 'textarea' ? (
        <textarea {...control} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...control} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {help && (
        <p className="field__help" id={`${id}-help`}>
          {help}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
