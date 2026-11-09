import '../css/checkout.css'
import { initProvinceLists } from './address'
import type { CartEvent } from './cart'
import { check, show, summarize, type Control } from './form'
import { initStepper } from './stepper'

/*
 * Panier and Commande (Cart.tsx, Checkout.tsx) on WooCommerce's classic cart
 * and checkout. The cart page posts its one form (quantities once a stepper
 * rests, the coupon). The checkout keeps WooCommerce's checkout.js for what
 * it does (totals refresh, payment boxes, the order post) and adds the three
 * steps: one shows at a time, and each step's fields are checked before the
 * next opens. This module runs before checkout.js binds (modules run before
 * jQuery's ready), so its submit listener can stop an early Enter.
 */

type JQ = {
  (el: unknown): { on: (event: string, fn: (...args: unknown[]) => void) => void; trigger: (event: string) => void }
}
type CheckoutParams = { wc_ajax_url: string; apply_coupon_nonce: string; remove_coupon_nonce: string }

const jq = () => (window as unknown as { jQuery?: JQ }).jQuery
const updateCheckout = () => jq()?.(document.body).trigger('update_checkout')

const SEND_MS = 700 // the cart's quantities are posted once the stepper rests

/* --- Mini-cart ----------------------------------------------------------------------------------- */

// A change made in the drawer reloads the page when it closes, so the lines and totals follow.
let changed = false
document.addEventListener('safrozen:cart', (e) => {
  if ((e as CartEvent).detail.changed) changed = true
})
document.querySelector('.minicart')?.addEventListener('close', () => {
  if (changed) window.location.reload()
})

/* --- Panier -------------------------------------------------------------------------------------- */

const cartForm = document.querySelector<HTMLFormElement>('form[data-cart-form]')
if (cartForm) {
  const update = cartForm.querySelector<HTMLButtonElement>('[data-update-cart]')
  if (update) update.hidden = true
  let timer = 0
  cartForm.querySelectorAll<HTMLElement>('.stepper').forEach((stepper) =>
    initStepper(stepper, () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        cartForm.setAttribute('aria-busy', 'true')
        cartForm.requestSubmit(update)
      }, SEND_MS)
    }),
  )
  // Enter in the coupon field applies it (the form's first button is the update).
  const apply = cartForm.querySelector<HTMLButtonElement>('[name="apply_coupon"]')
  cartForm.querySelector('#coupon_code')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key !== 'Enter') return
    e.preventDefault()
    cartForm.requestSubmit(apply)
  })
}

/* --- Commande ------------------------------------------------------------------------------------ */

const form = document.querySelector<HTMLFormElement>('form[data-checkout]')
if (form) initCheckout(form)

