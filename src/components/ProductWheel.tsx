import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { byId } from '../shop/catalog'
import { ArrowRightIcon } from './icons'
import { isNewScroll, SWIPE_THRESHOLD, WHEEL_THRESHOLD, type WheelSample } from './wheelIntent'
import './ProductWheel.css'
import { PRODUCTS, type Product } from './products'

const fieldVars = ({ field, line }: Product) =>
  ({
    ...Object.fromEntries(field.map((c, i) => [`--field-${i}`, c])),
    '--field-line': line,
  }) as React.CSSProperties

const DESCRIPTION = "Un mijoté de légumes traditionnellement cuits à l'haïtienne"

// How far boxes travel and shrink per step away from the centre.
const PAST_SHIFT = 22 // % of layer height, downwards
const NEXT_SHIFT = 10 // % of layer height, upwards (behind the current box)
const PAST_SCALE = 0.35
const NEXT_SCALE = 0.45
const MAX_BLUR = 10 // px

// A scroll on the box moves exactly one product, and the move always completes.
const STEP_MS = 800 // duration of one product-to-product move
const AUTOPLAY_MS = 2500 // the wheel turns by itself after resting this long

// Hovering the box: the box behind the current one peeks out above it.
const PEEK_MS = 200
const PEEK_OPACITY = 0.6
const PEEK_SHIFT = 9 // % of layer height, upwards

const imageSet = (id: string, kind: 'box' | 'background') =>
  `/images/${id}-${kind}-1280.webp 1280w, /images/${id}-${kind}-2048.webp 2048w`

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

const mod = (a: number, n: number) => ((a % n) + n) % n

// Signed distance from the wheel position, wrapped so the wheel is cyclic.
const wrap = (d: number, n: number) => {
  const m = mod(d, n)
  return m > n / 2 ? m - n : m
}

const onBox = (target: EventTarget | null) =>
  target instanceof Element && target.closest('.wheel__hit') !== null

