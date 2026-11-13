/*
 * Field checks for the theme's forms (src/shop/form.ts in the React app,
 * CLAUDE.md §17). A form opts in with data-validate; each control names its
 * check in data-rule (safrozen_form_field()). A field is checked on blur (an
 * untouched empty one is left alone), its error clears as soon as it is fixed,
 * and a submit with errors stops and shows the summary, which takes focus and
 * links each error to its field. The server checks everything again.
 */

export type Control = HTMLInputElement | HTMLSelectElement

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTCODE = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/

const isRequired = (el: Control) => el.getAttribute('aria-required') === 'true'
const byId = (form: HTMLFormElement, id: string) => form.querySelector<Control>(`#${CSS.escape(id)}`)

// What an empty required field says, by rule (others: its data-message).
const EMPTY: Record<string, string> = {
  email: 'Saisissez votre adresse e-mail.',
  postcode: 'Saisissez votre code postal.',
  phone: 'Saisissez un numéro de téléphone.',
  password: 'Saisissez un mot de passe.',
}

// A filled field's check, by rule: its error, or null.
const RULES: Record<string, (el: Control, v: string, form: HTMLFormElement, arg: string) => string | null> = {
  email: (_el, v) => (EMAIL.test(v.trim()) ? null : 'Saisissez une adresse e-mail valide, par exemple nom@exemple.ca.'),
  postcode: (el, v, form) => {
    // Only Canadian codes have a fixed shape here; Woo checks the others.
    const group = el.closest('[data-address]') ?? form
    const country = group.querySelector<HTMLSelectElement>('select[data-country]')?.value ?? 'CA'
    return country !== 'CA' || POSTCODE.test(v.trim()) ? null : 'Saisissez un code postal canadien, par exemple H2T 1R2.'
  },
  phone: (_el, v) => (v.replace(/\D/g, '').length >= 10 ? null : 'Saisissez un numéro à 10 chiffres, par exemple 514 555-0142.'),
  password: (el, v) => {
    const min = Number(el.dataset.min ?? 8)
    return v.length >= min ? null : `Le mot de passe doit faire au moins ${min} caractères.`
  },
  match: (_el, v, form, arg) => (v === (byId(form, arg)?.value ?? '') ? null : 'Les mots de passe ne correspondent pas.'),
}

export function check(el: Control, form: HTMLFormElement): string | null {
  const v = el.value
  const [rule = '', arg = ''] = (el.dataset.rule ?? '').split(':')
  if (rule === 'needed-by') {
    return !v && byId(form, arg)?.value ? (el.dataset.message ?? 'Ce champ est obligatoire.') : null
  }
  if (!v.trim()) {
    return isRequired(el) ? (EMPTY[rule] ?? el.dataset.message ?? 'Ce champ est obligatoire.') : null
  }
  return RULES[rule]?.(el, v, form, arg) ?? null
}

export function show(el: Control, message: string | null) {
  const field = el.closest('.field')
  if (!field) return
  const id = `${el.id}-error`
  let error = field.querySelector<HTMLElement>('.field__error')
  const described = (el.getAttribute('aria-describedby') ?? '').split(' ').filter((d) => d && d !== id)
  if (message) {
    if (!error) {
      error = document.createElement('p')
      error.className = 'field__error'
      error.id = id
      field.append(error)
    }
    error.textContent = message
    el.setAttribute('aria-invalid', 'true')
    described.push(id)
  } else {
    error?.remove()
    el.removeAttribute('aria-invalid')
  }
  if (described.length) el.setAttribute('aria-describedby', described.join(' '))
  else el.removeAttribute('aria-describedby')
}

/** Checks the controls, shows each one's error and returns the errors in order. */
export const validate = (controls: Control[], form: HTMLFormElement) =>
  controls
    .map((el) => ({ el, message: check(el, form) }))
    .filter((x): x is { el: Control; message: string } => {
      show(x.el, x.message)
      return x.message !== null
    })

export function summarize(form: HTMLFormElement, errors: { el: Control; message: string }[]) {
  const slot = form.querySelector<HTMLElement>('[data-error-summary]')
  if (!slot) return
  slot.replaceChildren()
  if (!errors.length) return
  const box = document.createElement('div')
  box.className = 'notice notice--error'
  box.setAttribute('role', 'alert')
  box.tabIndex = -1
  const title = document.createElement('h2')
  title.className = 'notice__title'
  title.textContent = errors.length > 1 ? `${errors.length} champs sont à corriger` : 'Un champ est à corriger'
  const list = document.createElement('ul')
  for (const { el, message } of errors) {
    const a = document.createElement('a')
    a.href = `#${el.id}`
    a.textContent = message
    a.addEventListener('click', (e) => {
      e.preventDefault()
      el.focus()
    })
    const li = document.createElement('li')
    li.append(a)
    list.append(li)
  }
  box.append(title, list)
  slot.append(box)
  box.focus()
}

function initForm(form: HTMLFormElement) {
  const controls = () => [...form.querySelectorAll<Control>('[data-rule]')].filter((el) => !el.closest('[inert]'))
  // Fixed fields drop out of the summary as soon as they are.
  const refresh = () => {
    const slot = form.querySelector('[data-error-summary] ul')
    if (!slot) return
    const errors = controls().filter((el) => el.hasAttribute('aria-invalid'))
    if (!errors.length) form.querySelector('[data-error-summary]')?.replaceChildren()
    else slot.querySelectorAll('a').forEach((a) => a.closest('li')?.toggleAttribute('hidden', !errors.some((el) => `#${el.id}` === a.getAttribute('href'))))
  }

  form.addEventListener('focusout', (e) => {
    const el = e.target as Control
    if (!el.dataset?.rule) return
    if (!el.value && !el.hasAttribute('aria-invalid')) return
    show(el, check(el, form))
    refresh()
  })
  form.addEventListener('input', (e) => {
    const el = e.target as Control
    if (!el.dataset?.rule || !el.hasAttribute('aria-invalid')) return
    show(el, check(el, form))
    refresh()
  })
  form.addEventListener('submit', (e) => {
    if (form.dataset.busy !== undefined) {
      e.preventDefault()
      return
    }
    const errors = validate(controls(), form)
    summarize(form, errors)
    if (errors.length) {
      e.preventDefault()
      return
    }
    // The button keeps its name and value in the post (Woo reads them), so it
    // only changes its label; a second submit is ignored.
    form.dataset.busy = ''
    const button = (e.submitter ?? form.querySelector('[type="submit"]')) as HTMLButtonElement | null
    if (button?.dataset.busy) {
      button.setAttribute('aria-disabled', 'true')
      button.textContent = button.dataset.busy
    }
  })
}

export const initForms = (root: ParentNode = document) =>
  root.querySelectorAll<HTMLFormElement>('form[data-validate]').forEach(initForm)