function initCheckout(form: HTMLFormElement) {
  const sections = [...form.querySelectorAll<HTMLElement>('[data-step]')]
  const items = [...document.querySelectorAll<HTMLElement>('[data-steps] .steps__item')]
  const actions = form.querySelector<HTMLElement>('[data-step-actions]')
  const ship = form.querySelector<HTMLElement>('[data-ship]')
  const same = form.querySelector<HTMLInputElement>('[data-same-address]')
  const elsewhere = form.querySelector<HTMLInputElement>('#ship-to-different-address input')
  const sameBlock = form.querySelector<HTMLElement>('[data-same-block]')
  const shippingFields = form.querySelector<HTMLElement>('[data-shipping-fields]')
  let step = 0

  initProvinceLists(form)

  const render = () => {
    sections.forEach((s, i) => (s.hidden = i !== step))
    if (actions) actions.hidden = step === sections.length - 1
    actions?.querySelector<HTMLElement>('[data-back]')?.toggleAttribute('hidden', step === 0)
    document.querySelectorAll<HTMLElement>('[data-step-only]').forEach((el) => (el.hidden = Number(el.dataset.stepOnly) !== step))
    items.forEach((item, i) => {
      const state = i < step ? 'done' : i === step ? 'current' : 'todo'
      item.dataset.state = state
      const btn = item.querySelector<HTMLButtonElement>('button')!
      btn.disabled = i >= step
      if (state === 'current') btn.setAttribute('aria-current', 'step')
      else btn.removeAttribute('aria-current')
      item.querySelector('[data-done-label]')?.toggleAttribute('hidden', state !== 'done')
    })
  }

  // Focus moves to the new step's heading, so keyboard and screen reader users follow.
  const go = (n: number) => {
    step = n
    form.querySelector('[data-error-summary]')?.replaceChildren()
    render()
    const heading = sections[step].querySelector<HTMLElement>('.panel__title')
    heading?.focus({ preventScroll: true })
    const top = form.closest('.checkout__layout')?.getBoundingClientRect().top ?? 0
    if (top < 0) form.closest('.checkout__layout')?.scrollIntoView({ block: 'start' })
  }

  // A step's visible fields (a hidden shipping address or a pickup skips its fields).
  const controls = (i: number) =>
    [...sections[i].querySelectorAll<Control>('[data-rule]')].filter((el) => !el.closest('[hidden]'))

  const errorsOf = (i: number) =>
    controls(i)
      .map((el) => ({ el, message: check(el, form) }))
      .filter((x): x is { el: Control; message: string } => {
        show(x.el, x.message)
        return x.message !== null
      })

  const terms = () => form.querySelector<HTMLInputElement>('#terms')
  const termsError = () => {
    const box = terms()
    if (!box) return []
    const message = box.checked ? null : 'Acceptez les conditions générales de vente pour commander.'
    show(box, message)
    return message ? [{ el: box, message }] : []
  }

  // Each field is checked on blur and its error clears as soon as it's fixed (form.ts's rules).
  form.addEventListener('focusout', (e) => {
    const el = e.target as Control
    if (!el.dataset?.rule || (!el.value && !el.hasAttribute('aria-invalid'))) return
    show(el, check(el, form))
  })
  form.addEventListener('input', (e) => {
    const el = e.target as Control
    if (el.dataset?.rule && el.hasAttribute('aria-invalid')) show(el, check(el, form))
  })
  form.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement
    if (el.id === 'terms' && el.checked) show(el, null)
  })

  const next = () => {
    const errors = errorsOf(step)
    summarize(form, errors)
    if (!errors.length) go(step + 1)
  }

  form.querySelector('[data-next]')?.addEventListener('click', next)
  // Retour sits in the actions row and, on the last step, in the payment block (swapped by checkout.js).
  form.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-back]') && step > 0) go(step - 1)
  })
  items.forEach((item, i) => item.querySelector('button')?.addEventListener('click', () => i < step && go(i)))

  // Enter before the last step continues; "Payer" goes through only when every step is complete.
  form.addEventListener('submit', (e) => {
    const stop = () => {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    if (step < sections.length - 1) {
      stop()
      next()
      return
    }
    for (let i = 0; i < sections.length - 1; i++) {
      const errors = errorsOf(i)
      if (errors.length) {
        stop()
        go(i)
        summarize(form, errors)
        return
      }
    }
    const errors = [...errorsOf(step), ...termsError()]
    if (errors.length) {
      stop()
      summarize(form, errors)
      return
    }
    form.querySelector('[data-error-summary]')?.replaceChildren()
    const pay = form.querySelector<HTMLButtonElement>('#place_order')
    if (pay?.dataset.busy) pay.textContent = pay.dataset.busy
  })

  /* Delivery: same address or another one; a pickup needs neither. */

  const billingText = () => {
    const v = (k: string) => form.querySelector<Control>(`#billing_${k}`)
    const text = (k: string) => v(k)?.value.trim() ?? ''
    const state = v('state') as HTMLSelectElement | null
    const province = state?.selectedOptions[0]?.value ? state.selectedOptions[0].text : ''
    return [
      [text('first_name'), text('last_name')].filter(Boolean).join(' '),
      text('address_1'),
      text('address_2'),
      [text('city'), province, text('postcode').toUpperCase()].filter(Boolean).join(' '),
    ].filter(Boolean)
  }

  const syncShip = () => {
    const pickup = !!form.querySelector<HTMLInputElement>('input.shipping_method:checked[data-pickup]')
    if (ship) ship.hidden = pickup
    const isSame = same?.checked ?? true
    if (sameBlock) {
      sameBlock.hidden = !isSame
      sameBlock.replaceChildren(...billingText().flatMap((l, i) => (i ? [document.createElement('br'), l] : [l])))
    }
    if (shippingFields) shippingFields.hidden = isSame
  }

  same?.addEventListener('change', () => {
    if (elsewhere) {
      elsewhere.checked = !same.checked
      // checkout.js listens for this one (it decides which address the totals use).
      elsewhere.dispatchEvent(new Event('change', { bubbles: true }))
    }
    syncShip()
  })

  // Delivery depends on the address: Woo recalculates once a part of it changes.
  const ADDRESS = /^(billing|shipping)_(country|state|postcode|city)$/
  form.addEventListener('change', (e) => {
    const el = e.target as HTMLElement
    if (ADDRESS.test(el.id)) updateCheckout()
    if (el.matches('input.shipping_method')) syncShip()
  })

  /* Coupon (the summary's own form, outside the checkout form). */

  const params = (window as unknown as { wc_checkout_params?: CheckoutParams }).wc_checkout_params
  const couponForm = document.querySelector<HTMLFormElement>('form[data-coupon-form]')
  const couponMsg = couponForm?.querySelector<HTMLElement>('#coupon-msg')

  const couponCall = async (endpoint: 'apply_coupon' | 'remove_coupon', code: string) => {
    if (!params) return { ok: false, message: '' }
    const body = new URLSearchParams({
      security: endpoint === 'apply_coupon' ? params.apply_coupon_nonce : params.remove_coupon_nonce,
      coupon_code: code,
      coupon: code,
    })
    const res = await fetch(params.wc_ajax_url.replace('%%endpoint%%', endpoint), { method: 'POST', credentials: 'same-origin', body })
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const ok = res.ok && !doc.querySelector('.notice--error, .woocommerce-error')
    return { ok, message: doc.body.textContent?.trim() ?? '' }
  }

  couponForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = couponForm.querySelector<HTMLInputElement>('#coupon_code')!
    const code = input.value.trim()
    const say = (text: string, error: boolean) => {
      if (!couponMsg) return
      couponMsg.textContent = text
      couponMsg.className = error ? 'field__error' : 'field__help'
      if (error) input.setAttribute('aria-invalid', 'true')
      else input.removeAttribute('aria-invalid')
    }
    if (!code) return say('Saisissez un code promo.', true)
    couponForm.setAttribute('aria-busy', 'true')
    const { ok, message } = await couponCall('apply_coupon', code)
    couponForm.removeAttribute('aria-busy')
    say(ok ? message || 'Code appliqué.' : message || 'Ce code n’est pas valide.', !ok)
    if (ok) {
      input.value = ''
      updateCheckout()
    }
  })

  document.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-remove-coupon]')
    if (!btn) return
    btn.disabled = true
    await couponCall('remove_coupon', btn.dataset.removeCoupon ?? '')
    if (couponMsg) couponMsg.textContent = ''
    updateCheckout()
  })

  /* WooCommerce's events (jQuery). */

  const $ = jq()
  $?.(document.body).on('updated_checkout', () => {
    syncShip()
    if (couponForm) couponForm.hidden = !!document.querySelector('.summary__discount')
  })
  // The order post failed: open the step holding the first field named in Woo's errors.
  $?.(document.body).on('checkout_error', () => {
    const pay = form.querySelector<HTMLButtonElement>('#place_order')
    if (pay?.dataset.value) pay.textContent = pay.dataset.value
    const id = form.querySelector<HTMLElement>('.woocommerce-NoticeGroup-checkout [data-id]')?.dataset.id
    const field = id ? form.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null
    const at = field ? sections.findIndex((s) => s.contains(field)) : -1
    if (at >= 0 && at !== step) {
      step = at
      render()
    }
  })

  syncShip()
  render()
}