export default function ProductWheel() {
  const sectionRef = useRef<HTMLElement>(null)
  const hitRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<HTMLParagraphElement>(null)
  const boxRefs = useRef<(HTMLImageElement | null)[]>([])
  const bgRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const hit = hitRef.current
    const stage = section?.firstElementChild as HTMLElement | null
    if (!section || !hit || !stage) return
    const n = PRODUCTS.length
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // As drawn: the wheel position (fractional while moving; it counts on past
    // the last product, the wheel is cyclic) and the peek.
    const view = { pos: 0, peek: 0 }
    let prod = 0 // product the wheel is at or moving to
    let animating = false
    let frame = 0
    let peekFrame = 0
    let wheelAcc = 0
    let wheelLog: WheelSample[] = [] // the wheel scroll in progress
    let gestureUsed = false // the current wheel scroll already moved the wheel
    let queued = 0 // direction of a scroll made during a move, played after it
    let touchY = 0
    let touchUsed = false
    let touchBox = false // the touch started on the box
    let hovered = false
    let touching = false
    let focused = false
    let finishTimer = 0
    let autoTimer = 0

    const paint = () => {
      // Drives the slow drift of the vegetable texture.
      if (!reduceMotion) section.style.setProperty('--drift', String(view.pos))

      PRODUCTS.forEach((_, i) => {
        const d = wrap(i - view.pos, n)
        const dist = Math.abs(d)
        const box = boxRefs.current[i]
        const bg = bgRefs.current[i]

        if (box) {
          // The next box (behind, above) shows a little while the box is hovered.
          const peek = d > 0 && d <= 1 ? view.peek * d : 0
          const shift = d < 0 ? dist * PAST_SHIFT : -dist * NEXT_SHIFT - peek * PEEK_SHIFT
          const scale = 1 - dist * (d < 0 ? PAST_SCALE : NEXT_SCALE)
          box.style.opacity = String(Math.max(0, 1 - dist) + peek * PEEK_OPACITY)
          box.style.zIndex = String(Math.round(100 - dist * 10))
          box.style.transform = reduceMotion
            ? 'none'
            : `translate3d(0, ${shift}%, 0) scale(${scale})`
          box.style.filter = reduceMotion ? 'none' : `blur(${Math.min(dist, 1) * MAX_BLUR}px)`
        }
        if (bg) {
          // The nearest background sits underneath at full strength and the
          // outgoing one fades over it, so the crossfade never dips in brightness.
          bg.style.opacity = String(Math.max(0, 1 - dist))
          bg.style.zIndex = String(Math.round(dist * 10))
        }
      })

      setActive(mod(Math.round(view.pos), n))
    }

    // Some of the hero is still on screen.
    const onScreen = () => section.getBoundingClientRect().bottom > 0

    // The wheel turns by itself while the hero is on screen, nobody is on the
    // box (mouse or finger) or in the hero (keyboard focus) and the tab is shown.
    const canAutoplay = () =>
      !reduceMotion && !animating && !hovered && !touching && !focused && !document.hidden && onScreen()

    const stopAutoplay = () => {
      window.clearTimeout(autoTimer)
      autoTimer = 0
    }

    const schedule = () => {
      stopAutoplay()
      if (!canAutoplay()) return
      autoTimer = window.setTimeout(() => {
        autoTimer = 0
        if (canAutoplay()) toProduct(prod + 1, true)
      }, AUTOPLAY_MS)
    }

    const finish = () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(finishTimer)
      view.pos = prod
      animating = false
      paint()
      const dir = queued
      queued = 0
      if (dir) toProduct(prod + dir)
      else schedule()
    }

    // Plays the move on its own clock, so it never stops half way. The timer
    // lands it even if frames pause (background tab, busy main thread).
    // Autoplay turns would be announced every few seconds, so only moves the
    // visitor makes reach the live region.
    const toProduct = (target: number, auto = false) => {
      liveRef.current?.setAttribute('aria-live', auto ? 'off' : 'polite')
      cancelAnimationFrame(frame)
      window.clearTimeout(finishTimer)
      stopAutoplay()
      prod = target
      const from = view.pos
      if (reduceMotion) {
        finish()
        return
      }
      animating = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / STEP_MS, 1)
        if (t >= 1) {
          finish()
          return
        }
        view.pos = from + (target - from) * easeInOutCubic(t)
        paint()
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      finishTimer = window.setTimeout(finish, STEP_MS + 150)
    }

    // One product per scroll on the box, endlessly both ways; anywhere else
    // the page scrolls as usual.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1)
      const now = performance.now()
      if (isNewScroll(wheelLog, now, Math.abs(dy))) {
        wheelLog = []
        gestureUsed = false
        wheelAcc = 0
      }
      wheelLog.push({ t: now, d: Math.abs(dy) })
      if (wheelLog.length > 64) wheelLog.shift()
      if (!onBox(e.target)) return
      e.preventDefault()
      // One move per scroll: the rest of it (spin, trackpad inertia) is swallowed.
      if (gestureUsed) return
      const dir = Math.sign(dy)
      if (!dir) return
      wheelAcc += dy
      if (Math.abs(wheelAcc) < WHEEL_THRESHOLD) return
      gestureUsed = true
      // A scroll made during a move plays right after it.
      if (animating) queued = dir
      else toProduct(prod + dir)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
      touchUsed = false
      // A finger on the box holds the wheel still; a swipe there turns it.
      touchBox = onBox(e.target)
      if (touchBox) {
        touching = true
        stopAutoplay()
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touching || e.touches.length) return
      touching = false
      schedule()
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!touchBox) return
      e.preventDefault()
      if (animating || touchUsed) return
      const dy = touchY - e.touches[0].clientY // positive = scrolling down
      if (Math.abs(dy) < SWIPE_THRESHOLD) return
      touchUsed = true
      toProduct(prod + Math.sign(dy))
    }

    // ←/→ turn the wheel while the hero is on screen.
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, button, [contenteditable]')) return
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
      if (!dir || !onScreen()) return
      e.preventDefault()
      if (!animating) toProduct(prod + dir)
    }

    // Autoplay stops once the hero has scrolled away and starts again on return.
    const onScroll = () => {
      if (!onScreen()) stopAutoplay()
      else if (!autoTimer) schedule()
    }

    // The peek has its own short clock, apart from the wheel's moves.
    const peekTo = (to: number) => {
      cancelAnimationFrame(peekFrame)
      if (reduceMotion) {
        view.peek = to
        paint()
        return
      }
      const from = view.peek
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / PEEK_MS, 1)
        view.peek = from + (to - from) * easeInOutCubic(t)
        paint()
        if (t < 1) peekFrame = requestAnimationFrame(tick)
      }
      peekFrame = requestAnimationFrame(tick)
    }

    // Mouse on the box: the wheel holds still and the box invites a scroll
    // (lift and bob in ProductWheel.css, the next box peeking out above it).
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      hovered = true
      stage.dataset.hover = ''
      stopAutoplay()
      peekTo(1)
    }

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !hovered) return
      hovered = false
      delete stage.dataset.hover
      peekTo(0)
      schedule()
    }

    const onFocusIn = () => {
      focused = true
      stopAutoplay()
    }

    const onFocusOut = (e: FocusEvent) => {
      if (section.contains(e.relatedTarget as Node | null)) return
      focused = false
      schedule()
    }

    paint()
    schedule()
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', schedule)
    hit.addEventListener('pointerenter', onEnter)
    hit.addEventListener('pointerleave', onLeave)
    section.addEventListener('focusin', onFocusIn)
    section.addEventListener('focusout', onFocusOut)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', schedule)
      hit.removeEventListener('pointerenter', onEnter)
      hit.removeEventListener('pointerleave', onLeave)
      section.removeEventListener('focusin', onFocusIn)
      section.removeEventListener('focusout', onFocusOut)
      window.clearTimeout(finishTimer)
      stopAutoplay()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(peekFrame)
    }
  }, [])

  const current = PRODUCTS[active]

  return (
    <section
      ref={sectionRef}
      id="accueil"
      className="wheel"
      aria-labelledby="hero-title"
    >
      <div className="wheel__stage">
        <div className="wheel__backgrounds" aria-hidden="true">
          {PRODUCTS.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                bgRefs.current[i] = el
              }}
              className="wheel__bg"
              style={fieldVars(p)}
            >
              <img
                className="wheel__bg-art"
                srcSet={imageSet(p.id, 'background')}
                sizes="(max-aspect-ratio: 5/4) 176vw, max(70vw, 140svh)"
                src={`/images/${p.id}-background-2048.webp`}
                alt=""
                decoding="async"
              />
              <div className="wheel__texture" />
            </div>
          ))}
        </div>

        <div className="wheel__layer">
          {/* Lifted and bobbed as one while the box is hovered (ProductWheel.css). */}
          <div className="wheel__boxes">
            {PRODUCTS.map((p, i) => (
              <img
                key={p.id}
                ref={(el) => {
                  boxRefs.current[i] = el
                }}
                className="wheel__box"
                srcSet={imageSet(p.id, 'box')}
                sizes="(max-aspect-ratio: 5/4) 176vw, max(70vw, 140svh)"
                src={`/images/${p.id}-box-2048.webp`}
                alt={i === active ? `Boîte Legim Express ${p.title}` : ''}
                aria-hidden={i !== active}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'auto'}
              />
            ))}
          </div>
          {/* Hover and touch area over the box artwork: a scroll here turns the wheel. */}
          <div ref={hitRef} className="wheel__hit" aria-hidden="true" />
        </div>

        <div className="hero">
          <h1 className="hero__heading" id="hero-title">
            <span className="hero__brand">Legim Express</span>
            <span className="hero__titles">
              {PRODUCTS.map((p, i) => (
                <span
                  key={p.id}
                  className="hero__title"
                  data-active={i === active}
                  aria-hidden={i !== active}
                >
                  {p.title}
                </span>
              ))}
            </span>
          </h1>
          <p key={current.id} className="hero__desc">
            {DESCRIPTION}
          </p>
          {/* TODO: per-product specs once the catalogue exists; all three match today. */}
          <p className="hero__specs">
            <span>500 g</span>
            <span>4 portions</span>
            <span>Prêt en 20 min</span>
          </p>
          {/* Orders the product on screen. */}
          <Link className="hero__cta" to={`/produit/${byId(current.id)?.slug ?? ''}`}>
            Commandez
            <ArrowRightIcon />
          </Link>
          <p ref={liveRef} className="visually-hidden" aria-live="polite">
            Legim Express {current.title}
          </p>
        </div>

        <ol className="wheel__dots" aria-hidden="true">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} className={i === active ? 'is-active' : undefined} />
          ))}
        </ol>
      </div>
    </section>
  )
}
